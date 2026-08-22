import test from 'node:test';
import assert from 'node:assert/strict';
import { createInitialProfile, SeededRandom } from '../src/domain/engine.js';
import { createVersusSeason, enrollVersus, getVersusStandings, processVersusRound, settleVersusSeason, syncVersusProfileWithSeason } from '../src/domain/versus-engine.js';
import type { PlayerProfile } from '../src/domain/types.js';

function makeMembers(): PlayerProfile[] {
  return [
    enrollVersus(createInitialProfile('versus-a', 'Versus A', 'FW'), 'GROUP-42', new Date('2026-01-01T00:00:00.000Z')),
    enrollVersus(createInitialProfile('versus-b', 'Versus B', 'MF'), 'GROUP-42', new Date('2026-01-01T00:00:00.000Z'))
  ];
}

test('Versus creates an isolated multi-club home-away season', () => {
  const [first, second] = makeMembers();
  const season = createVersusSeason('GROUP-42', [first, second], new Date('2026-01-01T00:00:00.000Z'), 6);
  assert.equal(season.clubs.length, 6);
  assert.equal(season.battles.length, 6 * 5);
  assert.equal(season.battles.filter((battle) => battle.roundId === 1).length, 3);
  assert.equal(season.clubs.some((club) => club.id === first.versus!.clubId && club.id !== first.club), true);
  assert.equal(first.coach, undefined);
  assert.equal(first.clubState, undefined);
});

test('Versus round settles all scheduled battles with two-half stats and standings', () => {
  const [first, second] = makeMembers();
  const season = createVersusSeason('GROUP-42', [first, second], new Date('2026-01-01T00:00:00.000Z'), 4);
  const next = processVersusRound(season, 1, new Date('2026-01-02T00:00:00.000Z'), new SeededRandom(17));
  assert.equal(next.currentRound, 2);
  assert.equal(next.battles.filter((battle) => battle.roundId === 1 && battle.state === 'PUBLISHED').length, 2);
  const userBattle = next.battles.find((battle) => battle.roundId === 1 && (battle.homeClubId === first.versus!.clubId || battle.awayClubId === first.versus!.clubId));
  assert.ok(userBattle?.settlement);
  assert.equal(typeof userBattle!.settlement!.halftime.homeGoals, 'number');
  assert.equal(userBattle!.settlement!.rulesetVersion.startsWith('versus-recovery-inferred'), true);
  assert.equal(getVersusStandings(next).every((standing) => standing.played === 1), true);
  assert.throws(() => processVersusRound(next, 1, new Date('2026-01-02T00:00:00.000Z'), new SeededRandom(17)), /Round Versus berikutnya adalah 2/);
});

test('Versus season rewards are isolated and sync is idempotent', () => {
  let members = makeMembers();
  let season = createVersusSeason('GROUP-42', members, new Date('2026-01-01T00:00:00.000Z'), 4);
  const totalRounds = 2 * (season.clubs.length - 1);
  for (let round = 1; round <= totalRounds; round += 1) season = processVersusRound(season, round, new Date(`2026-01-${String(round + 1).padStart(2, '0')}T00:00:00.000Z`), new SeededRandom(round));
  const finished = settleVersusSeason(season, new Date('2026-02-01T00:00:00.000Z'));
  members = members.map((profile) => syncVersusProfileWithSeason(profile, finished, new Date('2026-02-01T00:00:00.000Z')));
  assert.equal(finished.state, 'FINISHED');
  assert.equal(finished.rewards.length, 4);
  for (const member of members) {
    assert.equal(member.versus!.status, 'GAMEOVER');
    assert.equal(member.versus!.history.length, 1);
    const moneyAfterFirstSync = member.versus!.versusMoney;
    const again = syncVersusProfileWithSeason(member, finished, new Date('2026-02-01T00:00:00.000Z'));
    assert.equal(again.versus!.history.length, 1);
    assert.equal(again.versus!.versusMoney, moneyAfterFirstSync);
    assert.equal(again.money, member.money);
  }
});
