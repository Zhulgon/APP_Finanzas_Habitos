import { format, subDays } from 'date-fns';
import type { ExpenseRecord, IncomeRecord } from '../../domain/entities/Finance';
import type { HabitStats } from '../../domain/entities/Habit';
import type { LessonWithStatus } from '../../domain/entities/Lesson';
import type { RewardHistoryEntry } from '../../domain/entities/Profile';
import type { Mission } from './missions';
import { toIsoDate } from '../../shared/utils/date';
import { clamp } from '../../shared/utils/formatters';

export interface WeeklySummary {
  startDate: string;
  endDate: string;
  periodLabel: string;
  activeDays: number;
  habitCompletionRate: number;
  completedLessons: number;
  incomesTotal: number;
  expensesTotal: number;
  balance: number;
  savingsRate: number;
  missionsCompleted: number;
  missionsClaimed: number;
  xpEarned: number;
  coinsEarned: number;
  coinsSpent: number;
  headline: string;
  recommendation: string;
}

interface BuildWeeklySummaryInput {
  referenceDate?: Date;
  habitStats: HabitStats;
  completionDates: string[];
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  lessons: LessonWithStatus[];
  missions: Mission[];
  rewardHistory: RewardHistoryEntry[];
}

const toPeriodLabel = (startDate: Date, endDate: Date): string => {
  return `${format(startDate, 'dd/MM')} - ${format(endDate, 'dd/MM')}`;
};

const buildRecommendation = (input: {
  activeDays: number;
  habitCompletionRate: number;
  balance: number;
  completedLessons: number;
}): Pick<WeeklySummary, 'headline' | 'recommendation'> => {
  if (input.activeDays <= 2 || input.habitCompletionRate < 45) {
    return {
      headline: 'Recuperar consistencia',
      recommendation:
        'Prioriza 1-2 habitos clave durante tres dias seguidos para estabilizar tu racha.',
    };
  }

  if (input.balance < 0) {
    return {
      headline: 'Ajuste financiero urgente',
      recommendation:
        'Esta semana recorta gastos variables y registra cada compra para volver a balance positivo.',
    };
  }

  if (input.completedLessons === 0) {
    return {
      headline: 'Foco en aprendizaje',
      recommendation:
        'Completa una capsula financiera esta semana para mejorar decisiones de gasto y ahorro.',
    };
  }

  return {
    headline: 'Semana en buen ritmo',
    recommendation:
      'Mantienes equilibrio entre habitos y finanzas. Repite este patron la proxima semana.',
  };
};

const isWithinRange = (dateIso: string, startDateIso: string, endDateIso: string): boolean => {
  return dateIso >= startDateIso && dateIso <= endDateIso;
};

export const buildWeeklySummary = (input: BuildWeeklySummaryInput): WeeklySummary => {
  const referenceDate = input.referenceDate ?? new Date();
  const startDateObj = subDays(referenceDate, 6);
  const startDate = toIsoDate(startDateObj);
  const endDate = toIsoDate(referenceDate);

  const activeDays = new Set(
    input.completionDates.filter((date) => isWithinRange(date, startDate, endDate)),
  ).size;

  const completedLessons = input.lessons.filter((lesson) => {
    if (!lesson.completed || !lesson.completedAt) {
      return false;
    }
    return isWithinRange(lesson.completedAt, startDate, endDate);
  }).length;

  const incomesTotal = input.incomes.reduce((acc, income) => acc + income.amount, 0);
  const expensesTotal = input.expenses.reduce((acc, expense) => acc + expense.amount, 0);
  const balance = incomesTotal - expensesTotal;
  const savingsRate =
    incomesTotal <= 0
      ? 0
      : clamp((balance / incomesTotal) * 100, -100, 100);

  const missionsCompleted = input.missions.filter((mission) => mission.completed).length;
  const missionsClaimed = input.missions.filter((mission) => mission.claimed).length;

  const weeklyRewards = input.rewardHistory.filter((entry) =>
    isWithinRange(entry.createdAt.slice(0, 10), startDate, endDate),
  );
  const xpEarned = weeklyRewards.reduce(
    (acc, entry) => acc + Math.max(0, entry.xpDelta),
    0,
  );
  const coinsEarned = weeklyRewards.reduce(
    (acc, entry) => acc + Math.max(0, entry.coinsDelta),
    0,
  );
  const coinsSpent = weeklyRewards.reduce(
    (acc, entry) => acc + Math.max(0, -entry.coinsDelta),
    0,
  );

  const recommendation = buildRecommendation({
    activeDays,
    habitCompletionRate: input.habitStats.weeklyCompletionRate,
    balance,
    completedLessons,
  });

  return {
    startDate,
    endDate,
    periodLabel: toPeriodLabel(startDateObj, referenceDate),
    activeDays,
    habitCompletionRate: clamp(input.habitStats.weeklyCompletionRate, 0, 100),
    completedLessons,
    incomesTotal,
    expensesTotal,
    balance,
    savingsRate,
    missionsCompleted,
    missionsClaimed,
    xpEarned,
    coinsEarned,
    coinsSpent,
    headline: recommendation.headline,
    recommendation: recommendation.recommendation,
  };
};

export const emptyWeeklySummary = (referenceDate = new Date()): WeeklySummary => {
  const startDateObj = subDays(referenceDate, 6);
  const startDate = toIsoDate(startDateObj);
  const endDate = toIsoDate(referenceDate);
  return {
    startDate,
    endDate,
    periodLabel: toPeriodLabel(startDateObj, referenceDate),
    activeDays: 0,
    habitCompletionRate: 0,
    completedLessons: 0,
    incomesTotal: 0,
    expensesTotal: 0,
    balance: 0,
    savingsRate: 0,
    missionsCompleted: 0,
    missionsClaimed: 0,
    xpEarned: 0,
    coinsEarned: 0,
    coinsSpent: 0,
    headline: 'Semana por iniciar',
    recommendation: 'Registra actividad diaria para generar tu primer resumen semanal.',
  };
};
