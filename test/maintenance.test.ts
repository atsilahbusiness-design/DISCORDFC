import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialProfile } from '../src/domain/engine.js';
import { signContract } from '../src/domain/contract-engine.js';
import { runMaintenance } from '../src/jobs/maintenance.js';
import { JsonPlayerStore } from '../src/storage/json-store.js';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

test('maintenance updates time-based profile state', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'frs-maintenance-'));
  const file = join(directory, 'players.json');
  try {
    const store = new JsonPlayerStore(file);
    let profile = createInitialProfile('maintenance-1', 'Maintenance', 'MF');
    profile = signContract(profile, new Date('2026-01-01T00:00:00.000Z'), 1);
    profile.hp = 40;
    profile.energy = 20;
    profile.lastActionAt = '2026-01-01T00:00:00.000Z';
    await store.save(profile);
    const count = await runMaintenance(store, new Date('2026-01-03T00:00:00.000Z'));
    const updated = await store.get(profile.userId);
    assert.equal(count, 1);
    assert.equal(updated?.hp > 40, true);
    assert.equal(updated?.energy > 20, true);
    assert.equal(updated?.event?.dayKey, '2026-01-03');
    assert.equal(updated?.contract?.state, 'EXPIRED');
    assert.equal((await readFile(file, 'utf8')).length > 0, true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
