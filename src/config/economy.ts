export interface MilestoneDefinition {
  threshold: number;
  cumulativeCoins: number;
  incrementalCoins: number;
  isSpecialTick?: boolean;
}

export const MILESTONES: MilestoneDefinition[] = [
  { threshold: 1000, cumulativeCoins: 1, incrementalCoins: 1 },
  { threshold: 2000, cumulativeCoins: 2, incrementalCoins: 1, isSpecialTick: true }, // ~2,100 in design
  { threshold: 3000, cumulativeCoins: 3, incrementalCoins: 1 },
  { threshold: 4000, cumulativeCoins: 4, incrementalCoins: 1 },
  { threshold: 5000, cumulativeCoins: 5, incrementalCoins: 1, isSpecialTick: true }, // ~5,200 in design
  { threshold: 6000, cumulativeCoins: 6, incrementalCoins: 1 },
  { threshold: 7000, cumulativeCoins: 7, incrementalCoins: 1 },
  { threshold: 8000, cumulativeCoins: 8, incrementalCoins: 1, isSpecialTick: true }, // ~8,300 in design
  { threshold: 9000, cumulativeCoins: 10, incrementalCoins: 2 },
  { threshold: 10000, cumulativeCoins: 11, incrementalCoins: 1 },
  { threshold: 11000, cumulativeCoins: 13, incrementalCoins: 2 },
  { threshold: 12000, cumulativeCoins: 14, incrementalCoins: 1, isSpecialTick: true }, // ~12,400 in design
  { threshold: 13000, cumulativeCoins: 16, incrementalCoins: 2 },
  { threshold: 14000, cumulativeCoins: 17, incrementalCoins: 1 },
  { threshold: 15000, cumulativeCoins: 19, incrementalCoins: 2 },
  { threshold: 16000, cumulativeCoins: 20, incrementalCoins: 1 },
  { threshold: 17000, cumulativeCoins: 21, incrementalCoins: 1, isSpecialTick: true }, // 17,000 in design
  { threshold: 18000, cumulativeCoins: 22, incrementalCoins: 1 },
  { threshold: 19000, cumulativeCoins: 23, incrementalCoins: 1 },
  { threshold: 20000, cumulativeCoins: 25, incrementalCoins: 2, isSpecialTick: true },
];

export const MAX_DAILY_STEPS = 20000;
export const MAX_DAILY_COINS = 25;

export function getEligibleUnclaimedMilestones(currentSteps: number, claimedMilestones: number[]): MilestoneDefinition[] {
  return MILESTONES.filter(
    (m) => currentSteps >= m.threshold && !claimedMilestones.includes(m.threshold)
  );
}

export function calculateEstimatedCalories(steps: number): number {
  // Average ~0.04 - 0.05 kcal per step
  return Math.round(steps * 0.045);
}

export function calculateEstimatedDistanceKm(steps: number): number {
  // Average stride length ~0.76m -> ~1315 steps per km
  return +(steps * 0.00076).toFixed(2);
}
