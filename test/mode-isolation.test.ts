import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialProfile, SeededRandom } from '../src/domain/engine.js';
import { ensureClubState, playClubMatch, setClubFormation } from '../src/domain/club-engine.js';
import { advanceCoachRound, createCoachCareer } from '../src/domain/coach-career-engine.js';
import { createVersusClub } from '../src/domain/versus-engine.js';

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

  const coachRound = advanceCoachRound(playerMatch.profile, new Date('2026-01-04T00:00:00.000Z'), new SeededRandom(7));
  assert.equal(coachRound.profile.coachClubState!.fixtures.find((fixture) => fixture.played)?.id, coachNextFixtureBefore);
  assert.equal(coachRound.profile.clubState!.fixtures.find((fixture) => !fixture.played)?.id, playerMatch.profile.clubState!.fixtures.find((fixture) => !fixture.played)?.id);
  assert.equal(coachRound.profile.versus!.club.formation, versusFormationBefore);
  assert.equal(coachRound.profile.coachClubState!.formation, coachFormationBefore);
  assert.notEqual(coachRound.profile.clubState, coachRound.profile.coachClubState);
  assert.equal(playerFormationBefore, '4-4-2');
});
