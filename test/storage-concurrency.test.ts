import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { join } from 'node:path';
import { tmpdir } from 'node:os';
import test from 'node:test';
import { createInitialProfile } from '../src/domain/engine.js';
import { JsonPlayerStore } from '../src/storage/json-store.js';

test('JSON batch save persists all profiles atomically and increments versions together', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'frs-batch-store-'));
  const path = join(directory, 'players.json');
  try {
    const store = new JsonPlayerStore(path);
    const first = createInitialProfile('batch-1', 'Batch One', 'GK');
    const second = createInitialProfile('batch-2', 'Batch Two', 'FW');
    await store.saveBatch([first, second]);
    assert.equal(first.version, 1);
    assert.equal(second.version, 1);
    assert.equal((await store.get(first.userId))?.version, 1);
    assert.equal((await store.get(second.userId))?.version, 1);

    const before = await readFile(path, 'utf8');
    await assert.rejects(store.saveBatch([first, first]), /Duplicate profile in batch/);
    assert.equal(await readFile(path, 'utf8'), before);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});

test('JSON Versus group lock serializes same-group operations', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'frs-group-lock-'));
  const path = join(directory, 'players.json');
  try {
    const store = new JsonPlayerStore(path);
    const events: string[] = [];
    await Promise.all([
      store.withVersusGroupLock('LOCK-GROUP', async () => {
        events.push('first-start');
        await new Promise((resolve) => setTimeout(resolve, 10));
        events.push('first-end');
      }),
      store.withVersusGroupLock('LOCK-GROUP', async () => {
        events.push('second-start');
        events.push('second-end');
      })
    ]);
    assert.deepEqual(events, ['first-start', 'first-end', 'second-start', 'second-end']);
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
});
