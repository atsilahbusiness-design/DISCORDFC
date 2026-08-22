import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialProfile, SeededRandom } from '../src/domain/engine.js';
import { acceptJobOffer, advanceCoachRound, assignCoachExp, createCoachCareer, generateJobOffer, rebirthCoach, retireCoach } from '../src/domain/coach-career-engine.js';
import { ensureClubState } from '../src/domain/club-engine.js';

test('Coach career has six abilities, round settlement, and manual EXP', () => {
  let profile = ensureClubState(createInitialProfile('coach-1', 'Coach One', 'MF'), new Date('2026-01-01T00:00:00.000Z'), new SeededRandom(1));
  profile = createCoachCareer(profile, 'Coach One', new Date('2026-01-01T00:00:00.000Z'));
  assert.equal(Object.keys(profile.coach!.abilities).length, 6);
  assert.equal(profile.coach!.approval, 50);
  assert.ok(profile.coachClubState);
  const playerSeasonBefore = profile.league.season;
  const round = advanceCoachRound(profile, new Date('2026-01-02T00:00:00.000Z'), new SeededRandom(8));
  assert.equal(typeof round.match.halftime.homeGoals, 'number');
  assert.equal(round.profile.coach!.totalExp, round.coachExp);
  assert.equal(round.profile.league.season, playerSeasonBefore);
  assert.equal(round.profile.coachClubState!.fixtures.filter((fixture) => fixture.played).length, 1);
  const allocated = assignCoachExp(round.profile, { formation: Math.min(50, round.profile.coach!.unassignedExp) });
  assert.equal(allocated.profile.coach!.unassignedExp, round.profile.coach!.unassignedExp - allocated.allocated);
});

test('Coach job, retirement, and rebirth preserve Player state while changing Coach state', () => {
  let profile = createCoachCareer(ensureClubState(createInitialProfile('coach-2', 'Coach Two', 'FW')), 'Coach Two');
  const playerClub = profile.club;
  const playerLeagueSeason = profile.league.season;
  const generated = generateJobOffer(profile, new SeededRandom(12));
  const accepted = acceptJobOffer(generated.profile, generated.offer.id, new Date('2026-02-01T00:00:00.000Z'));
  assert.equal(accepted.club, playerClub);
  assert.equal(accepted.coachClubState!.name, generated.offer.clubName);
  assert.equal(accepted.league.season, playerLeagueSeason);
  assert.equal(accepted.coach!.season, 2);
  const retired = retireCoach(accepted, new Date('2026-03-01T00:00:00.000Z'));
  assert.equal(retired.coach!.status, 'RETIRED');
  const reborn = rebirthCoach(retired, new Date('2026-03-02T00:00:00.000Z'));
  assert.equal(reborn.coach!.status, 'EMPLOYED');
  assert.equal(reborn.coach!.season, 3);
  assert.equal(reborn.club, playerClub);
  assert.equal(reborn.league.season, playerLeagueSeason);
  assert.equal(reborn.coachClubState!.name, generated.offer.clubName);
});
