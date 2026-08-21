export interface GameBalance {
  training: {
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
  };
  recovery: {
    hpPerHour: number;
    energyPerHour: number;
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
  match: {
    energyCost: 20,
    hpCost: 8,
    maxGoals: 5,
    rewardMoney: { win: 220, draw: 140, loss: 90 },
    rewardExp: { win: 42, draw: 30, loss: 22 }
  },
  recovery: { hpPerHour: 2, energyPerHour: 10 },
  competition: { attemptsPerTeam: 5, baseGoalChance: 0.13, maxGoalChance: 0.32 },
  version: 'mvp-recovery-inferred-2026-08',
  source: 'RECOVERY_INFERRED'
};

export function assertBalance(balance: GameBalance): void {
  if (balance.training.energyCost < 0 || balance.match.energyCost < 0 || balance.match.hpCost < 0) throw new Error('Balance costs cannot be negative.');
  if (balance.match.maxGoals < 1 || balance.competition.attemptsPerTeam < 1) throw new Error('Balance competition limits are invalid.');
  if (balance.competition.baseGoalChance <= 0 || balance.competition.maxGoalChance >= 1) throw new Error('Balance goal chance must be between 0 and 1.');
}

assertBalance(GAME_BALANCE);
