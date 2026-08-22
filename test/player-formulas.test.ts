import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialProfile, getRating, playMatch, SeededRandom, trainPlayer } from '../src/domain/engine.js';
import { calculatePlayerRating, detailedTrainingExpFor, makeFormulaObservation, PLAYER_FORMULA_VERSION, trainingExpFor } from '../src/domain/player-formulas.js';

const NOW = new Date('2026-01-01T00:00:00.000Z');

test('Player formula module is deterministic and stamps match provenance', () => {
  const first = createInitialProfile('formula-1', 'Formula Player', 'FW', NOW);
  const second = createInitialProfile('formula-1', 'Formula Player', 'FW', NOW);
  const firstMatch = playMatch(first, NOW, new SeededRandom(2026));
  const secondMatch = playMatch(second, NOW, new SeededRandom(2026));
  assert.deepEqual(firstMatch.record, secondMatch.record);
  assert.equal(firstMatch.record.formulaVersion, PLAYER_FORMULA_VERSION);
});

test('Player rating is monotonic for a relevant detailed skill', () => {
  const lower = createInitialProfile('formula-2', 'Lower', 'FW', NOW);
  const higher = structuredClone(lower);
  higher.detailedSkills!.shots.level += 20;
  assert.equal(calculatePlayerRating(higher) >= calculatePlayerRating(lower), true);
  assert.equal(getRating(higher) >= getRating(lower), true);
});

test('Training formula outputs stay within configured bounds', () => {
  const low = { next: () => 0 };
  const high = { next: () => 0.999999 };
  assert.equal(trainingExpFor(low), 18);
  assert.equal(trainingExpFor(high), 30);
  assert.equal(detailedTrainingExpFor(low), 18);
  assert.equal(detailedTrainingExpFor(high), 30);
});

test('Formula observation is explicitly probe-versioned', () => {
  const profile = createInitialProfile('formula-3', 'Observer', 'MF', NOW);
  const observation = makeFormulaObservation(profile, {
    position: 'MF',
    level: profile.level,
    playerGoals: 1,
    opponentGoals: 0,
    score: 7.5,
    outcome: 'WIN',
    rewardMoney: 220,
    rewardExp: 42
  });
  assert.equal(observation.formulaVersion, PLAYER_FORMULA_VERSION);
  assert.equal(observation.rating, getRating(profile));
});
