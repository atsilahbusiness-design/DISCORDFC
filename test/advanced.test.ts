import assert from 'node:assert/strict';
import test from 'node:test';
import { GAME_BALANCE, assertBalance } from '../src/config/game-balance.js';
import { claimAchievement, formatAchievements, playChampionsLeague, startChampionsLeague, syncAchievements } from '../src/domain/competition-engine.js';
import { getContractStatus, renewContract, signContract } from '../src/domain/contract-engine.js';
import { createInitialProfile, SeededRandom } from '../src/domain/engine.js';
import { UserRateLimiter } from '../src/discord/rate-limit.js';

test('balance configuration is valid and explicit about provenance', () => {
  assertBalance(GAME_BALANCE);
  assert.equal(GAME_BALANCE.source, 'RECOVERY_INFERRED');
});

test('contract can be signed and expires by time', () => {
  const profile = createInitialProfile('contract-1', 'Contract', 'FW');
  const signed = signContract(profile, new Date('2026-01-01T00:00:00.000Z'), 10);
  assert.equal(signed.contract?.state, 'ACTIVE');
  const expired = getContractStatus(signed, new Date('2026-01-12T00:00:00.000Z'));
  assert.equal(expired?.state, 'EXPIRED');
  const renewed = renewContract(signed, new Date('2026-01-12T00:00:00.000Z'), 30);
  assert.equal(renewed.contract?.state, 'ACTIVE');
});

test('champions league starts only after qualification and can be played', () => {
  let profile = createInitialProfile('champions-1', 'Champion', 'FW');
  assert.throws(() => startChampionsLeague(profile), /belum lolos/);
  profile = profile;
  profile.clubState = {
    id: profile.club,
    name: profile.club,
    level: 2,
    prestige: 180,
    assets: 30_000,
    salaryBudget: 7_000,
    formation: '4-4-2',
    tactic: 'balanced',
    roster: [],
    fixtures: [],
    standings: [],
    nextFixtureAt: new Date().toISOString(),
    championsLeagueQualified: true,
    championsLeagueRound: 1
  };
  const started = startChampionsLeague(profile);
  const result = playChampionsLeague(started, new Date('2026-01-01T00:00:00.000Z'), new SeededRandom(11));
  assert.equal(['ACTIVE', 'ELIMINATED', 'CHAMPION'].includes(result.status), true);
  assert.equal(result.commentary.length, 3);
});

test('achievement sync exposes ready achievement and claim pays reward', () => {
  let profile = createInitialProfile('achievement-1', 'Achiever', 'MF');
  profile.career.appearances = 10;
  profile = syncAchievements(profile);
  assert.match(formatAchievements(profile), /READY/);
  const result = claimAchievement(profile, 'appearances-10');
  assert.equal(result.achievement.claimed, true);
  assert.equal(result.profile.money > profile.money, true);
});

test('rate limiter blocks after configured request count', () => {
  const limiter = new UserRateLimiter(2, 1_000);
  assert.equal(limiter.consume('u', 100), true);
  assert.equal(limiter.consume('u', 200), true);
  assert.equal(limiter.consume('u', 300), false);
  assert.equal(limiter.consume('u', 1_101), true);
});
