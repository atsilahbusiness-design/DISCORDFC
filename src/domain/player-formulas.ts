import { GAME_BALANCE } from '../config/game-balance.js';
import type { RandomSource } from './engine.js';
import type { AbilityId, DetailedSkillId, MatchOutcome, PlayerProfile } from './types.js';

/**
 * This is a calibrated/inferred ruleset until controlled observations from the
 * original client are available. Historical match records must keep this id.
 */
export const PLAYER_FORMULA_VERSION = 'player-formula-inferred-2026-08';

const RATING_WEIGHTS: Record<PlayerProfile['position'], Array<[DetailedSkillId, number]>> = {
  GK: [['willpower', 0.25], ['teamwork', 0.2], ['pass', 0.2], ['endurance', 0.2], ['header', 0.15]],
  DF: [['holdOffDefenders', 0.3], ['teamwork', 0.2], ['endurance', 0.2], ['header', 0.15], ['pass', 0.15]],
  MF: [['pass', 0.28], ['dribbling', 0.22], ['teamwork', 0.2], ['offBallRunning', 0.15], ['endurance', 0.15]],
  FW: [['shots', 0.25], ['offBallRunning', 0.2], ['dribbling', 0.18], ['header', 0.14], ['holdOffDefenders', 0.13], ['speed', 0.1]]
};

const MACRO_WEIGHTS: Record<PlayerProfile['position'], AbilityId[]> = {
  GK: ['def', 'strength', 'technique', 'power'],
  DF: ['def', 'strength', 'speed', 'technique'],
  MF: ['technique', 'speed', 'atk', 'def'],
  FW: ['atk', 'technique', 'speed', 'power']
};

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function calculatePlayerRating(profile: Pick<PlayerProfile, 'position' | 'detailedSkills' | 'stats' | 'level'>): number {
  if (profile.detailedSkills) {
    const weighted = RATING_WEIGHTS[profile.position].reduce(
      (sum, [skill, weight]) => sum + (profile.detailedSkills?.[skill]?.level ?? 1) * weight,
      0
    );
    const average = Object.values(profile.detailedSkills).reduce((sum, state) => sum + state.level, 0) / Math.max(1, Object.keys(profile.detailedSkills).length);
    return Math.round(clamp(weighted * 0.72 + average * 0.18 + profile.level * 1.5, 1, 99));
  }

  const primary = MACRO_WEIGHTS[profile.position];
  const weighted = primary.reduce((sum, key, index) => sum + profile.stats[key] * (4 - index), 0) / 10;
  const secondary = Object.values(profile.stats).reduce((sum, value) => sum + value, 0) / 6;
  return Math.round(clamp(weighted * 0.7 + secondary * 0.3 + profile.level * 1.5, 1, 99));
}

export function trainingExpFor(rng: RandomSource): number {
  return GAME_BALANCE.training.expMin + Math.floor(rng.next() * (GAME_BALANCE.training.expMaxExclusive - GAME_BALANCE.training.expMin));
}

export function detailedTrainingExpFor(rng: RandomSource): number {
  return GAME_BALANCE.detailedTraining.expMin + Math.floor(rng.next() * (GAME_BALANCE.detailedTraining.expMaxExclusive - GAME_BALANCE.detailedTraining.expMin));
}

export function simulatePlayerGoals(attack: number, defence: number, rng: RandomSource): number {
  const pressure = clamp(0.65 + (attack - defence) / 90, 0.2, 1.5);
  let goals = 0;
  for (let attempt = 0; attempt < GAME_BALANCE.competition.attemptsPerTeam; attempt += 1) {
    const chance = clamp(GAME_BALANCE.competition.baseGoalChance * pressure + attempt * 0.015, 0.04, GAME_BALANCE.competition.maxGoalChance);
    if (rng.next() < chance) goals += 1;
  }
  return Math.min(GAME_BALANCE.match.maxGoals, goals);
}

export function opponentRatingFor(officialGrade: number | undefined, prestige: number | undefined, rng: RandomSource): number {
  return clamp(50 + (officialGrade ?? 1) * 2 + Math.round((prestige ?? 0) * 10) + Math.floor(rng.next() * 20), 45, 92);
}

export function playerMatchScoreFor(playerGoals: number, opponentGoals: number, rng: RandomSource): number {
  return Number(clamp(5.5 + (playerGoals - opponentGoals) * 0.45 + rng.next() * 1.1, 4, 9.8).toFixed(2));
}

export function playerMatchRewardFor(outcome: MatchOutcome): { money: number; exp: number } {
  return {
    money: outcome === 'WIN' ? GAME_BALANCE.match.rewardMoney.win : outcome === 'DRAW' ? GAME_BALANCE.match.rewardMoney.draw : GAME_BALANCE.match.rewardMoney.loss,
    exp: outcome === 'WIN' ? GAME_BALANCE.match.rewardExp.win : outcome === 'DRAW' ? GAME_BALANCE.match.rewardExp.draw : GAME_BALANCE.match.rewardExp.loss
  };
}

export interface PlayerFormulaObservation {
  position: PlayerProfile['position'];
  level: number;
  rating: number;
  playerGoals: number;
  opponentGoals: number;
  score: number;
  outcome: MatchOutcome;
  rewardMoney: number;
  rewardExp: number;
  formulaVersion: string;
}

export function makeFormulaObservation(profile: Pick<PlayerProfile, 'position' | 'detailedSkills' | 'stats' | 'level'>, input: Omit<PlayerFormulaObservation, 'rating' | 'formulaVersion'>): PlayerFormulaObservation {
  return {
    ...input,
    rating: calculatePlayerRating(profile),
    formulaVersion: PLAYER_FORMULA_VERSION
  };
}
