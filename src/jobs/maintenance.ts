import { recoverPlayer } from '../domain/engine.js';
import { syncAchievements } from '../domain/competition-engine.js';
import { settleExpiredVersusMarket } from '../domain/versus-economy.js';
import { processVersusRound, settleVersusSeason, syncVersusProfileWithSeason } from '../domain/versus-engine.js';
import type { PlayerProfile, VersusSeason } from '../domain/types.js';
import type { BatchPlayerStore, PlayerStore } from '../storage/json-store.js';

export async function runMaintenance(store: PlayerStore, now = new Date()): Promise<number> {
  const profiles = await store.all();
  for (const profile of profiles) {
    let updated = recoverPlayer(profile, now);
    updated = syncAchievements(updated);
    if (updated.contract && updated.contract.state === 'ACTIVE' && new Date(updated.contract.endTime).getTime() <= now.getTime()) updated.contract.state = 'EXPIRED';
    await store.save(updated);
  }
  return profiles.length;
}

/**
 * Settles expired Versus listings in one batch per group. This remains
 * separate from Player maintenance so the three modes stay isolated.
 */
export async function runVersusMaintenance(store: PlayerStore, now = new Date()): Promise<number> {
  const batchStore = store as Partial<BatchPlayerStore>;
  if (typeof batchStore.saveBatch !== 'function') return 0;

  const profiles = await store.all();
  const groups = new Map<string, PlayerProfile[]>();
  for (const profile of profiles) {
    const groupCode = profile.versus?.groupCode;
    if (!groupCode || !profile.versus?.season) continue;
    const members = groups.get(groupCode) ?? [];
    members.push(structuredClone(profile));
    groups.set(groupCode, members);
  }

  let settledCount = 0;
  for (const members of groups.values()) {
    let season = members.find((profile) => profile.versus?.season)?.versus?.season as VersusSeason | undefined;
    if (!season) continue;
    let changed = false;
    const totalRounds = Math.max(1, 2 * (season.clubs.length - 1));
    const deadline = new Date(season.roundDeadline).getTime();
    if (season.state === 'ACTIVE' && season.currentRound <= totalRounds && Number.isFinite(deadline) && now.getTime() >= deadline) {
      const processedSeason = processVersusRound(season, season.currentRound, now);
      settledCount += processedSeason.battles.filter((battle) => battle.roundId === processedSeason.currentRound - 1 && battle.state === 'PUBLISHED').length;
      season = processedSeason;
      changed = true;
      if (season.currentRound > totalRounds) {
        season = settleVersusSeason(season, now);
        changed = true;
      }
    }
    if (season.market) {
      const profiles = members.map((profile) => structuredClone(profile));
      const results = settleExpiredVersusMarket(profiles, season, now);
      if (results.length > 0) {
        season = results[results.length - 1].season;
        settledCount += results.length;
        changed = true;
      }
    }
    if (!changed) continue;
    const nextProfiles = members.map((profile) => syncVersusProfileWithSeason(profile, season!, now));
    await batchStore.saveBatch(nextProfiles);
  }
  return settledCount;
}
