import assert from 'node:assert/strict';
import test from 'node:test';
import { UserCommandQueue } from '../src/discord/command-queue.js';

test('command queue serializes mutations for the same user', async () => {
  const queue = new UserCommandQueue();
  const events: string[] = [];
  let releaseFirst!: () => void;
  const firstGate = new Promise<void>((resolve) => { releaseFirst = resolve; });
  const first = queue.run('user-1', async () => {
    events.push('first-start');
    await firstGate;
    events.push('first-end');
  });
  const second = queue.run('user-1', async () => {
    events.push('second');
  });
  await new Promise((resolve) => setTimeout(resolve, 5));
  assert.deepEqual(events, ['first-start']);
  releaseFirst();
  await Promise.all([first, second]);
  assert.deepEqual(events, ['first-start', 'first-end', 'second']);
  assert.equal(queue.size, 0);
});

test('command queue allows different users to progress independently', async () => {
  const queue = new UserCommandQueue();
  const events: string[] = [];
  await Promise.all([
    queue.run('user-a', async () => { events.push('a'); }),
    queue.run('user-b', async () => { events.push('b'); })
  ]);
  assert.deepEqual(events.sort(), ['a', 'b']);
  assert.equal(queue.size, 0);
});
