import { recoverPlayer } from '../domain/engine.js';
import { syncAchievements } from '../domain/competition-engine.js';
import { generateDailyEvent } from '../domain/progression-engine.js';
import { settleExpiredVersusMarket } from '../domain/versus-economy.js';
import { syncVersusProfileWithSeason } from '../domain/versus-engine.js';
import type { PlayerProfile, VersusSeason } from '../domain/types.js';
import type { BatchPlayerStore, PlayerStore } from '../storage/json-store.js';

export async function runMaintenance(store: PlayerStore, now = new Date()): Promise<number> {
  const profiles = await store.all();
  for (const profile of profiles) {
    let updated = recoverPlayer(profile, now);
    updated = generateDailyEvent(updated, now);
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
    const season = members.find((profile) => profile.versus?.season)?.versus?.season as VersusSeason | undefined;
    if (!season?.market) continue;
    const results = settleExpiredVersusMarket(members, season, now);
    if (results.length === 0) continue;
    const latestSeason = results[results.length - 1].season;
    const nextProfiles = members.map((profile) => syncVersusProfileWithSeason(profile, latestSeason, now));
    await batchStore.saveBatch(nextProfiles);
    settledCount += results.length;
  }
  return settledCount;
}
