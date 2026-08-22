import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialProfile, SeededRandom } from '../src/domain/engine.js';
import { acceptJobOffer, advanceCoachRound, assignCoachExp, createCoachCareer, generateJobOffer, rebirthCoach, retireCoach } from '../src/domain/coach-career-engine.js';
import { ensureClubState, playClubMatch, projectCoachLeagueStandings } from '../src/domain/club-engine.js';
import { playChampionsLeague, startChampionsLeague } from '../src/domain/competition-engine.js';

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

test('Coach league projection completes non-user standings after the user schedule', () => {
  let profile = createCoachCareer(ensureClubState(createInitialProfile('coach-league', 'Coach League', 'DF')), 'Coach League');
  const fixtureCount = profile.coachClubState!.fixtures.length;
  let cursor = profile;
  let index = 0;
  while (cursor.coachClubState!.fixtures.some((fixture) => !fixture.played)) {
    cursor = playClubMatch(cursor, new Date(2026, 0, 2 + index), new SeededRandom(100 + index), 'coachClubState').profile;
    index += 1;
  }
  projectCoachLeagueStandings(cursor.coachClubState!);
  assert.ok(cursor.coachClubState!.standings.every((standing) => standing.played === fixtureCount));
  assert.ok(cursor.coachClubState!.standings.every((standing) => standing.wins + standing.draws + standing.losses === fixtureCount));
});

test('Coach Champions League uses an isolated Coach aggregate and season', () => {
  let profile = createCoachCareer(ensureClubState(createInitialProfile('coach-cl', 'Coach CL', 'MF')), 'Coach CL');
  profile.coachClubState!.championsLeagueQualified = true;
  profile.clubState!.championsLeagueQualified = true;
  const playerLeagueSeason = profile.league.season;
  const playerStarted = startChampionsLeague(profile, new Date('2026-01-01T00:00:00.000Z'), 'PLAYER');
  const coachStarted = startChampionsLeague(playerStarted, new Date('2026-01-01T00:00:00.000Z'), 'COACH');
  assert.equal(coachStarted.championsLeague!.season, playerLeagueSeason);
  assert.equal(coachStarted.coach!.championsLeague!.season, coachStarted.coach!.season);
  assert.notEqual(coachStarted.championsLeague, coachStarted.coach!.championsLeague);
  const playerAssets = coachStarted.clubState!.assets;
  const playerStats = coachStarted.stats;
  const played = playChampionsLeague(coachStarted, new Date('2026-01-02T00:00:00.000Z'), new SeededRandom(17), 'COACH');
  assert.ok(played.profile.coach!.championsLeague);
  assert.equal(played.profile.league.season, playerLeagueSeason);
  assert.deepEqual(played.profile.stats, playerStats);
  assert.equal(played.profile.clubState!.assets, playerAssets);
  assert.equal(played.profile.coach!.championsLeague!.status, played.status);
  assert.ok(played.profile.coachClubState!.assets >= coachStarted.coachClubState!.assets);
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
