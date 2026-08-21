import { recoverPlayer } from '../domain/engine.js';
import { syncAchievements } from '../domain/competition-engine.js';
import { generateDailyEvent } from '../domain/progression-engine.js';
import type { PlayerStore } from '../storage/json-store.js';

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
