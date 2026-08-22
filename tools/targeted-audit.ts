import assert from 'node:assert/strict';
import { createInitialProfile, SeededRandom } from '../src/domain/engine.js';
import { ensureClubState, playClubMatch, projectCoachLeagueStandings } from '../src/domain/club-engine.js';
import { claimDailyReward, generateDailyEvent, resolveDailyEvent } from '../src/domain/progression-engine.js';
import { createCoachCareer, retireCoach, assignCoachExp, resolveCoachEvent } from '../src/domain/coach-career-engine.js';
import { playChampionsLeague, startChampionsLeague } from '../src/domain/competition-engine.js';
import { createVersusClub, enrollVersus, createVersusSeason, processVersusRound, settleVersusSeason, syncVersusProfileWithSeason } from '../src/domain/versus-engine.js';
import type { CoachEvent } from '../src/domain/types.js';

const start = new Date('2026-01-01T00:00:00.000Z');
type Finding = { id: string; severity: 'HIGH' | 'MEDIUM' | 'LOW'; status: 'PASS' | 'FAIL'; details: string };
const report: Finding[] = [];
function finding(id: string, severity: Finding['severity'], fn: () => string): void {
  try { report.push({ id, severity, status: 'PASS', details: fn() }); }
  catch (error) { report.push({ id, severity, status: 'FAIL', details: error instanceof Error ? error.message : String(error) }); }
}

finding('PLAYER-EXP-LEVEL-SYNC', 'MEDIUM', () => {
  let profile = createInitialProfile('audit-player-exp', 'Audit Player', 'FW', start);
  profile.totalExp = 99;
  for (let day = 0; day < 2; day += 1) profile = claimDailyReward(profile, new Date(start.getTime() + day * 86_400_000)).profile;
  assert.ok(profile.totalExp >= 150);
  assert.ok(profile.level >= 2);
  return `daily reward totalExp=${profile.totalExp}, level=${profile.level}`;
});

finding('PLAYER-EVENT-EXP-LEVEL-SYNC', 'MEDIUM', () => {
  let profile = createInitialProfile('audit-player-event', 'Audit Event', 'MF', start);
  profile.totalExp = 99;
  profile = generateDailyEvent(profile, start, new SeededRandom(1));
  const choice = profile.event!.choices[0];
  profile = resolveDailyEvent(profile, choice.id, start).profile;
  assert.ok(profile.totalExp > 99);
  assert.ok(profile.level >= 2);
  return `event totalExp=${profile.totalExp}, level=${profile.level}`;
});

finding('COACH-HONOR-CROSS-MODE', 'MEDIUM', () => {
  let profile = createInitialProfile('audit-coach-honor', 'Audit Coach', 'GK', start);
  profile.honors = [{ id: 'player-honor', category: 'PERSONAL', title: 'Player Honor', season: 1, description: 'player', source: 'WALKTHROUGH_OBSERVED', value: 1, awardedAt: start.toISOString() }];
  profile = createCoachCareer(profile, 'Audit Coach', start);
  assert.equal(profile.coach!.honors.length, 0);
  const before = profile.honors.length;
  profile = retireCoach(profile, new Date(start.getTime() + 86_400_000));
  assert.equal(profile.honors.length, before);
  return 'Coach honors remain separate from Player profile.honors';
});

finding('COACH-DECIMAL-EXP', 'MEDIUM', () => {
  let profile = createCoachCareer(createInitialProfile('audit-coach-decimal', 'Audit Coach', 'MF', start), 'Audit Coach', start);
  profile.coach!.unassignedExp = 1;
  assert.throws(() => assignCoachExp(profile, { formation: 0.5 }), /bilangan bulat/);
  return 'fractional Coach EXP is rejected';
});

finding('COACH-RETIRED-EVENT-MUTATION', 'MEDIUM', () => {
  let profile = createCoachCareer(createInitialProfile('audit-coach-event', 'Audit Coach', 'DF', start), 'Audit Coach', start);
  const event: CoachEvent = { id: 'audit-event', templateId: 'press-criticism', title: 'Audit', description: 'Audit', choices: [{ id: 'choice', label: 'Choice', description: 'Choice', approvalDelta: 1, moneyDelta: 0, expDelta: 10 }], resolved: false, createdAt: start.toISOString() };
  profile.coach!.event = event;
  profile = retireCoach(profile, start);
  assert.throws(() => resolveCoachEvent(profile, 'choice', start), /tidak sedang employed/);
  return 'retired Coach cannot resolve a pending event';
});

finding('COACH-FULL-STANDINGS-PROJECTION', 'HIGH', () => {
  let profile = createCoachCareer(createInitialProfile('audit-coach-table', 'Audit Coach Table', 'DF', start), 'Audit Coach Table', start);
  const fixtureCount = profile.coachClubState!.fixtures.length;
  let round = 0;
  while (profile.coachClubState!.fixtures.some((fixture) => !fixture.played)) {
    profile = playClubMatch(profile, new Date(start.getTime() + (round + 1) * 86_400_000), new SeededRandom(1_500 + round), 'coachClubState').profile;
    round += 1;
  }
  projectCoachLeagueStandings(profile.coachClubState!);
  assert.ok(profile.coachClubState!.standings.every((standing) => standing.played === fixtureCount));
  assert.ok(profile.coachClubState!.standings.every((standing) => standing.wins + standing.draws + standing.losses === fixtureCount));
  return `projected ${profile.coachClubState!.standings.length} Coach standings rows to ${fixtureCount} matches`;
});

finding('COACH-CHAMPIONS-ISOLATION', 'HIGH', () => {
  let profile = createCoachCareer(ensureClubState(createInitialProfile('audit-coach-cl', 'Audit Coach CL', 'MF', start), start), 'Audit Coach CL', start);
  profile.clubState!.championsLeagueQualified = true;
  profile.coachClubState!.championsLeagueQualified = true;
  profile = startChampionsLeague(profile, start, 'PLAYER');
  profile = startChampionsLeague(profile, start, 'COACH');
  const playerState = profile.championsLeague;
  const coachPlayed = playChampionsLeague(profile, new Date(start.getTime() + 86_400_000), new SeededRandom(2_001), 'COACH');
  assert.deepEqual(coachPlayed.profile.championsLeague, playerState);
  assert.equal(coachPlayed.profile.coach!.championsLeague!.status, coachPlayed.status);
  assert.equal(coachPlayed.profile.league.season, 1);
  return `Player season ${playerState!.season} and Coach season ${coachPlayed.profile.coach!.championsLeague!.season} remain separate`;
});

finding('VERSUS-SYNC-REWARD-IMMUTABILITY', 'HIGH', () => {
  const members = [0, 1, 2, 3].map((index) => enrollVersus(createVersusClub(createInitialProfile(`audit-versus-${index}`, `Audit Versus ${index}`, ['FW', 'MF', 'DF', 'GK'][index] as any, start), start), 'AUDIT-GROUP', start));
  let season = createVersusSeason('AUDIT-GROUP', members, start, 4);
  for (let round = 1; round <= 6; round += 1) season = processVersusRound(season, round, new Date(start.getTime() + round * 86_400_000), new SeededRandom(900 + round));
  const finished = settleVersusSeason(season, new Date(start.getTime() + 7 * 86_400_000));
  const originalSeason = JSON.stringify(finished);
  let synced = syncVersusProfileWithSeason(members[0], finished, new Date(start.getTime() + 8 * 86_400_000));
  const money = synced.versus!.versusMoney;
  synced = syncVersusProfileWithSeason(synced, JSON.parse(originalSeason), new Date(start.getTime() + 9 * 86_400_000));
  assert.equal(synced.versus!.versusMoney, money);
  assert.equal(JSON.stringify(finished), originalSeason);
  assert.ok(synced.versus!.ledger && synced.versus!.ledger.length >= 14);
  const ledgerLength = synced.versus!.ledger!.length;
  synced = syncVersusProfileWithSeason(synced, JSON.parse(originalSeason), new Date(start.getTime() + 10 * 86_400_000));
  assert.equal(synced.versus!.ledger!.length, ledgerLength);
  return `fresh-season sync preserved reward wallet=${money}, ledger entries=${ledgerLength}, and input immutability`;
});

finding('CLUB-NON1011-LEAGUE', 'MEDIUM', () => {
  const profile = createInitialProfile('audit-league', 'Audit League', 'FW', start);
  profile.club = 'Blackburn Rovers';
  const enriched = ensureClubState(profile, start, new SeededRandom(77));
  assert.equal(enriched.clubState!.name, 'Blackburn Rovers');
  assert.equal(enriched.clubState!.standings.some((standing) => standing.clubName === 'Blackburn Rovers'), true);
  assert.equal(enriched.clubState!.fixtures.length, 38);
  return `league ${enriched.clubState!.standings.length} clubs, fixtures=${enriched.clubState!.fixtures.length}`;
});

console.log(JSON.stringify({ status: report.every((item) => item.status === 'PASS') ? 'PASS' : 'FAIL', findings: report }, null, 2));
