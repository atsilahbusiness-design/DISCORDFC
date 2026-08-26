import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialProfile } from '../src/domain/engine.js';
import { signContract } from '../src/domain/contract-engine.js';
import { runMaintenance, runVersusMaintenance } from '../src/jobs/maintenance.js';
import { enrollVersus, createVersusSeason, syncVersusProfileWithSeason } from '../src/domain/versus-engine.js';
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
    assert.equal(Object.hasOwn(updated ?? {}, 'event'), false);
    assert.equal(updated?.contract?.state, 'EXPIRED');
    assert.equal((await readFile(file, 'utf8')).length > 0, true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('Versus maintenance settles a due round without user interaction', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'frs-versus-round-maintenance-'));
  const file = join(directory, 'players.json');
  try {
    const started = new Date('2026-01-01T00:00:00.000Z');
    const members = [
      enrollVersus(createInitialProfile('maintenance-round-a', 'Round A', 'FW'), 'ROUND-MAINT-42', started),
      enrollVersus(createInitialProfile('maintenance-round-b', 'Round B', 'MF'), 'ROUND-MAINT-42', started)
    ];
    const season = createVersusSeason('ROUND-MAINT-42', members, started, 4);
    const profiles = members.map((profile) => syncVersusProfileWithSeason(profile, season, started));
    const store = new JsonPlayerStore(file);
    await store.saveBatch(profiles);
    const settled = await runVersusMaintenance(store, new Date('2026-01-02T00:00:00.000Z'));
    const updated = await store.all();
    assert.ok(settled >= 2);
    assert.equal(updated.every((profile) => profile.versus?.season?.currentRound === 2), true);
    assert.equal(updated.every((profile) => profile.versus?.season?.battles.filter((battle) => battle.roundId === 1).every((battle) => battle.state === 'PUBLISHED')), true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('Versus maintenance settles expired listings without user interaction', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'frs-versus-maintenance-'));
  const file = join(directory, 'players.json');
  try {
    const started = new Date('2026-01-01T00:00:00.000Z');
    const members = [
      enrollVersus(createInitialProfile('maintenance-v-a', 'Versus A', 'FW'), 'MAINTENANCE-42', started),
      enrollVersus(createInitialProfile('maintenance-v-b', 'Versus B', 'MF'), 'MAINTENANCE-42', started)
    ];
    const season = createVersusSeason('MAINTENANCE-42', members, started, 4);
    const profiles = members.map((profile) => syncVersusProfileWithSeason(profile, season, started));
    const store = new JsonPlayerStore(file);
    await store.saveBatch(profiles);
    const settled = await runVersusMaintenance(store, new Date('2026-01-01T00:10:00.000Z'));
    const updated = await store.all();
    assert.equal(settled, season.market?.listings.length);
    assert.equal(updated.every((profile) => profile.versus?.season?.market?.listings.every((listing) => listing.status === 'EXPIRED')), true);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
