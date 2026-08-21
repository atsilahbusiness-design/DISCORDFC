export type Position = 'GK' | 'DF' | 'MF' | 'FW';
export type AbilityId = 'atk' | 'def' | 'speed' | 'power' | 'strength' | 'technique';
export type MatchOutcome = 'WIN' | 'DRAW' | 'LOSS';

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

export interface PlayerProfile {
  userId: string;
  displayName: string;
  createdAt: string;
  updatedAt: string;
  age: number;
  position: Position;
  club: string;
  money: number;
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
