import type { RewardHistoryEntry } from '../../domain/entities/Profile';

export interface WeeklyComparisonSlice {
  weekKey: string;
  dateFrom: string;
  dateTo: string;
  completedHabits: number;
  balance: number;
  xpEarned: number;
  coinsNet: number;
}

export interface WeeklyComparison {
  current: WeeklyComparisonSlice;
  previous: WeeklyComparisonSlice;
  delta: {
    completedHabits: number;
    balance: number;
    xpEarned: number;
    coinsNet: number;
  };
  trend: 'improving' | 'stable' | 'declining';
  headline: string;
  recommendation: string;
}

interface BuildWeeklyComparisonInput {
  current: Omit<WeeklyComparisonSlice, 'xpEarned' | 'coinsNet'>;
  previous: Omit<WeeklyComparisonSlice, 'xpEarned' | 'coinsNet'>;
  rewardHistory: RewardHistoryEntry[];
}

const summarizeRewards = (
  rewardHistory: RewardHistoryEntry[],
  dateFrom: string,
  dateTo: string,
): { xpEarned: number; coinsNet: number } => {
  let xpEarned = 0;
  let coinsNet = 0;

  for (const entry of rewardHistory) {
    const entryDate = entry.createdAt.slice(0, 10);
    if (entryDate < dateFrom || entryDate > dateTo) {
      continue;
    }
    xpEarned += Math.max(0, entry.xpDelta);
    coinsNet += entry.coinsDelta;
  }

  return {
    xpEarned,
    coinsNet,
  };
};

const trendFromDelta = (delta: WeeklyComparison['delta']): WeeklyComparison['trend'] => {
  let points = 0;

  if (delta.completedHabits > 0) {
    points += 1;
  } else if (delta.completedHabits < 0) {
    points -= 1;
  }

  if (delta.balance > 0) {
    points += 1;
  } else if (delta.balance < 0) {
    points -= 1;
  }

  if (delta.xpEarned > 0) {
    points += 1;
  } else if (delta.xpEarned < 0) {
    points -= 1;
  }

  if (points >= 2) {
    return 'improving';
  }
  if (points <= -2) {
    return 'declining';
  }
  return 'stable';
};

const trendCopy = (
  trend: WeeklyComparison['trend'],
): Pick<WeeklyComparison, 'headline' | 'recommendation'> => {
  if (trend === 'improving') {
    return {
      headline: 'Vas mejorando semana a semana',
      recommendation:
        'Mantiene el mismo ritmo: prioriza habitos clave y conserva balance positivo.',
    };
  }

  if (trend === 'declining') {
    return {
      headline: 'Semana con retroceso',
      recommendation:
        'Reduce friccion: define 1 habito minimo diario y recorta un gasto variable esta semana.',
    };
  }

  return {
    headline: 'Semana estable',
    recommendation:
      'Ya tienes base constante. Ajusta una sola palanca (habitos o gastos) para subir al siguiente nivel.',
  };
};

export const buildWeeklyComparison = (
  input: BuildWeeklyComparisonInput,
): WeeklyComparison => {
  const currentRewards = summarizeRewards(
    input.rewardHistory,
    input.current.dateFrom,
    input.current.dateTo,
  );
  const previousRewards = summarizeRewards(
    input.rewardHistory,
    input.previous.dateFrom,
    input.previous.dateTo,
  );

  const current: WeeklyComparisonSlice = {
    ...input.current,
    xpEarned: currentRewards.xpEarned,
    coinsNet: currentRewards.coinsNet,
  };
  const previous: WeeklyComparisonSlice = {
    ...input.previous,
    xpEarned: previousRewards.xpEarned,
    coinsNet: previousRewards.coinsNet,
  };

  const delta = {
    completedHabits: current.completedHabits - previous.completedHabits,
    balance: current.balance - previous.balance,
    xpEarned: current.xpEarned - previous.xpEarned,
    coinsNet: current.coinsNet - previous.coinsNet,
  };

  const trend = trendFromDelta(delta);
  const copy = trendCopy(trend);

  return {
    current,
    previous,
    delta,
    trend,
    headline: copy.headline,
    recommendation: copy.recommendation,
  };
};

export const emptyWeeklyComparison = (): WeeklyComparison => {
  return {
    current: {
      weekKey: '',
      dateFrom: '',
      dateTo: '',
      completedHabits: 0,
      balance: 0,
      xpEarned: 0,
      coinsNet: 0,
    },
    previous: {
      weekKey: '',
      dateFrom: '',
      dateTo: '',
      completedHabits: 0,
      balance: 0,
      xpEarned: 0,
      coinsNet: 0,
    },
    delta: {
      completedHabits: 0,
      balance: 0,
      xpEarned: 0,
      coinsNet: 0,
    },
    trend: 'stable',
    headline: 'Semana estable',
    recommendation:
      'Activa tu plan semanal para comparar avances reales entre semanas.',
  };
};
