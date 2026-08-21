import { createInitialProfile, playMatch, SeededRandom } from '../src/domain/engine.js';
import type { Position } from '../src/domain/types.js';

const positions: Position[] = ['GK', 'DF', 'MF', 'FW'];
const runs = 1_000;
const summary = new Map<Position, { wins: number; draws: number; losses: number; goals: number; money: number; rating: number }>();

for (const position of positions) {
  const aggregate = { wins: 0, draws: 0, losses: 0, goals: 0, money: 0, rating: 0 };
  for (let index = 0; index < runs; index += 1) {
    const profile = createInitialProfile(`balance-${position}-${index}`, 'Balance', position, new Date('2026-01-01T00:00:00.000Z'));
    const result = playMatch(profile, new Date('2026-01-02T00:00:00.000Z'), new SeededRandom(index + position.charCodeAt(0) * 100_000));
    aggregate[result.record.outcome === 'WIN' ? 'wins' : result.record.outcome === 'DRAW' ? 'draws' : 'losses'] += 1;
    aggregate.goals += result.record.playerGoals;
    aggregate.money += result.profile.money;
    aggregate.rating += result.record.playerRating;
  }
  summary.set(position, aggregate);
}

console.log(JSON.stringify({
  generatedAt: new Date().toISOString(),
  runsPerPosition: runs,
  positions: Object.fromEntries([...summary.entries()].map(([position, item]) => [position, {
    winRate: Number((item.wins / runs).toFixed(4)),
    drawRate: Number((item.draws / runs).toFixed(4)),
    lossRate: Number((item.losses / runs).toFixed(4)),
    averageGoals: Number((item.goals / runs).toFixed(4)),
    averageBalanceAfterMatch: Number((item.money / runs).toFixed(2)),
    averageRating: Number((item.rating / runs).toFixed(2))
  }]))
}, null, 2));
