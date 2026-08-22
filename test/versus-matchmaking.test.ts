import assert from 'node:assert/strict';
import test from 'node:test';
import { matchVersusQueue, queueEntryFor } from '../src/domain/versus-matchmaking.js';

const START = new Date('2026-01-01T00:00:00.000Z');

test('Versus queue entries carry expiry and roster/rating snapshots', () => {
  const entry = queueEntryFor('queue-a', 'public', 64.4, 3, START);
  assert.equal(entry.status, 'QUEUED');
  assert.equal(entry.ratingSnapshot, 64);
  assert.equal(entry.rosterVersion, 3);
  assert.equal(new Date(entry.expiresAt!).getTime() - START.getTime(), 300_000);
});

test('Versus matcher pairs closest eligible entries and stamps one assignment', () => {
  const entries = [
    queueEntryFor('queue-a', 'public', 60, 1, START),
    queueEntryFor('queue-b', 'public', 66, 1, new Date(START.getTime() + 1_000)),
    queueEntryFor('queue-c', 'public', 90, 1, new Date(START.getTime() + 2_000)),
    queueEntryFor('queue-d', 'ranked', 60, 1, START)
  ];
  const result = matchVersusQueue(entries, { now: new Date(START.getTime() + 5_000), capacity: 2 });
  assert.equal(result.assignments.length, 1);
  assert.deepEqual(result.assignments[0].userIds, ['queue-a', 'queue-b']);
  assert.equal(result.entries.find((entry) => entry.userId === 'queue-a')!.status, 'MATCHED');
  assert.equal(result.entries.find((entry) => entry.userId === 'queue-c')!.status, 'QUEUED');
  assert.equal(result.entries.find((entry) => entry.userId === 'queue-d')!.status, 'QUEUED');
});

test('Versus matcher widens window only as wait time increases and expires old tickets', () => {
  const entries = [
    queueEntryFor('queue-e', 'public', 60, 1, START),
    queueEntryFor('queue-f', 'public', 78, 1, new Date(START.getTime() + 1_000)),
    queueEntryFor('queue-g', 'public', 90, 1, new Date(START.getTime() + 1_000))
  ];
  const shortWait = matchVersusQueue(entries, { now: new Date(START.getTime() + 5_000), capacity: 2 });
  assert.equal(shortWait.assignments.length, 0);
  const longWait = matchVersusQueue(entries, { now: new Date(START.getTime() + 290_000), capacity: 2 });
  assert.equal(longWait.assignments.length, 1);
  const expired = matchVersusQueue([queueEntryFor('queue-h', 'public', 60, 1, new Date(START.getTime() - 301_000))], { now: START });
  assert.equal(expired.entries[0].status, 'EXPIRED');
});
