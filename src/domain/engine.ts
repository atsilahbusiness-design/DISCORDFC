import {
  ABILITY_LABELS,
  type AbilityId,
  type AbilityState,
  type CareerStats,
  type MatchOutcome,
  type MatchRecord,
  type MatchResult,
  type PlayerProfile,
  type PlayerStats,
  type Position,
  type TrainResult
} from './types.js';

export interface RandomSource {
  next(): number;
}

export class MathRandomSource implements RandomSource {
  next(): number {
    return Math.random();
  }
}

export class SeededRandom implements RandomSource {
  private state: number;

  constructor(seed: number) {
    this.state = (seed >>> 0) || 1;
  }

  next(): number {
    let value = this.state;
    value ^= value << 13;
    value ^= value >>> 17;
    value ^= value << 5;
    this.state = value >>> 0;
    return this.state / 0x100000000;
  }
}

const DEFAULT_STATS: Record<Position, PlayerStats> = {
  GK: { atk: 25, def: 62, speed: 35, power: 48, strength: 55, technique: 46 },
  DF: { atk: 36, def: 62, speed: 48, power: 54, strength: 58, technique: 43 },
  MF: { atk: 51, def: 51, speed: 57, power: 46, strength: 45, technique: 61 },
  FW: { atk: 65, def: 31, speed: 60, power: 62, strength: 50, technique: 57 }
};

const ABILITIES: AbilityId[] = ['atk', 'def', 'speed', 'power', 'strength', 'technique'];
const TRAINING_COST = 15;
const MATCH_ENERGY_COST = 20;
const MATCH_HP_COST = 8;
const MAX_MATCH_GOALS = 5;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function isoNow(now: Date): string {
  return now.toISOString();
}

function nextAbilityExp(level: number): number {
  return Math.max(50, level * 100);
}

function defaultAbilities(): Record<AbilityId, AbilityState> {
  return Object.fromEntries(ABILITIES.map((id) => [id, { level: 1, exp: 0 }])) as Record<AbilityId, AbilityState>;
}

function cloneProfile(profile: PlayerProfile): PlayerProfile {
  return structuredClone(profile);
}

function recover(profile: PlayerProfile, now: Date): void {
  const elapsedMs = Math.max(0, now.getTime() - new Date(profile.lastActionAt).getTime());
  const elapsedHours = Math.floor(elapsedMs / 3_600_000);
  if (elapsedHours <= 0) return;
  profile.hp = clamp(profile.hp + elapsedHours * 2, 0, profile.maxHp);
  profile.energy = clamp(profile.energy + elapsedHours * 10, 0, profile.maxEnergy);
}

function calculateRating(profile: PlayerProfile): number {
  const weights: Record<Position, Array<keyof PlayerStats>> = {
    GK: ['def', 'strength', 'technique', 'power'],
    DF: ['def', 'strength', 'speed', 'technique'],
    MF: ['technique', 'speed', 'atk', 'def'],
    FW: ['atk', 'technique', 'speed', 'power']
  };
  const primary = weights[profile.position];
  const weighted = primary.reduce((sum, key, index) => sum + profile.stats[key] * (4 - index), 0) / 10;
  const secondary = (profile.stats.atk + profile.stats.def + profile.stats.speed + profile.stats.power + profile.stats.strength + profile.stats.technique) / 6;
  return Math.round(clamp(weighted * 0.7 + secondary * 0.3 + profile.level * 1.5, 1, 99));
}

function simulateGoals(attack: number, defence: number, rng: RandomSource): number {
  const pressure = clamp(0.65 + (attack - defence) / 90, 0.2, 1.5);
  let goals = 0;
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const chance = clamp(0.13 * pressure + attempt * 0.015, 0.04, 0.32);
    if (rng.next() < chance) goals += 1;
  }
  return Math.min(MAX_MATCH_GOALS, goals);
}

function outcomeFromScore(forGoals: number, againstGoals: number): MatchOutcome {
  if (forGoals > againstGoals) return 'WIN';
  if (forGoals < againstGoals) return 'LOSS';
  return 'DRAW';
}

function updateLeague(profile: PlayerProfile, outcome: MatchOutcome, goalsFor: number, goalsAgainst: number): void {
  profile.league.matchday += 1;
  profile.league.goalsFor += goalsFor;
  profile.league.goalsAgainst += goalsAgainst;
  if (outcome === 'WIN') {
    profile.league.wins += 1;
    profile.league.points += 3;
  } else if (outcome === 'DRAW') {
    profile.league.draws += 1;
    profile.league.points += 1;
  } else {
    profile.league.losses += 1;
  }
  if (profile.league.matchday > 10) {
    profile.league.season += 1;
    profile.league.matchday = 1;
    profile.league.points = 0;
    profile.league.wins = 0;
    profile.league.draws = 0;
    profile.league.losses = 0;
    profile.league.goalsFor = 0;
    profile.league.goalsAgainst = 0;
  }
}

export function createInitialProfile(userId: string, displayName: string, position: Position, now = new Date()): PlayerProfile {
  const timestamp = isoNow(now);
  const stats = structuredClone(DEFAULT_STATS[position]);
  return {
    userId,
    displayName,
    createdAt: timestamp,
    updatedAt: timestamp,
    age: 18,
    position,
    club: 'Rising City FC',
    money: 1_000,
    hp: 100,
    maxHp: 100,
    energy: 100,
    maxEnergy: 100,
    level: 1,
    totalExp: 0,
    stats,
    abilities: defaultAbilities(),
    career: {
      appearances: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goals: 0,
      assists: 0,
      steals: 0,
      cleanSheets: 0,
      yellowCards: 0,
      injuries: 0,
      seasonScore: 0
    } satisfies CareerStats,
    league: {
      season: 1,
      matchday: 1,
      points: 0,
      wins: 0,
      draws: 0,
      losses: 0,
      goalsFor: 0,
      goalsAgainst: 0
    },
    lastActionAt: timestamp
  };
}

export function getRating(profile: PlayerProfile): number {
  return calculateRating(profile);
}

export function trainPlayer(profileInput: PlayerProfile, ability: AbilityId, now = new Date(), rng: RandomSource = new MathRandomSource()): TrainResult {
  const profile = cloneProfile(profileInput);
  recover(profile, now);
  if (!ABILITIES.includes(ability)) throw new Error(`Unknown ability: ${ability}`);
  if (profile.energy < TRAINING_COST) throw new Error('Energi tidak cukup. Tunggu pemulihan atau gunakan perintah /rest pada fase berikutnya.');

  const state = profile.abilities[ability];
  const statBefore = profile.stats[ability];
  const expGained = 18 + Math.floor(rng.next() * 13);
  profile.energy -= TRAINING_COST;
  state.exp += expGained;
  profile.totalExp += expGained;
  let levelUp = false;
  while (state.exp >= nextAbilityExp(state.level)) {
    state.exp -= nextAbilityExp(state.level);
    state.level += 1;
    profile.stats[ability] = clamp(profile.stats[ability] + 1, 1, 99);
    profile.level = Math.max(profile.level, Math.floor(profile.totalExp / 100) + 1);
    levelUp = true;
  }
  profile.updatedAt = isoNow(now);
  profile.lastActionAt = isoNow(now);
  return {
    profile,
    ability,
    expGained,
    levelUp,
    statBefore,
    statAfter: profile.stats[ability]
  };
}

export function playMatch(profileInput: PlayerProfile, now = new Date(), rng: RandomSource = new MathRandomSource()): MatchResult {
  const profile = cloneProfile(profileInput);
  recover(profile, now);
  if (profile.energy < MATCH_ENERGY_COST) throw new Error('Energi tidak cukup untuk pertandingan.');
  if (profile.hp < MATCH_HP_COST) throw new Error('HP pemain terlalu rendah untuk pertandingan.');

  const playerRating = calculateRating(profile);
  const opponentRating = clamp(50 + profile.league.matchday * 2 + Math.floor(rng.next() * 35), 45, 92);
  const playerGoals = simulateGoals(playerRating + 8, opponentRating, rng);
  const opponentGoals = simulateGoals(opponentRating, playerRating + 2, rng);
  const outcome = outcomeFromScore(playerGoals, opponentGoals);
  const playerScore = clamp(5.5 + (playerGoals - opponentGoals) * 0.45 + rng.next() * 1.1, 4, 9.8);
  const exp = outcome === 'WIN' ? 42 : outcome === 'DRAW' ? 30 : 22;
  const money = outcome === 'WIN' ? 220 : outcome === 'DRAW' ? 140 : 90;
  const opponent = `Club ${String.fromCharCode(65 + ((profile.league.matchday - 1) % 26))}`;
  const record: MatchRecord = {
    id: `${profile.userId}-${now.getTime()}`,
    createdAt: isoNow(now),
    opponent,
    opponentRating,
    playerRating,
    outcome,
    playerGoals,
    opponentGoals,
    playerScore: Number(playerScore.toFixed(2)),
    rewards: { money, exp }
  };

  profile.energy -= MATCH_ENERGY_COST;
  profile.hp = clamp(profile.hp - MATCH_HP_COST, 0, profile.maxHp);
  profile.money += money;
  profile.totalExp += exp;
  profile.career.appearances += 1;
  profile.career.goals += playerGoals;
  profile.career.assists += playerGoals > 0 && rng.next() < 0.45 ? 1 : 0;
  profile.career.steals += profile.position === 'DF' || profile.position === 'MF' ? Math.floor(rng.next() * 2) : 0;
  profile.career.yellowCards += rng.next() < 0.08 ? 1 : 0;
  profile.career.cleanSheets += opponentGoals === 0 ? 1 : 0;
  profile.career.seasonScore = Number((profile.career.seasonScore + playerScore).toFixed(2));
  if (outcome === 'WIN') profile.career.wins += 1;
  if (outcome === 'DRAW') profile.career.draws += 1;
  if (outcome === 'LOSS') profile.career.losses += 1;
  updateLeague(profile, outcome, playerGoals, opponentGoals);
  profile.updatedAt = isoNow(now);
  profile.lastActionAt = isoNow(now);
  profile.lastMatch = record;

  const narrative = [
    `${profile.displayName} tampil untuk ${profile.club}.`,
    `Penguasaan pertandingan dipengaruhi rating tim ${playerRating} melawan ${opponentRating}.`,
    playerGoals > 0 ? `Kontribusi serangan menghasilkan ${playerGoals} gol.` : 'Belum ada gol yang tercipta dari sisi pemain.',
    `Skor penampilan pemain: ${playerScore.toFixed(2)}.`
  ];

  return { record, profile, narrative };
}

export function formatAbility(ability: AbilityId): string {
  return ABILITY_LABELS[ability];
}

export function recoverPlayer(profileInput: PlayerProfile, now = new Date()): PlayerProfile {
  const profile = cloneProfile(profileInput);
  recover(profile, now);
  profile.updatedAt = isoNow(now);
  profile.lastActionAt = isoNow(now);
  return profile;
}
