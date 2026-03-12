import type { AppDomainEvent } from '../../domain/events/AppDomainEvent';
import type {
  GamificationDimension,
  UserRank,
} from '../../domain/entities/Profile';

export type XpAction =
  | 'habit_completion'
  | 'expense_logged'
  | 'income_logged'
  | 'lesson_completed';

const LEGACY_XP_RULES: Record<XpAction, number> = {
  habit_completion: 10,
  expense_logged: 5,
  income_logged: 5,
  lesson_completed: 15,
};

export const xpForAction = (action: XpAction): number => LEGACY_XP_RULES[action];

const XP_PER_LEVEL = 120;

export const levelFromXp = (xp: number): number => {
  return Math.floor(Math.max(0, xp) / XP_PER_LEVEL) + 1;
};

export const rankFromLevel = (level: number): UserRank => {
  if (level >= 10) {
    return 'maestro';
  }
  if (level >= 7) {
    return 'estratega';
  }
  if (level >= 4) {
    return 'constante';
  }
  return 'novato';
};

export interface GamificationReward {
  dimension: GamificationDimension;
  xp: number;
  coins: number;
  reason: string;
}

const DIFFICULTY_MULTIPLIER: Record<1 | 2 | 3, number> = {
  1: 0.9,
  2: 1,
  3: 1.15,
};

const eventBaseRewards: {
  [K in AppDomainEvent['type']]: Omit<GamificationReward, 'xp' | 'coins'> & {
    dimension: GamificationDimension;
    baseXp: number;
    baseCoins: number;
  };
} = {
  'habit.completed': {
    dimension: 'discipline',
    baseXp: 12,
    baseCoins: 2,
    reason: 'Completar habito',
  },
  'finance.expense_logged': {
    dimension: 'finance',
    baseXp: 6,
    baseCoins: 1,
    reason: 'Registrar gasto',
  },
  'finance.income_logged': {
    dimension: 'finance',
    baseXp: 5,
    baseCoins: 1,
    reason: 'Registrar ingreso',
  },
  'lesson.completed': {
    dimension: 'learning',
    baseXp: 16,
    baseCoins: 3,
    reason: 'Completar capsula',
  },
};

export const buildGamificationReward = (
  event: AppDomainEvent,
  missionDifficulty: 1 | 2 | 3,
): GamificationReward => {
  const base = eventBaseRewards[event.type];
  const multiplier = DIFFICULTY_MULTIPLIER[missionDifficulty];

  return {
    dimension: base.dimension,
    xp: Math.max(1, Math.round(base.baseXp * multiplier)),
    coins: Math.max(1, Math.round(base.baseCoins * multiplier)),
    reason: base.reason,
  };
};

export const missionDifficultyFromRate = (
  completionRatePercent: number,
): 1 | 2 | 3 => {
  if (completionRatePercent >= 80) {
    return 3;
  }
  if (completionRatePercent >= 45) {
    return 2;
  }
  return 1;
};
