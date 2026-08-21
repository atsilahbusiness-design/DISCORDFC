import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialProfile, SeededRandom } from '../src/domain/engine.js';
import { ensureClubState, getClubRating, playClubMatch, setClubFormation, setClubTactic } from '../src/domain/club-engine.js';
import { joinOfficialClub, listOfficialClubs } from '../src/domain/official-club-engine.js';
import { buyMarketPlayer, claimDailyReward, generateDailyEvent, refreshMarket, resolveDailyEvent, sellClubPlayer } from '../src/domain/progression-engine.js';

test('official club data exposes league 1011 and supports club transfer', () => {
  const clubs = listOfficialClubs(1011);
  assert.equal(clubs.length >= 10, true);
  let profile = ensureClubState(createInitialProfile('transfer-1', 'Transfer', 'FW'));
  profile.money = 20_000;
  const target = clubs.find((club) => club.nameEn !== profile.club)!;
  profile = joinOfficialClub(profile, target.id, new Date('2026-01-01T00:00:00.000Z'));
  assert.equal(profile.clubState?.officialId, target.id);
  assert.equal(profile.clubState?.provenance, 'RECOVERY_VERIFIED');
  assert.equal(profile.ledger?.[0]?.type, 'TRANSFER_FEE');
  assert.equal(profile.ledger?.[0]?.amount, -Math.max(250, Math.round(target.salaryBase / 100)));
});

test('recovery data seeds an official club and roster names', () => {
  const profile = ensureClubState(createInitialProfile('recovery-1', 'Recovery', 'FW'), new Date('2026-01-01T00:00:00.000Z'), new SeededRandom(5));
  assert.equal(profile.club, 'Arsenal');
  assert.equal(profile.clubState?.provenance, 'RECOVERY_VERIFIED');
  assert.equal(profile.clubState?.roster.some((player) => player.name === 'David Raya'), true);
});

test('club state creates a roster and can change formation and tactic', () => {
  const profile = createInitialProfile('club-1', 'Club Owner', 'MF');
  let enriched = ensureClubState(profile, new Date('2026-01-01T00:00:00.000Z'), new SeededRandom(5));
  assert.equal(enriched.clubState?.roster.length, 16);
  enriched = setClubFormation(enriched, '4-3-3');
  enriched = setClubTactic(enriched, 'attacking');
  assert.equal(enriched.clubState?.formation, '4-3-3');
  assert.equal(enriched.clubState?.tactic, 'attacking');
  assert.equal(getClubRating(enriched) > 0, true);
});

test('club match updates fixture and standings', () => {
  const profile = ensureClubState(createInitialProfile('club-2', 'Match Coach', 'FW'), new Date('2026-01-01T00:00:00.000Z'), new SeededRandom(8));
  const result = playClubMatch(profile, new Date('2026-01-02T00:00:00.000Z'), new SeededRandom(9));
  assert.equal(result.fixture.played, true);
  assert.equal(result.profile.clubState?.standings.find((standing) => standing.clubId === result.profile.club)?.played, 1);
  assert.equal(result.mvp.name.length > 0, true);
});

test('daily reward enforces one claim per day and streaks on consecutive days', () => {
  const profile = createInitialProfile('daily-1', 'Daily', 'GK');
  const first = claimDailyReward(profile, new Date('2026-01-01T00:00:00.000Z'));
  assert.equal(first.streak, 1);
  assert.throws(() => claimDailyReward(first.profile, new Date('2026-01-01T12:00:00.000Z')), /sudah diambil/);
  const second = claimDailyReward(first.profile, new Date('2026-01-02T00:00:00.000Z'));
  assert.equal(second.streak, 2);
  assert.equal(second.amount > first.amount, true);
});

test('daily event can be resolved and writes a reward', () => {
  const profile = ensureClubState(generateDailyEvent(createInitialProfile('event-1', 'Event', 'DF'), new Date('2026-01-01T00:00:00.000Z'), new SeededRandom(2)), new Date('2026-01-01T00:00:00.000Z'), new SeededRandom(3));
  const choice = profile.event!.choices[0];
  const moraleBefore = profile.clubState!.roster.find((player) => player.isUserPlayer)!.morale;
  const result = resolveDailyEvent(profile, choice.id, new Date('2026-01-01T01:00:00.000Z'));
  const moraleAfter = result.profile.clubState!.roster.find((player) => player.isUserPlayer)!.morale;
  assert.equal(result.profile.event?.resolved, true);
  assert.equal(result.profile.totalExp >= choice.rewardExp, true);
  assert.equal(moraleAfter, Math.min(100, moraleBefore + choice.moraleDelta));
});

test('market refresh supports buying and selling non-user players', () => {
  let profile = ensureClubState(createInitialProfile('market-1', 'Market', 'DF'), new Date('2026-01-01T00:00:00.000Z'), new SeededRandom(4));
  profile.money = 5_000;
  profile = refreshMarket(profile, new Date('2026-01-01T00:00:00.000Z'));
  assert.throws(() => refreshMarket(profile, new Date('2026-01-01T01:00:00.000Z')), /refresh lagi/);
  const listing = profile.market![0];
  const bought = buyMarketPlayer(profile, listing.id, new Date('2026-01-01T01:00:00.000Z'));
  assert.equal(bought.profile.clubState?.roster.some((player) => player.id === listing.player.id), true);
  const sold = sellClubPlayer(bought.profile, listing.player.id, new Date('2026-01-01T02:00:00.000Z'));
  assert.equal(sold.price > 0, true);
});
