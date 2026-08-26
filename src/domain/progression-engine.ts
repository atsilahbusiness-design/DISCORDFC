import { ensureClubState } from './club-engine.js';
import { createInitialProfile, MathRandomSource, type RandomSource } from './engine.js';
import { ensureGameplayState } from './gameplay-engine.js';
import { type ClubPlayer, type EconomyLedgerEntry, type ListingStatus, type MarketListing, type PlayerProfile } from './types.js';
import { SEED_MARKET_PLAYERS } from '../config/seed-data.js';
import { RECOVERY_PLAYERS, RECOVERY_CLUB_BY_ID } from '../config/recovery-data.js';

function clone<T>(value: T): T {
  return structuredClone(value);
}

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function dayKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(key: string, days: number): string {
  const date = new Date(`${key}T00:00:00.000Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dayKey(date);
}

function ledger(profile: PlayerProfile, type: string, amount: number, note: string, now: Date): void {
  profile.ledger ??= [];
  profile.money += amount;
  profile.ledger.unshift({ id: `${profile.userId}-${now.getTime()}-${profile.ledger.length}`, createdAt: now.toISOString(), type, amount, balanceAfter: profile.money, note });
  profile.ledger = profile.ledger.slice(0, 100);
}

export function claimDailyReward(profileInput: PlayerProfile, now = new Date()): { profile: PlayerProfile; amount: number; exp: number; streak: number } {
  const profile = clone(profileInput);
  profile.daily ??= { streak: 0 };
  const today = dayKey(now);
  if (profile.daily.lastClaimDate === today) throw new Error('Daily reward hari ini sudah diambil.');
  const yesterday = addDays(today, -1);
  profile.daily.streak = profile.daily.lastClaimDate === yesterday ? profile.daily.streak + 1 : 1;
  profile.daily.lastClaimDate = today;
  const amount = 100 + Math.min(profile.daily.streak * 25, 250);
  const exp = 20 + profile.daily.streak * 5;
  ledger(profile, 'DAILY_REWARD', amount, `Daily reward streak ${profile.daily.streak}`, now);
  profile.totalExp += exp;
  profile.level = Math.max(profile.level, Math.floor(profile.totalExp / 100) + 1);
  profile.updatedAt = now.toISOString();
  profile.lastActionAt = now.toISOString();
  return { profile, amount, exp, streak: profile.daily.streak };
}

/**
 * Player incidents are intentionally not generated here. The recovered/public
 * evidence supports conditional career activities and seasonal content, but it
 * does not validate a daily random choice table or Money costs. Legacy JSON
 * rows named `event` are ignored by the active Player lifecycle.
 */

function marketPlayer(id: string, name: string, position: ClubPlayer['position'], overall: number, price: number, now: Date, originClubId?: number): MarketListing {
  const stats = {
    atk: clamp(overall + (position === 'FW' ? 7 : 0), 20, 99),
    def: clamp(overall + (position === 'DF' || position === 'GK' ? 7 : 0), 20, 99),
    speed: clamp(overall + (position === 'FW' || position === 'MF' ? 5 : 0), 20, 99),
    power: clamp(overall + 1, 20, 99),
    strength: clamp(overall + (position === 'DF' ? 5 : 0), 20, 99),
    technique: clamp(overall + (position === 'MF' ? 7 : 0), 20, 99)
  };
  const player: ClubPlayer = {
    id,
    name,
    position,
    age: 18 + (overall % 14),
    overall,
    stats,
    morale: 75,
    hp: 100,
    maxHp: 100,
    salary: Math.round(price / 20),
    contractUntil: new Date(now.getTime() + 365 * 86_400_000).toISOString(),
    isUserPlayer: false,
    goals: 0,
    assists: 0,
    appearances: 0
  };
  if (originClubId !== undefined) player.originClubId = originClubId;
  return { id: `listing-${id}`, sellerUserId: 'system-market', player, price, status: 'OPEN', createdAt: now.toISOString() };
}

function recoveryPosition(code: number): ClubPlayer['position'] {
  if (code === 13) return 'GK';
  if (code >= 10 && code <= 12) return 'DF';
  if (code >= 5 && code <= 9) return 'MF';
  return 'FW';
}

function recoveryMarket(now: Date): MarketListing[] {
  return RECOVERY_PLAYERS.slice(0, 24).map((record) => {
    const position = recoveryPosition(record.positionCode);
    const overall = clamp(52 + Math.abs(record.normalValue % 38), 45, 92);
    const name = record.nameEn || record.nameCn || `Player ${record.num}`;
    const listing = marketPlayer(`recovery-${record.clubId}-${record.num}`, name, position, overall, Math.max(100, record.price), now, record.clubId);
    listing.player.age = record.initAge;
    listing.player.contractUntil = new Date(now.getTime() + 365 * 86_400_000).toISOString();
    return listing;
  });
}

export function refreshMarket(profileInput: PlayerProfile, now = new Date(), force = false): PlayerProfile {
  const profile = clone(profileInput);
  const cooldownMs = 6 * 60 * 60 * 1_000;
  if (!force && profile.market?.length && profile.marketUpdatedAt) {
    const elapsed = now.getTime() - new Date(profile.marketUpdatedAt).getTime();
    if (elapsed < cooldownMs) throw new Error(`Market baru dapat di-refresh lagi dalam ${Math.ceil((cooldownMs - elapsed) / 3_600_000)} jam.`);
  }
  const recovered = recoveryMarket(now);
  profile.market = recovered.length > 0 ? recovered : SEED_MARKET_PLAYERS.map((player) => marketPlayer(player.id, player.name, player.position, player.overall, player.price, now));
  profile.marketUpdatedAt = now.toISOString();
  profile.updatedAt = now.toISOString();
  return profile;
}

export function buyMarketPlayer(profileInput: PlayerProfile, listingId: string, now = new Date(), rng: RandomSource = new MathRandomSource()): { profile: PlayerProfile; listing: MarketListing } {
  const profile = ensureClubState(profileInput, now, rng);
  profile.market ??= [];
  const listing = profile.market.find((item) => item.id === listingId && item.status === 'OPEN');
  if (!listing) throw new Error('Listing tidak ditemukan atau sudah tidak tersedia.');
  if (profile.money < listing.price) throw new Error('Money tidak cukup untuk membeli pemain ini.');
  if (profile.clubState!.roster.some((player) => player.id === listing.player.id)) throw new Error('Pemain tersebut sudah berada di roster Anda.');
  if (profile.clubState!.roster.length >= 32) throw new Error('Roster sudah penuh. Jual pemain non-user sebelum membeli pemain baru.');
  ledger(profile, 'TRANSFER_BUY', -listing.price, `Membeli ${listing.player.name}`, now);
  listing.status = 'SOLD';
  listing.buyerUserId = profile.userId;
  listing.player.isUserPlayer = false;
  profile.clubState!.roster.push(listing.player);
  profile.updatedAt = now.toISOString();
  return { profile, listing };
}

export function sellClubPlayer(profileInput: PlayerProfile, playerId: string, now = new Date(), rng: RandomSource = new MathRandomSource()): { profile: PlayerProfile; price: number; player: ClubPlayer } {
  const profile = ensureClubState(profileInput, now, rng);
  const playerIndex = profile.clubState!.roster.findIndex((player) => player.id === playerId && !player.isUserPlayer);
  if (playerIndex === -1) throw new Error('Pemain tidak ditemukan atau pemain utama tidak dapat dijual.');
  const [player] = profile.clubState!.roster.splice(playerIndex, 1);
  const price = Math.max(100, Math.round(player.overall * 18 + player.morale * 4));
  ledger(profile, 'TRANSFER_SELL', price, `Menjual ${player.name}`, now);
  profile.updatedAt = now.toISOString();
  return { profile, price, player };
}

export function setListingStatus(profileInput: PlayerProfile, listingId: string, status: ListingStatus, now = new Date()): PlayerProfile {
  const profile = clone(profileInput);
  const listing = profile.market?.find((item) => item.id === listingId);
  if (!listing) throw new Error('Listing tidak ditemukan.');
  listing.status = status;
  profile.updatedAt = now.toISOString();
  return profile;
}

export function formatMoney(value: number): string {
  return new Intl.NumberFormat('id-ID').format(value);
}
