export type Position = 'GK' | 'DF' | 'MF' | 'FW';
export type AbilityId = 'atk' | 'def' | 'speed' | 'power' | 'strength' | 'technique';
export type DetailedSkillId = 'shots' | 'penalty' | 'header' | 'pass' | 'dribbling' | 'freeKick' | 'offBallRunning' | 'holdOffDefenders' | 'teamwork' | 'endurance' | 'speed' | 'willpower';
export type MatchOutcome = 'WIN' | 'DRAW' | 'LOSS';
export type TacticId = 'balanced' | 'attacking' | 'defensive' | 'counter';
export type FormationId = '4-4-2' | '4-3-3' | '3-5-2' | '5-3-2';
export type ListingStatus = 'OPEN' | 'SOLD' | 'CANCELLED';
export type CareerMode = 'PLAYER' | 'COACH';
export type CareerStatus = 'ACTIVE' | 'RETIRED';
export type InjurySeverity = 'MINOR' | 'MODERATE' | 'MAJOR';
export type InjurySource = 'MATCH' | 'TRAINING' | 'EVENT';
export type HonorCategory = 'PERSONAL' | 'TEAM' | 'NATIONAL';
export type CultureSubject = 'science' | 'arts' | 'history';
export type TrainerTier = 'JUNIOR' | 'SENIOR' | 'EXPERT';

export interface AbilityState {
  level: number;
  exp: number;
}

export type DetailedSkillState = AbilityState;
export type DetailedSkills = Record<DetailedSkillId, DetailedSkillState>;

export interface PlayerStats {
  atk: number;
  def: number;
  speed: number;
  power: number;
  strength: number;
  technique: number;
}

export interface InjuryState {
  severity: InjurySeverity;
  weeksRemaining: number;
  source: InjurySource;
  treatmentUsed: boolean;
  diagnosedAt: string;
}

export interface ActiveTraining {
  skill: DetailedSkillId;
  completeAtWeek: number;
  expReward: number;
  hpCost: number;
}

export interface TrainerState {
  id: string;
  tier: TrainerTier;
  type: 'PHYSICAL' | 'TECHNICAL';
  ratio: number;
  weeklyCost: number;
  hiredAtWeek: number;
  active: boolean;
}

export interface CultureStudyState {
  subject: CultureSubject;
  completeAtWeek: number;
  charmReward: number;
  skillReward: DetailedSkillId;
  skillExpReward: number;
}

export interface TrickDefinition {
  id: string;
  name: string;
  description: string;
  requires: Partial<Record<DetailedSkillId, number>>;
  energyCost: number;
  matchModifier: number;
  source: 'WALKTHROUGH_OBSERVED' | 'RECOVERY_VERIFIED' | 'RECOVERY_INFERRED';
}

export interface HonorRecord {
  id: string;
  category: HonorCategory;
  title: string;
  season: number;
  description: string;
  source: 'RECOVERY_VERIFIED' | 'WALKTHROUGH_OBSERVED' | 'RECOVERY_INFERRED';
  value: number;
  awardedAt: string;
}

export interface WorldFootballerState {
  season: number;
  winner: string;
  userScore: number;
  userWon: boolean;
  resolved: boolean;
  candidates: Array<{ name: string; score: number }>;
}

export interface RetirementState {
  retiredAt: string;
  age: number;
  finalSeason: number;
  finalRating: number;
  finalGoals: number;
  finalHonors: number;
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
  week?: number;
  injury?: InjuryState;
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

export interface EventChoice {
  id: string;
  label: string;
  cost: number;
  rewardMoney: number;
  rewardExp: number;
  moraleDelta: number;
  skillEffects?: Partial<Record<DetailedSkillId, number>>;
  energyDelta?: number;
  charmDelta?: number;
}

export interface EventState {
  dayKey: string;
  eventId: string;
  title: string;
  description: string;
  choices: EventChoice[];
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
  mode?: CareerMode;
  careerStatus?: CareerStatus;
  careerYear?: number;
  careerWeek?: number;
  seasonWeek?: number;
  rebirthCount?: number;
  detailedSkills?: DetailedSkills;
  unassignedMatchExp?: number;
  injury?: InjuryState;
  activeTraining?: ActiveTraining;
  trainer?: TrainerState;
  cultureStudy?: CultureStudyState;
  charm?: number;
  unlockedTricks?: string[];
  honors?: HonorRecord[];
  worldFootballer?: WorldFootballerState;
  retirement?: RetirementState;
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

export interface DetailedTrainResult {
  profile: PlayerProfile;
  skill: DetailedSkillId;
  expGained: number;
  levelUps: number;
  levelBefore: number;
  levelAfter: number;
  energySpent: number;
}

export interface ExpAllocationResult {
  profile: PlayerProfile;
  allocated: number;
  remaining: number;
  levelsGained: number;
}

export interface TreatmentResult {
  profile: PlayerProfile;
  treatment: 'BASIC' | 'EXPERT';
  weeksRemoved: number;
  moneySpent: number;
}

export interface GameplayActionResult {
  profile: PlayerProfile;
  message: string;
}

export interface WeekResult {
  profile: PlayerProfile;
  week: number;
  season: number;
  narrative: string[];
  match?: MatchRecord;
  expAwaitingAssignment: number;
  injury?: InjuryState;
  award?: WorldFootballerState;
  retired: boolean;
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

export const ABILITIES: AbilityId[] = ['atk', 'def', 'speed', 'power', 'strength', 'technique'];

export const DETAILED_SKILLS: DetailedSkillId[] = ['shots', 'penalty', 'header', 'pass', 'dribbling', 'freeKick', 'offBallRunning', 'holdOffDefenders', 'teamwork', 'endurance', 'speed', 'willpower'];

export const ABILITY_LABELS: Record<AbilityId, string> = {
  atk: 'Attack',
  def: 'Defence',
  speed: 'Speed',
  power: 'Power',
  strength: 'Strength',
  technique: 'Technique'
};

export const DETAILED_SKILL_LABELS: Record<DetailedSkillId, string> = {
  shots: 'Shots',
  penalty: 'Penalty',
  header: 'Header',
  pass: 'Pass',
  dribbling: 'Dribbling',
  freeKick: 'Free Kick',
  offBallRunning: 'Off-ball Running',
  holdOffDefenders: 'Hold Off Defenders',
  teamwork: 'Teamwork',
  endurance: 'Endurance',
  speed: 'Speed',
  willpower: 'Willpower'
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

export const TRAINER_CATALOG: Record<string, Omit<TrainerState, 'hiredAtWeek'>> = {
  'junior-physical': { id: 'junior-physical', tier: 'JUNIOR', type: 'PHYSICAL', ratio: 0.04, weeklyCost: 90, active: true },
  'senior-technical': { id: 'senior-technical', tier: 'SENIOR', type: 'TECHNICAL', ratio: 0.07, weeklyCost: 180, active: true },
  'expert-complete': { id: 'expert-complete', tier: 'EXPERT', type: 'TECHNICAL', ratio: 0.11, weeklyCost: 320, active: true }
};

export const TRICK_CATALOG: Record<string, TrickDefinition> = {
  'bicycle-kick': {
    id: 'bicycle-kick',
    name: 'Bicycle Kick',
    description: 'Teknik akrobatik dengan bonus finishing situasional.',
    requires: { shots: 8, header: 6, dribbling: 6 },
    energyCost: 24,
    matchModifier: 0.06,
    source: 'WALKTHROUGH_OBSERVED'
  },
  'first-touch-turn': {
    id: 'first-touch-turn',
    name: 'First-touch Turn',
    description: 'Kontrol sentuhan pertama untuk mempercepat progresi bola.',
    requires: { dribbling: 7, pass: 6 },
    energyCost: 20,
    matchModifier: 0.04,
    source: 'RECOVERY_INFERRED'
  }
};

export const HONOR_CATEGORY_LABELS: Record<HonorCategory, string> = {
  PERSONAL: 'Personal',
  TEAM: 'Team',
  NATIONAL: 'National'
};

export function clampStat(value: number): number {
  return Math.min(99, Math.max(1, Math.round(value)));
}

export function createEmptyDetailedSkills(level = 1): DetailedSkills {
  return Object.fromEntries(DETAILED_SKILLS.map((skill) => [skill, { level, exp: 0 }])) as DetailedSkills;
}

export function deriveMacroStats(detailed: DetailedSkills): PlayerStats {
  const value = (skill: DetailedSkillId): number => detailed[skill]?.level ?? 1;
  return {
    atk: clampStat((value('shots') * 2 + value('dribbling') + value('offBallRunning')) / 4),
    def: clampStat((value('holdOffDefenders') * 2 + value('teamwork') + value('endurance')) / 4),
    speed: clampStat((value('speed') * 2 + value('offBallRunning') + value('dribbling')) / 4),
    power: clampStat((value('header') + value('holdOffDefenders') + value('endurance') + value('shots')) / 4),
    strength: clampStat((value('holdOffDefenders') * 2 + value('endurance') + value('willpower')) / 4),
    technique: clampStat((value('pass') + value('dribbling') * 2 + value('freeKick')) / 4)
  };
}

export function normalizeDetailedSkills(input: Partial<DetailedSkills> | undefined, fallbackLevel = 1): DetailedSkills {
  const defaults = createEmptyDetailedSkills(fallbackLevel);
  for (const skill of DETAILED_SKILLS) {
    const state = input?.[skill];
    if (!state) continue;
    defaults[skill] = { level: Math.max(1, Math.floor(state.level || fallbackLevel)), exp: Math.max(0, Math.floor(state.exp || 0)) };
  }
  return defaults;
}
