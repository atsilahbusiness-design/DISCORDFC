import { GAME_BALANCE } from '../config/game-balance.js';
import type { PlayerProfile, VersusClub, VersusLedgerEntry, VersusMarketListing, VersusMarketState, VersusPlayer, VersusSeason } from './types.js';

export const VERSUS_ECONOMY_RULESET_VERSION = 'versus-economy-inferred-v1';

type EconomyProfiles = PlayerProfile[];

export interface VersusEconomyResult {
  season: VersusSeason;
  profiles: EconomyProfiles;
  listing: VersusMarketListing;
}

function clone<T>(value: T): T {
  return structuredClone(value);
}

function iso(now: Date): string {
  return now.toISOString();
}

function positiveInteger(value: number, label: string): void {
  if (!Number.isInteger(value) || value <= 0) throw new Error(`${label} harus bilangan bulat lebih besar dari 0.`);
}

function appendLedger(profile: PlayerProfile, entry: Omit<VersusLedgerEntry, 'id' | 'createdAt' | 'balanceAfter'> & { id: string; createdAt?: string }, now: Date): void {
  const versus = profile.versus;
  if (!versus) throw new Error('Versus state belum tersedia.');
  versus.ledger ??= [];
  if (versus.ledger.some((item) => item.id === entry.id)) return;
  versus.ledger.unshift({
    ...entry,
    createdAt: entry.createdAt ?? iso(now),
    balanceAfter: versus.versusCoin
  });
  versus.ledger = versus.ledger.slice(0, 500);
}

function reservationTotal(profile: PlayerProfile, excludeListingId?: string): number {
  return (profile.versus?.reservations ?? [])
    .filter((reservation) => reservation.listingId !== excludeListingId)
    .reduce((sum, reservation) => sum + reservation.amount, 0);
}

function findOwnerClub(season: VersusSeason, userId: string): VersusClub {
  const club = season.clubs.find((item) => item.ownerId === userId && !item.isNpc);
  if (!club) throw new Error('Assigned Versus team tidak ditemukan pada season.');
  return club;
}

function marketPlayerSnapshot(player: VersusPlayer): VersusPlayer {
  return clone({ ...player, captain: false });
}

export function createVersusMarket(seasonInput: VersusSeason, now = new Date()): VersusSeason {
  const season = clone(seasonInput);
  const npcPlayers = season.clubs
    .filter((club) => club.isNpc)
    .flatMap((club) => club.roster.map((player) => ({ player, sourceClubId: club.id })))
    .sort((a, b) => b.player.value - a.player.value || a.player.id.localeCompare(b.player.id))
    .slice(0, GAME_BALANCE.versus.marketListingCount);
  const historical = season.market?.listings.filter((listing) => listing.status !== 'OPEN') ?? [];
  const cycleId = now.getTime();
  const listings: VersusMarketListing[] = npcPlayers.map(({ player, sourceClubId }, index) => {
    const openingBid = Math.max(GAME_BALANCE.versus.marketMinimumIncrement, Math.round(player.value / GAME_BALANCE.versus.marketOpeningBidDivisor));
    return {
      id: `market:${season.id}:${cycleId}:${index + 1}`,
      player: marketPlayerSnapshot(player),
      sourceClubId,
      currency: 'COIN',
      openingBid,
      minimumIncrement: GAME_BALANCE.versus.marketMinimumIncrement,
      startsAt: iso(now),
      endsAt: new Date(now.getTime() + GAME_BALANCE.versus.marketAuctionDurationSeconds * 1_000).toISOString(),
      status: 'OPEN',
      rulesetVersion: VERSUS_ECONOMY_RULESET_VERSION
    };
  });
  season.market = { generatedAt: iso(now), listings: [...historical, ...listings] };
  return season;
}

export function ensureVersusMarket(seasonInput: VersusSeason, now = new Date()): VersusSeason {
  const season = clone(seasonInput);
  const hasOpenListing = season.market?.listings.some((listing) => listing.status === 'OPEN' && new Date(listing.endsAt).getTime() > now.getTime());
  return season.market && hasOpenListing ? season : createVersusMarket(season, now);
}

export function placeVersusBid(profilesInput: EconomyProfiles, seasonInput: VersusSeason, bidderId: string, listingId: string, amount: number, now = new Date()): VersusEconomyResult {
  positiveInteger(amount, 'Bid');
  const profiles = profilesInput.map(clone);
  const season = ensureVersusMarket(seasonInput, now);
  const listing = season.market?.listings.find((item) => item.id === listingId);
  if (!listing) throw new Error('Market listing tidak ditemukan.');
  if (listing.status !== 'OPEN') throw new Error('Market listing sudah tidak terbuka.');
  if (new Date(listing.endsAt).getTime() <= now.getTime()) throw new Error('Countdown listing sudah berakhir.');
  const bidder = profiles.find((profile) => profile.userId === bidderId);
  if (!bidder?.versus) throw new Error('Versus wallet bidder tidak ditemukan.');
  const bidderClub = findOwnerClub(season, bidderId);
  const minimum = Math.max(listing.openingBid, (listing.currentBid ?? 0) + listing.minimumIncrement);
  if (amount < minimum) throw new Error(`Bid minimal ${minimum} coin.`);
  const available = bidder.versus.versusCoin - reservationTotal(bidder, listingId);
  const existingReservation = bidder.versus.reservations?.find((reservation) => reservation.listingId === listingId && reservation.userId === bidderId);
  const requiredAdditional = amount - (existingReservation?.amount ?? 0);
  if (available < requiredAdditional) throw new Error('Coin tersedia tidak cukup setelah reservation bid lain.');

  if (listing.currentBidderId && listing.currentBidderId !== bidderId) {
    const previousBidder = profiles.find((profile) => profile.userId === listing.currentBidderId);
    if (previousBidder?.versus) previousBidder.versus.reservations = (previousBidder.versus.reservations ?? []).filter((reservation) => reservation.listingId !== listingId);
  }

  bidder.versus.reservations ??= [];
  bidder.versus.reservations = bidder.versus.reservations.filter((reservation) => reservation.listingId !== listingId);
  bidder.versus.reservations.push({
    id: `reservation:${listingId}:${bidderId}`,
    listingId,
    userId: bidderId,
    currency: 'COIN',
    amount,
    createdAt: iso(now)
  });
  listing.currentBid = amount;
  listing.currentBidderId = bidderId;
  const transactionId = `bid:${listingId}:${bidderId}:${amount}`;
  appendLedger(bidder, { id: transactionId, seasonId: season.id, currency: 'COIN', amount: 0, note: `Coin reserved for ${listingId}: ${amount}`, type: 'BID_RESERVED', transactionId }, now);
  bidder.updatedAt = iso(now);
  return { season, profiles, listing: clone(listing) };
}

export function settleVersusMarketListing(profilesInput: EconomyProfiles, seasonInput: VersusSeason, listingId: string, now = new Date()): VersusEconomyResult {
  const profiles = profilesInput.map(clone);
  const season = clone(seasonInput);
  if (!season.market) throw new Error('Versus market belum dibuat.');
  const listing = season.market.listings.find((item) => item.id === listingId);
  if (!listing) throw new Error('Market listing tidak ditemukan.');
  if (listing.status === 'SETTLED' || listing.status === 'EXPIRED' || listing.status === 'CANCELLED') return { season, profiles, listing: clone(listing) };
  if (new Date(listing.endsAt).getTime() > now.getTime()) throw new Error('Listing belum mencapai expiry.');

  listing.settledAt = iso(now);
  const bid = listing.currentBid;
  const bidderId = listing.currentBidderId;
  if (!bid || !bidderId) {
    listing.status = 'EXPIRED';
    return { season, profiles, listing: clone(listing) };
  }

  const bidder = profiles.find((profile) => profile.userId === bidderId);
  if (!bidder?.versus) throw new Error('Bidder tidak tersedia untuk settlement.');
  const bidderClub = findOwnerClub(season, bidderId);
  if (bidderClub.versusCoin < bid || bidder.versus.versusCoin < bid) throw new Error('Coin bidder berubah sebelum settlement; listing perlu dispute review.');
  bidderClub.versusCoin -= bid;
  bidder.versus.versusCoin = bidderClub.versusCoin;
  bidder.versus.reservations = (bidder.versus.reservations ?? []).filter((reservation) => reservation.listingId !== listingId);
  const transactionId = `settle:${listingId}:${bidderId}`;
  appendLedger(bidder, { id: transactionId, seasonId: season.id, currency: 'COIN', amount: -bid, note: `Auction settlement ${listingId}`, type: 'BID_SETTLED', transactionId }, now);

  const sourceClub = season.clubs.find((club) => club.id === listing.sourceClubId);
  if (sourceClub) sourceClub.roster = sourceClub.roster.filter((player) => player.id !== listing.player.id);
  const acquiredPlayer = marketPlayerSnapshot(listing.player);
  acquiredPlayer.clubId = bidderClub.id;
  bidderClub.roster = [...bidderClub.roster.filter((player) => player.id !== acquiredPlayer.id), acquiredPlayer];
  bidderClub.rosterVersion += 1;
  listing.status = 'SETTLED';
  listing.winnerClubId = bidderClub.id;
  bidder.versus.club = clone(bidderClub);
  bidder.updatedAt = iso(now);
  return { season, profiles, listing: clone(listing) };
}

export function settleExpiredVersusMarket(profilesInput: EconomyProfiles, seasonInput: VersusSeason, now = new Date()): VersusEconomyResult[] {
  let profiles = profilesInput.map(clone);
  let season = clone(seasonInput);
  const expired = season.market?.listings.filter((listing) => listing.status === 'OPEN' && new Date(listing.endsAt).getTime() <= now.getTime()) ?? [];
  const results: VersusEconomyResult[] = [];
  for (const listing of expired) {
    const result = settleVersusMarketListing(profiles, season, listing.id, now);
    profiles = result.profiles;
    season = result.season;
    results.push(result);
  }
  return results;
}

export function availableVersusCoin(profile: PlayerProfile): number {
  return Math.max(0, (profile.versus?.versusCoin ?? 0) - reservationTotal(profile));
}
