export interface GameBalance {
  training: {
    energyCost: number;
    expMin: number;
    expMaxExclusive: number;
  };
  detailedTraining: {
    energyCost: number;
    expMin: number;
    expMaxExclusive: number;
  };
  match: {
    energyCost: number;
    hpCost: number;
    maxGoals: number;
    rewardMoney: { win: number; draw: number; loss: number };
    rewardExp: { win: number; draw: number; loss: number };
    injuryChance: number;
  };
  recovery: {
    hpPerHour: number;
    energyPerHour: number;
  };
  weekly: {
    energyRecovery: number;
    hpRecovery: number;
    baseMatchExp: number;
    maxCareerYear: number;
    retirementAge: number;
    weeksPerSeason: number;
  };
  injury: {
    minWeeks: number;
    maxWeeks: number;
    basicTreatmentWeeks: number;
    expertTreatmentWeeks: number;
    expertTreatmentCost: number;
  };
  trainer: {
    maxWeeklyGain: number;
  };
  culture: {
    durationWeeks: number;
    charmGain: number;
    skillExpGain: number;
  };
  competition: {
    attemptsPerTeam: number;
    baseGoalChance: number;
    maxGoalChance: number;
  };
  version: string;
  source: 'RECOVERY_INFERRED' | 'OFFICIAL_CALIBRATED';
}

export const GAME_BALANCE: GameBalance = {
  training: { energyCost: 15, expMin: 18, expMaxExclusive: 31 },
  detailedTraining: { energyCost: 12, expMin: 18, expMaxExclusive: 31 },
  match: {
    energyCost: 20,
    hpCost: 8,
    maxGoals: 5,
    rewardMoney: { win: 220, draw: 140, loss: 90 },
    rewardExp: { win: 42, draw: 30, loss: 22 },
    injuryChance: 0.08
  },
  recovery: { hpPerHour: 2, energyPerHour: 10 },
  weekly: {
    energyRecovery: 35,
    hpRecovery: 18,
    baseMatchExp: 30,
    maxCareerYear: 20,
    retirementAge: 34,
    weeksPerSeason: 10
  },
  injury: {
    minWeeks: 1,
    maxWeeks: 6,
    basicTreatmentWeeks: 1,
    expertTreatmentWeeks: 3,
    expertTreatmentCost: 450
  },
  trainer: { maxWeeklyGain: 6 },
  culture: { durationWeeks: 2, charmGain: 2, skillExpGain: 18 },
  competition: { attemptsPerTeam: 5, baseGoalChance: 0.13, maxGoalChance: 0.32 },
  version: 'gameplay-expansion-recovery-inferred-2026-08',
  source: 'RECOVERY_INFERRED'
};

export function assertBalance(balance: GameBalance): void {
  if (balance.training.energyCost < 0 || balance.detailedTraining.energyCost < 0 || balance.match.energyCost < 0 || balance.match.hpCost < 0) throw new Error('Balance costs cannot be negative.');
  if (balance.match.maxGoals < 1 || balance.competition.attemptsPerTeam < 1) throw new Error('Balance competition limits are invalid.');
  if (balance.competition.baseGoalChance <= 0 || balance.competition.maxGoalChance >= 1) throw new Error('Balance goal chance must be between 0 and 1.');
  if (balance.injury.minWeeks < 1 || balance.injury.maxWeeks < balance.injury.minWeeks) throw new Error('Injury week range is invalid.');
  if (balance.weekly.weeksPerSeason < 1 || balance.weekly.maxCareerYear < 1) throw new Error('Weekly progression limits are invalid.');
  if (balance.culture.durationWeeks < 1 || balance.trainer.maxWeeklyGain < 1) throw new Error('Training progression limits are invalid.');
}

assertBalance(GAME_BALANCE);
