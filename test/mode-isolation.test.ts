import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialProfile, SeededRandom } from '../src/domain/engine.js';
import { ensureClubState, playClubMatch, setClubFormation } from '../src/domain/club-engine.js';
import { advanceCoachRound, createCoachCareer, retireCoach, assignCoachExp, resolveCoachEvent } from '../src/domain/coach-career-engine.js';
import { createVersusClub } from '../src/domain/versus-engine.js';
import type { CoachEvent } from '../src/domain/types.js';

test('Player, Coach, and Versus states remain isolated on one account', () => {
  let profile = createInitialProfile('isolation-1', 'Isolation', 'FW');
  profile = ensureClubState(profile, new Date('2026-01-01T00:00:00.000Z'), new SeededRandom(1));
  profile = createCoachCareer(profile, 'Isolation Coach', new Date('2026-01-01T00:00:00.000Z'));
  profile = createVersusClub(profile, new Date('2026-01-01T00:00:00.000Z'));
  assert.ok(profile.clubState);
  assert.ok(profile.coachClubState);
  assert.ok(profile.versus);
  const playerFormationBefore = profile.clubState!.formation;
  const coachFormationBefore = profile.coachClubState!.formation;
  const versusFormationBefore = profile.versus!.club.formation;
  const playerNextFixtureBefore = profile.clubState!.fixtures.find((fixture) => !fixture.played)?.id;
  const coachNextFixtureBefore = profile.coachClubState!.fixtures.find((fixture) => !fixture.played)?.id;
  const versusMoneyBefore = profile.versus!.club.versusMoney;

  profile = setClubFormation(profile, '3-4-3', new Date('2026-01-02T00:00:00.000Z'), 'clubState');
  assert.equal(profile.clubState!.formation, '3-4-3');
  assert.equal(profile.coachClubState!.formation, coachFormationBefore);
  assert.equal(profile.versus!.club.formation, versusFormationBefore);

  const playerMatch = playClubMatch(profile, new Date('2026-01-03T00:00:00.000Z'), new SeededRandom(4));
  assert.equal(playerMatch.profile.clubState!.fixtures.find((fixture) => fixture.played)?.id, playerNextFixtureBefore);
  assert.equal(playerMatch.profile.coachClubState!.fixtures.find((fixture) => !fixture.played)?.id, coachNextFixtureBefore);
  assert.equal(playerMatch.profile.versus!.club.versusMoney, versusMoneyBefore);

  const playerStateBeforeCoach = JSON.stringify({ hp: playerMatch.profile.hp, league: playerMatch.profile.league, career: playerMatch.profile.career, clubState: playerMatch.profile.clubState });
  const coachRound = advanceCoachRound(playerMatch.profile, new Date('2026-01-04T00:00:00.000Z'), new SeededRandom(7));
  assert.equal(coachRound.profile.coachClubState!.fixtures.find((fixture) => fixture.played)?.id, coachNextFixtureBefore);
  assert.equal(coachRound.profile.clubState!.fixtures.find((fixture) => !fixture.played)?.id, playerMatch.profile.clubState!.fixtures.find((fixture) => !fixture.played)?.id);
  assert.equal(coachRound.profile.versus!.club.formation, versusFormationBefore);
  assert.equal(coachRound.profile.coachClubState!.formation, coachFormationBefore);
  assert.equal(JSON.stringify({ hp: coachRound.profile.hp, league: coachRound.profile.league, career: coachRound.profile.career, clubState: coachRound.profile.clubState }), playerStateBeforeCoach);
  assert.notEqual(coachRound.profile.clubState, coachRound.profile.coachClubState);
  assert.equal(playerFormationBefore, '4-4-2');
});

test('Coach legacy honors and retired-event state stay inside Coach aggregate', () => {
  const start = new Date('2026-01-01T00:00:00.000Z');
  let profile = createCoachCareer(createInitialProfile('isolation-2', 'Isolation Two', 'MF', start), 'Isolation Coach', start);
  profile.honors = [{ id: 'player-honor', category: 'PERSONAL', title: 'Player Honor', season: 1, description: 'Player-only', source: 'WALKTHROUGH_OBSERVED', value: 1, awardedAt: start.toISOString() }];
  const playerHonorCount = profile.honors.length;
  assert.equal(profile.coach!.honors.length, 0);
  const event: CoachEvent = { id: 'event-1', templateId: 'press-criticism', title: 'Press', description: 'Press', choices: [{ id: 'ignore-press', label: 'Ignore', description: 'Ignore', approvalDelta: -2, moneyDelta: 0, expDelta: 8 }], resolved: false, createdAt: start.toISOString() };
  profile.coach!.event = event;
  assert.throws(() => assignCoachExp({ ...profile, coach: { ...profile.coach!, unassignedExp: 1 } }, { formation: 0.5 }), /bilangan bulat/);
  profile = retireCoach(profile, start);
  assert.equal(profile.honors.length, playerHonorCount);
  assert.throws(() => resolveCoachEvent(profile, 'ignore-press', start), /tidak sedang employed/);
});
