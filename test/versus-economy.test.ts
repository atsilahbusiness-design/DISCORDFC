import assert from 'node:assert/strict';
import test from 'node:test';
import { createInitialProfile } from '../src/domain/engine.js';
import { availableVersusCoin, createVersusMarket, placeVersusBid, settleExpiredVersusMarket, settleVersusMarketListing } from '../src/domain/versus-economy.js';
import { createVersusSeason, enrollVersus } from '../src/domain/versus-engine.js';
import type { PlayerProfile } from '../src/domain/types.js';

const START = new Date('2026-01-01T00:00:00.000Z');

function members(): PlayerProfile[] {
  return [
    enrollVersus(createInitialProfile('economy-a', 'Economy A', 'FW'), 'ECONOMY-42', START),
    enrollVersus(createInitialProfile('economy-b', 'Economy B', 'MF'), 'ECONOMY-42', START)
  ];
}

test('Versus season creates versioned Deal listings from system roster snapshots', () => {
  const season = createVersusSeason('ECONOMY-42', members(), START, 4);
  assert.equal(season.market?.listings.length, 6);
  assert.equal(season.market?.listings.every((listing) => listing.status === 'OPEN'), true);
  assert.equal(season.market?.listings.every((listing) => listing.rulesetVersion.startsWith('versus-economy-inferred')), true);
  assert.equal(season.market?.listings.every((listing) => listing.endsAt > listing.startsAt), true);
});

test('Versus bid reserves coin, raises safely, and releases prior bidder reservation', () => {
  const profiles = members();
  const season = createVersusSeason('ECONOMY-42', profiles, START, 4);
  const listing = season.market!.listings[0];
  const first = placeVersusBid(profiles, season, 'economy-a', listing.id, listing.openingBid, new Date('2026-01-01T00:00:10.000Z'));
  assert.equal(first.listing.currentBidderId, 'economy-a');
  assert.equal(first.profiles[0].versus!.reservations?.[0].amount, listing.openingBid);
  assert.equal(availableVersusCoin(first.profiles[0]), 20 - listing.openingBid);

  const second = placeVersusBid(first.profiles, first.season, 'economy-b', listing.id, listing.openingBid + 1, new Date('2026-01-01T00:00:20.000Z'));
  assert.equal(second.listing.currentBidderId, 'economy-b');
  assert.equal(second.profiles.find((profile) => profile.userId === 'economy-a')!.versus!.reservations?.length, 0);
  assert.equal(second.profiles.find((profile) => profile.userId === 'economy-b')!.versus!.reservations?.[0].amount, listing.openingBid + 1);
});

test('Versus auction settlement debits winner, moves player, and is idempotent', () => {
  const profiles = members();
  const season = createVersusSeason('ECONOMY-42', profiles, START, 4);
  const listing = season.market!.listings[0];
  const bid = placeVersusBid(profiles, season, 'economy-a', listing.id, listing.openingBid, new Date('2026-01-01T00:00:10.000Z'));
  const settled = settleVersusMarketListing(bid.profiles, bid.season, listing.id, new Date('2026-01-01T00:02:00.000Z'));
  const winner = settled.profiles.find((profile) => profile.userId === 'economy-a')!;
  assert.equal(winner.versus!.versusCoin, 20 - listing.openingBid);
  assert.equal(winner.versus!.reservations?.length, 0);
  assert.equal(winner.versus!.club.roster.some((player) => player.id === listing.player.id), true);
  assert.equal(settled.listing.status, 'SETTLED');
  assert.equal(winner.versus!.ledger?.some((entry) => entry.type === 'BID_SETTLED' && entry.amount === -listing.openingBid), true);

  const again = settleVersusMarketListing(settled.profiles, settled.season, listing.id, new Date('2026-01-01T00:03:00.000Z'));
  assert.equal(again.profiles.find((profile) => profile.userId === 'economy-a')!.versus!.versusCoin, winner.versus!.versusCoin);
});

test('Expired unbid listing closes without changing wallet', () => {
  const profiles = members();
  const season = createVersusMarket(createVersusSeason('ECONOMY-42', profiles, START, 4), START);
  const listing = season.market!.listings[0];
  const results = settleExpiredVersusMarket(profiles, season, new Date('2026-01-01T00:02:00.000Z'));
  assert.equal(results.length, season.market!.listings.length);
  assert.equal(results[0].listing.status, 'EXPIRED');
  assert.equal(results[0].profiles.every((profile) => profile.versus!.versusCoin === 20), true);
});
