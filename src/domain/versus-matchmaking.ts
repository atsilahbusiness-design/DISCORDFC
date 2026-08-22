import { GAME_BALANCE } from '../config/game-balance.js';

export const VERSUS_MATCHMAKING_RULESET_VERSION = 'versus-matchmaking-inferred-v1';

export type QueueEntryStatus = 'QUEUED' | 'MATCHED' | 'EXPIRED';

export interface VersusQueueEntry {
  ticketId: string;
  userId: string;
  queueKey: string;
  ratingSnapshot: number;
  rosterVersion: number;
  queuedAt: string;
  status: QueueEntryStatus;
  assignmentId?: string;
  matchedAt?: string;
  expiresAt?: string;
}

export interface VersusQueueAssignment {
  assignmentId: string;
  queueKey: string;
  ticketIds: string[];
  userIds: string[];
  ratingMin: number;
  ratingMax: number;
  createdAt: string;
  rulesetVersion: string;
}

export interface MatchmakingOptions {
  capacity?: number;
  now?: Date;
  initialRatingWindow?: number;
  ratingWindowStep?: number;
  windowEverySeconds?: number;
  ticketTtlSeconds?: number;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function effectiveWindow(entry: VersusQueueEntry, now: Date, options: Required<Pick<MatchmakingOptions, 'initialRatingWindow' | 'ratingWindowStep' | 'windowEverySeconds'>>): number {
  const waitSeconds = Math.max(0, (now.getTime() - new Date(entry.queuedAt).getTime()) / 1_000);
  return options.initialRatingWindow + Math.floor(waitSeconds / options.windowEverySeconds) * options.ratingWindowStep;
}

export function queueEntryFor(userId: string, queueKey: string, ratingSnapshot: number, rosterVersion: number, now = new Date()): VersusQueueEntry {
  if (!userId.trim()) throw new Error('User ID queue tidak boleh kosong.');
  if (!/^[a-z0-9][a-z0-9_-]{1,23}$/.test(queueKey)) throw new Error('Queue key Versus tidak valid.');
  if (!Number.isFinite(ratingSnapshot) || ratingSnapshot < 0) throw new Error('Rating snapshot queue tidak valid.');
  if (!Number.isInteger(rosterVersion) || rosterVersion < 1) throw new Error('Roster version queue tidak valid.');
  return {
    ticketId: `vqueue:${userId}:${now.getTime()}`,
    userId,
    queueKey,
    ratingSnapshot: Math.round(ratingSnapshot),
    rosterVersion,
    queuedAt: now.toISOString(),
    status: 'QUEUED',
    expiresAt: new Date(now.getTime() + GAME_BALANCE.versus.matchmakingTicketTtlSeconds * 1_000).toISOString()
  };
}

export function matchVersusQueue(entriesInput: VersusQueueEntry[], options: MatchmakingOptions = {}): { entries: VersusQueueEntry[]; assignments: VersusQueueAssignment[] } {
  const now = options.now ?? new Date();
  const capacity = Math.max(2, Math.floor(options.capacity ?? GAME_BALANCE.versus.defaultGroupCapacity));
  const config = {
    initialRatingWindow: options.initialRatingWindow ?? GAME_BALANCE.versus.matchmakingInitialRatingWindow,
    ratingWindowStep: options.ratingWindowStep ?? GAME_BALANCE.versus.matchmakingWindowStep,
    windowEverySeconds: options.windowEverySeconds ?? GAME_BALANCE.versus.matchmakingWindowEverySeconds
  };
  const entries = entriesInput.map(clone);
  const assignments: VersusQueueAssignment[] = [];
  const active = entries.filter((entry) => entry.status === 'QUEUED');
  for (const entry of active) {
    if (entry.expiresAt && new Date(entry.expiresAt).getTime() <= now.getTime()) {
      entry.status = 'EXPIRED';
    }
  }
  const queues = new Map<string, VersusQueueEntry[]>();
  for (const entry of entries.filter((item) => item.status === 'QUEUED')) {
    const queue = queues.get(entry.queueKey) ?? [];
    queue.push(entry);
    queues.set(entry.queueKey, queue);
  }

  for (const [queueKey, queue] of queues) {
    queue.sort((a, b) => new Date(a.queuedAt).getTime() - new Date(b.queuedAt).getTime() || a.ticketId.localeCompare(b.ticketId));
    while (queue.length >= 2) {
      const anchor = queue[0];
      const candidates = queue.slice(1).filter((candidate) => {
        const ratingDelta = Math.abs(candidate.ratingSnapshot - anchor.ratingSnapshot);
        return ratingDelta <= effectiveWindow(anchor, now, config) && ratingDelta <= effectiveWindow(candidate, now, config);
      });
      if (candidates.length === 0) break;
      const selected = candidates.slice(0, Math.max(1, capacity - 1)).sort((a, b) => Math.abs(a.ratingSnapshot - anchor.ratingSnapshot) - Math.abs(b.ratingSnapshot - anchor.ratingSnapshot) || a.ticketId.localeCompare(b.ticketId));
      const group = [anchor, ...selected];
      const assignmentId = `vassignment:${queueKey}:${now.getTime()}:${assignments.length + 1}`;
      const assignment: VersusQueueAssignment = {
        assignmentId,
        queueKey,
        ticketIds: group.map((entry) => entry.ticketId),
        userIds: group.map((entry) => entry.userId),
        ratingMin: Math.min(...group.map((entry) => entry.ratingSnapshot)),
        ratingMax: Math.max(...group.map((entry) => entry.ratingSnapshot)),
        createdAt: now.toISOString(),
        rulesetVersion: VERSUS_MATCHMAKING_RULESET_VERSION
      };
      assignments.push(assignment);
      for (const matched of group) {
        matched.status = 'MATCHED';
        matched.assignmentId = assignmentId;
        matched.matchedAt = now.toISOString();
      }
      const matchedIds = new Set(group.map((entry) => entry.ticketId));
      for (let index = queue.length - 1; index >= 0; index -= 1) if (matchedIds.has(queue[index].ticketId)) queue.splice(index, 1);
    }
  }
  return { entries, assignments };
}
