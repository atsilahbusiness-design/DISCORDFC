import assert from 'node:assert/strict';
import test from 'node:test';
import { advanceWeek, assignMatchExp, ensureGameplayState, hireTrainer, rebirthPlayer, retirePlayer, startTrickTraining, trainDetailedSkill, treatInjury } from '../src/domain/gameplay-engine.js';
import { createInitialProfile, playMatch, SeededRandom } from '../src/domain/engine.js';

test('new player starts at age 15 with twelve detailed skills', () => {
  const profile = createInitialProfile('gameplay-1', 'Teen Star', 'FW');
  assert.equal(profile.age, 15);
  assert.equal(Object.keys(profile.detailedSkills ?? {}).length, 12);
  assert.equal(profile.careerStatus, 'ACTIVE');
  assert.equal(profile.careerWeek, 1);
});

test('legacy profile is migrated into a valid gameplay state', () => {
  const profile = createInitialProfile('gameplay-2', 'Legacy', 'MF');
  delete profile.detailedSkills;
  delete profile.careerWeek;
  const migrated = ensureGameplayState(profile);
  assert.equal(Object.keys(migrated.detailedSkills ?? {}).length, 12);
  assert.equal(migrated.careerWeek, 1);
  assert.equal(migrated.unassignedMatchExp, 0);
});

test('detailed training and manual match EXP allocation mutate only requested skills', () => {
  let profile = createInitialProfile('gameplay-3', 'Technician', 'MF');
  const beforePass = profile.detailedSkills!.pass.level;
  const trained = trainDetailedSkill(profile, 'pass', new Date('2026-01-01T00:00:00.000Z'), new SeededRandom(2));
  assert.equal(trained.profile.energy, 88);
  assert.equal(trained.profile.detailedSkills!.pass.level, beforePass);
  assert.deepEqual(trained.profile.activeTraining?.skill, 'pass');
  const settled = advanceWeek(trained.profile, new Date('2026-01-08T00:00:00.000Z'), new SeededRandom(3));
  assert.equal(settled.profile.activeTraining, undefined);
  assert.equal(settled.profile.detailedSkills!.pass.exp > 0, true);
  trained.profile.unassignedMatchExp = 70;
  const allocated = assignMatchExp(trained.profile, { dribbling: 70 });
  assert.equal(allocated.remaining, 0);
  assert.equal(allocated.profile.detailedSkills!.dribbling.exp, 70);
  assert.equal(allocated.profile.detailedSkills!.pass.exp, trained.profile.detailedSkills!.pass.exp);
});

test('observed bicycle kick trick unlocks after prerequisites', () => {
  const profile = createInitialProfile('gameplay-4', 'Acrobat', 'FW');
  const result = startTrickTraining(profile, 'bicycle-kick');
  assert.equal(result.profile.unlockedTricks?.includes('bicycle-kick'), true);
  assert.equal(result.profile.energy, 76);
});

test('trainer, weekly progression, and annual award state are persisted', () => {
  let profile = createInitialProfile('gameplay-5', 'Weekly Star', 'FW');
  profile.seasonWeek = 10;
  const hired = hireTrainer(profile, 'junior-physical');
  const week = advanceWeek(hired.profile, new Date('2026-01-01T00:00:00.000Z'), new SeededRandom(4));
  assert.equal(week.profile.careerWeek, 2);
  assert.equal(week.profile.seasonWeek, 1);
  assert.equal(week.profile.age, 16);
  assert.equal(week.award?.resolved, true);
  assert.equal((week.profile.unassignedMatchExp ?? 0) > 0, true);
});

test('injury blocks match flow and treatment reduces duration', () => {
  const profile = createInitialProfile('gameplay-6', 'Injured', 'DF');
  profile.injury = { severity: 'MAJOR', weeksRemaining: 4, source: 'MATCH', treatmentUsed: false, diagnosedAt: new Date().toISOString() };
  const treated = treatInjury(profile, 'BASIC');
  assert.equal(treated.profile.injury?.weeksRemaining, 3);
  assert.throws(() => {
    const next = createInitialProfile('gameplay-7', 'Blocked', 'DF');
    next.injury = { severity: 'MINOR', weeksRemaining: 2, source: 'MATCH', treatmentUsed: false, diagnosedAt: new Date().toISOString() };
    return playMatch(next, new Date(), new SeededRandom(1));
  }, /cedera/i);
});

test('retirement and rebirth preserve money and honors while resetting career state', () => {
  let profile = createInitialProfile('gameplay-8', 'Veteran', 'FW');
  profile.age = 34;
  profile.careerYear = 20;
  profile.money = 9876;
  profile.honors = [{ id: 'personal-1', category: 'PERSONAL', title: 'MVP', season: 10, description: 'MVP', source: 'RECOVERY_INFERRED', value: 90, awardedAt: new Date().toISOString() }];
  const retired = retirePlayer(profile);
  assert.equal(retired.profile.careerStatus, 'RETIRED');
  const reborn = rebirthPlayer(retired.profile);
  assert.equal(reborn.profile.age, 15);
  assert.equal(reborn.profile.level, 10);
  assert.equal(reborn.profile.money, 9876);
  assert.equal(reborn.profile.honors?.length, 1);
  assert.equal(reborn.profile.rebirthCount, 1);
  assert.equal(reborn.profile.careerStatus, 'ACTIVE');
});
