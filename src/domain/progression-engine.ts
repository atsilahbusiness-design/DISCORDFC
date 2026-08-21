import { ensureClubState } from './club-engine.js';
import { createInitialProfile, MathRandomSource, type RandomSource } from './engine.js';
import type { ClubPlayer, EconomyLedgerEntry, EventState, ListingStatus, MarketListing, PlayerProfile } from './types.js';

function clone<T>(value: T): T {
  return structuredClone(value);
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
  profile.updatedAt = now.toISOString();
  profile.lastActionAt = now.toISOString();
  return { profile, amount, exp, streak: profile.daily.streak };
}

const EVENT_TEMPLATES: Array<Omit<EventState, 'dayKey' | 'resolved'>> = [
  {
    eventId: 'academy-visitor',
    title: 'Pelatih Akademi Berkunjung',
    description: 'Seorang pelatih muda menawarkan sesi khusus untuk meningkatkan kemampuan pemain.',
    choices: [
      { id: 'accept', label: 'Ikuti sesi latihan', cost: 100, rewardMoney: 0, rewardExp: 65, moraleDelta: 4 },
      { id: 'decline', label: 'Tolak dengan sopan', cost: 0, rewardMoney: 40, rewardExp: 15, moraleDelta: 0 }
    ]
  },
  {
    eventId: 'sponsor-call',
    title: 'Telepon Sponsor',
    description: 'Sponsor klub menawarkan bonus cepat dengan imbalan komitmen promosi.',
    choices: [
      { id: 'sign', label: 'Terima tawaran sponsor', cost: 0, rewardMoney: 180, rewardExp: 25, moraleDelta: -1 },
      { id: 'wait', label: 'Tunggu tawaran lebih baik', cost: 0, rewardMoney: 30, rewardExp: 10, moraleDelta: 2 }
    ]
  },
  {
    eventId: 'locker-room',
    title: 'Kejadian Ruang Ganti',
    description: 'Tim membutuhkan pemimpin untuk menyelesaikan ketegangan sebelum pertandingan.',
    choices: [
      { id: 'lead', label: 'Ambil tanggung jawab', cost: 50, rewardMoney: 20, rewardExp: 60, moraleDelta: 8 },
      { id: 'avoid', label: 'Biarkan kapten menangani', cost: 0, rewardMoney: 0, rewardExp: 15, moraleDelta: -2 }
    ]
  }
];

export function generateDailyEvent(profileInput: PlayerProfile, now = new Date(), rng: RandomSource = new MathRandomSource()): PlayerProfile {
  const profile = clone(profileInput);
  const today = dayKey(now);
  if (profile.event?.dayKey === today) return profile;
  const template = EVENT_TEMPLATES[Math.floor(rng.next() * EVENT_TEMPLATES.length)];
  profile.event = { ...clone(template), dayKey: today, resolved: false };
  profile.updatedAt = now.toISOString();
  return profile;
}

export function resolveDailyEvent(profileInput: PlayerProfile, choiceId: string, now = new Date()): { profile: PlayerProfile; choice: EventState['choices'][number] } {
  const profile = clone(profileInput);
  if (!profile.event || profile.event.dayKey !== dayKey(now)) throw new Error('Belum ada event aktif hari ini.');
  if (profile.event.resolved) throw new Error('Event hari ini sudah diselesaikan.');
  const choice = profile.event.choices.find((item) => item.id === choiceId);
  if (!choice) throw new Error('Pilihan event tidak ditemukan.');
  if (profile.money < choice.cost) throw new Error('Money tidak cukup untuk pilihan ini.');
  if (choice.cost > 0) ledger(profile, 'EVENT_COST', -choice.cost, `Cost event ${profile.event.eventId}`, now);
  if (choice.rewardMoney > 0) ledger(profile, 'EVENT_REWARD', choice.rewardMoney, `Reward event ${profile.event.eventId}`, now);
  profile.totalExp += choice.rewardExp;
  profile.event.resolved = true;
  profile.updatedAt = now.toISOString();
  profile.lastActionAt = now.toISOString();
  return { profile, choice };
}

function marketPlayer(id: string, name: string, position: ClubPlayer['position'], overall: number, price: number, now: Date): MarketListing {
  const stats = { atk: overall, def: overall, speed: overall, power: overall, strength: overall, technique: overall };
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
  return { id: `listing-${id}`, sellerUserId: 'system-market', player, price, status: 'OPEN', createdAt: now.toISOString() };
}

export function refreshMarket(profileInput: PlayerProfile, now = new Date()): PlayerProfile {
  const profile = clone(profileInput);
  profile.market = [
    marketPlayer('market-1', 'Rafi Alvaro', 'FW', 68, 1_200, now),
    marketPlayer('market-2', 'Satria Malik', 'MF', 65, 950, now),
    marketPlayer('market-3', 'Tio Baskara', 'DF', 70, 1_350, now),
    marketPlayer('market-4', 'Yusuf Hendra', 'GK', 67, 1_100, now)
  ];
  profile.updatedAt = now.toISOString();
  return profile;
}

export function buyMarketPlayer(profileInput: PlayerProfile, listingId: string, now = new Date()): { profile: PlayerProfile; listing: MarketListing } {
  const profile = ensureClubState(profileInput, now);
  profile.market ??= [];
  const listing = profile.market.find((item) => item.id === listingId && item.status === 'OPEN');
  if (!listing) throw new Error('Listing tidak ditemukan atau sudah tidak tersedia.');
  if (profile.money < listing.price) throw new Error('Money tidak cukup untuk membeli pemain ini.');
  ledger(profile, 'TRANSFER_BUY', -listing.price, `Membeli ${listing.player.name}`, now);
  listing.status = 'SOLD';
  listing.buyerUserId = profile.userId;
  listing.player.isUserPlayer = false;
  profile.clubState!.roster.push(listing.player);
  profile.updatedAt = now.toISOString();
  return { profile, listing };
}

export function sellClubPlayer(profileInput: PlayerProfile, playerId: string, now = new Date()): { profile: PlayerProfile; price: number; player: ClubPlayer } {
  const profile = ensureClubState(profileInput, now);
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
