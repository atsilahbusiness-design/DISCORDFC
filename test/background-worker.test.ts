import assert from 'node:assert/strict';
import test from 'node:test';
import { BackgroundWorker } from '../src/jobs/background-worker.js';

test('background worker prevents overlapping ticks', async () => {
  let active = 0;
  let maximum = 0;
  let calls = 0;
  let release!: () => void;
  const gate = new Promise<void>((resolve) => { release = resolve; });
  const worker = new BackgroundWorker({
    name: 'test',
    intervalMs: 1_000,
    task: async () => {
      calls += 1;
      active += 1;
      maximum = Math.max(maximum, active);
      await gate;
      active -= 1;
    }
  });

  worker.start();
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.equal(calls, 1);
  assert.equal(maximum, 1);
  assert.equal(await worker.runOnce(), false);
  release();
  await new Promise((resolve) => setTimeout(resolve, 5));
  worker.stop();
  assert.equal(active, 0);
});

test('background worker start and stop are idempotent', async () => {
  let calls = 0;
  const worker = new BackgroundWorker({ name: 'test', intervalMs: 1_000, task: async () => { calls += 1; } });
  worker.stop();
  worker.start();
  worker.start();
  await new Promise((resolve) => setTimeout(resolve, 5));
  worker.stop();
  worker.stop();
  assert.equal(calls, 1);
});
