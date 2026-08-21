export type Position = 'GK' | 'DF' | 'MF' | 'FW';
export type AbilityId = 'atk' | 'def' | 'speed' | 'power' | 'strength' | 'technique';
export type MatchOutcome = 'WIN' | 'DRAW' | 'LOSS';
export type TacticId = 'balanced' | 'attacking' | 'defensive' | 'counter';
export type FormationId = '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2';
export type ListingStatus = 'OPEN' | 'SOLD' | 'CANCELLED';

export interface AbilityState {
  level: number;
  exp: number;
}

export interface PlayerStats {
  atk: number;
  def: number;
  speed: number;
  power: number;
  strength: number;
  technique: number;
}

export interface CareerStats {
  appearances: number;
  wins: number;
  draws: number;
  losses: number;
  goals: number;
  assists: number;
  steals: number;
  cleanSheets: number;
  yellowCards: number;
  injuries: number;
  seasonScore: number;
}

export interface MatchRecord {
  id: string;
  createdAt: string;
  opponent: string;
  opponentRating: number;
  playerRating: number;
  outcome: MatchOutcome;
  playerGoals: number;
  opponentGoals: number;
  playerScore: number;
  rewards: {
    money: number;
    exp: number;
  };
}

export interface LeagueState {
  season: number;
  matchday: number;
  points: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
}

export interface ClubPlayer {
  id: string;
  name: string;
  position: Position;
  age: number;
  overall: number;
  stats: PlayerStats;
  morale: number;
  hp: number;
  maxHp: number;
  salary: number;
  contractUntil: string;
  isUserPlayer: boolean;
  goals: number;
  assists: number;
  appearances: number;
  injuredUntil?: string;
}

export interface FormationConfig {
  id: FormationId;
  name: string;
  slots: Record<Position, number>;
  attackMultiplier: number;
  defenceMultiplier: number;
  controlMultiplier: number;
}

export interface ClubFixture {
  id: string;
  season: number;
  matchday: number;
  homeClub: string;
  awayClub: string;
  played: boolean;
  homeGoals?: number;
  awayGoals?: number;
  playedAt?: string;
}

export interface CompetitionStanding {
  clubId: string;
  clubName: string;
  played: number;
  wins: number;
  draws: number;
  losses: number;
  goalsFor: number;
  goalsAgainst: number;
  points: number;
}

export interface ContractState {
  id: string;
  clubId: string;
  salary: number;
  beginTime: string;
  endTime: string;
  state: 'ACTIVE' | 'EXPIRED' | 'REJECTED';
  type: 'INITIAL' | 'RENEWAL' | 'TRANSFER';
}

export interface ChampionsLeagueState {
  season: number;
  round: number;
  opponent: string;
  homeGoals: number;
  awayGoals: number;
  aggregate: number;
  status: 'QUALIFIED' | 'ACTIVE' | 'ELIMINATED' | 'CHAMPION';
}

export interface AchievementState {
  id: string;
  title: string;
  description: string;
  target: number;
  progress: number;
  claimed: boolean;
  rewardMoney: number;
  rewardExp: number;
}

export interface ClubState {
  id: string;
  officialId?: number;
  name: string;
  level: number;
  leagueTier?: number;
  officialGrade?: number;
  provenance?: 'SEED_FALLBACK' | 'RECOVERY_VERIFIED';
  prestige: number;
  assets: number;
  salaryBudget: number;
  formation: FormationId;
  tactic: TacticId;
  roster: ClubPlayer[];
  fixtures: ClubFixture[];
  standings: CompetitionStanding[];
  nextFixtureAt: string;
  championsLeagueQualified: boolean;
  championsLeagueRound: number;
}

export interface MarketListing {
  id: string;
  sellerUserId: string;
  player: ClubPlayer;
  price: number;
  status: ListingStatus;
  createdAt: string;
  buyerUserId?: string;
}

export interface DailyState {
  lastClaimDate?: string;
  streak: number;
}

export interface EventState {
  dayKey: string;
  eventId: string;
  title: string;
  description: string;
  choices: Array<{ id: string; label: string; cost: number; rewardMoney: number; rewardExp: number; moraleDelta: number }>;
  resolved: boolean;
}

export interface EconomyLedgerEntry {
  id: string;
  createdAt: string;
  type: string;
  amount: number;
  balanceAfter: number;
  note: string;
}

export interface PlayerProfile {
  version?: number;
  userId: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  age: number;
  position: Position;
  club: string;
  money: number;
  maxMoney?: number;
  hp: number;
  maxHp: number;
  energy: number;
  maxEnergy: number;
  level: number;
  totalExp: number;
  stats: PlayerStats;
  abilities: Record<AbilityId, AbilityState>;
  career: CareerStats;
  league: LeagueState;
  lastActionAt: string;
  lastMatch?: MatchRecord;
  clubState?: ClubState;
  daily?: DailyState;
  event?: EventState;
  championsLeague?: ChampionsLeagueState;
  contract?: ContractState;
  achievements?: AchievementState[];
  market?: MarketListing[];
  marketUpdatedAt?: string;
  ledger?: EconomyLedgerEntry[];
}

export interface MatchResult {
  record: MatchRecord;
  profile: PlayerProfile;
  narrative: string[];
}

export interface TrainResult {
  profile: PlayerProfile;
  ability: AbilityId;
  expGained: number;
  levelUp: boolean;
  statBefore: number;
  statAfter: number;
}

export interface ClubMatchResult {
  profile: PlayerProfile;
  fixture: ClubFixture;
  homeGoals: number;
  awayGoals: number;
  outcome: MatchOutcome;
  mvp: ClubPlayer;
  commentary: string[];
}

export const ABILITY_LABELS: Record<AbilityId, string> = {
  atk: 'Attack',
  def: 'Defence',
  speed: 'Speed',
  power: 'Power',
  strength: 'Strength',
  technique: 'Technique'
};

export const POSITION_LABELS: Record<Position, string> = {
  GK: 'Goalkeeper',
  DF: 'Defender',
  MF: 'Midfielder',
  FW: 'Forward'
};

export const FORMATIONS: Record<FormationId, FormationConfig> = {
  '4-4-2': { id: '4-4-2', name: 'Balanced 4-4-2', slots: { GK: 1, DF: 4, MF: 4, FW: 2 }, attackMultiplier: 1, defenceMultiplier: 1, controlMultiplier: 1 },
  '4-3-3': { id: '4-3-3', name: 'Attacking 4-3-3', slots: { GK: 1, DF: 4, MF: 3, FW: 3 }, attackMultiplier: 1.08, defenceMultiplier: 0.96, controlMultiplier: 1.02 },
  '3-5-2': { id: '3-5-2', name: 'Control 3-5-2', slots: { GK: 1, DF: 3, MF: 5, FW: 2 }, attackMultiplier: 1.02, defenceMultiplier: 0.98, controlMultiplier: 1.08 },
  '5-3-2': { id: '5-3-2', name: 'Defensive 5-3-2', slots: { GK: 1, DF: 5, MF: 3, FW: 2 }, attackMultiplier: 0.94, defenceMultiplier: 1.1, controlMultiplier: 0.96 }
};

export const TACTICS: Record<TacticId, { name: string; attackMultiplier: number; defenceMultiplier: number; controlMultiplier: number; description: string }> = {
  balanced: { name: 'Balanced', attackMultiplier: 1, defenceMultiplier: 1, controlMultiplier: 1, description: 'Tidak memiliki kelemahan besar.' },
  attacking: { name: 'Attacking', attackMultiplier: 1.1, defenceMultiplier: 0.92, controlMultiplier: 0.98, description: 'Menambah tekanan serangan dengan risiko pertahanan.' },
  defensive: { name: 'Defensive', attackMultiplier: 0.9, defenceMultiplier: 1.1, controlMultiplier: 1.02, description: 'Mengurangi serangan dan memperkuat pertahanan.' },
  counter: { name: 'Counter Attack', attackMultiplier: 1.05, defenceMultiplier: 1.02, controlMultiplier: 0.95, description: 'Mengandalkan transisi cepat setelah bertahan.' }
};
