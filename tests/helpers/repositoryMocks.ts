import type {
  BudgetProgress,
  ExpenseRecord,
  IncomeRecord,
  MonthlyFinanceSummary,
} from '../../src/domain/entities/Finance';
import type { Habit, HabitStats } from '../../src/domain/entities/Habit';
import type { LessonWithStatus } from '../../src/domain/entities/Lesson';
import type { UserProfile } from '../../src/domain/entities/Profile';
import type { FinanceRepository } from '../../src/domain/repositories/FinanceRepository';
import type { HabitRepository } from '../../src/domain/repositories/HabitRepository';
import type { LessonRepository } from '../../src/domain/repositories/LessonRepository';
import type { ProfileRepository } from '../../src/domain/repositories/ProfileRepository';
import type { WeeklyPlanRepository } from '../../src/domain/repositories/WeeklyPlanRepository';
import type { WeeklyPlan } from '../../src/domain/entities/WeeklyPlan';
import { toIsoDate, toWeekKey } from '../../src/shared/utils/date';

const emptySummary: MonthlyFinanceSummary = {
  income: 0,
  expenses: 0,
  balance: 0,
  savingsRate: 0,
};

const emptyHabitStats: HabitStats = {
  activeHabitsCount: 0,
  todayCompleted: 0,
  weeklyCompletionRate: 0,
  streakDays: 0,
};

const emptyProfile: UserProfile = {
  name: '',
  objective: '',
  monthlyIncome: 0,
  monthlySavingsGoal: 0,
  currency: 'COP',
  xp: 0,
  level: 1,
  rank: 'novato',
  xpByDimension: {
    discipline: 0,
    finance: 0,
    learning: 0,
  },
  coins: 0,
  streakFreezes: 1,
  lastFreezeGrantMonth: '',
  missionDifficulty: 1,
  claimedMissionIds: [],
  unlockedAchievementIds: [],
  ownedAvatarItems: ['seedling'],
  rewardHistory: [],
  avatarColor: '#0f766e',
  avatarItem: 'seedling',
};

export const createHabitRepositoryMock = (
  overrides: Partial<HabitRepository> = {},
): HabitRepository => ({
  listActiveHabits: async (): Promise<Habit[]> => [],
  createHabit: async () => {},
  updateHabit: async () => false,
  archiveHabit: async () => false,
  logCompletion: async () => false,
  getStats: async () => emptyHabitStats,
  listCompletionDates: async (): Promise<string[]> => [],
  countCompletionsByDateRange: async () => 0,
  ...overrides,
});

export const createFinanceRepositoryMock = (
  overrides: Partial<FinanceRepository> = {},
): FinanceRepository => ({
  addIncome: async () => {},
  addExpense: async () => {},
  setMonthlyBudget: async () => {},
  getBudgetProgress: async (): Promise<BudgetProgress[]> => [],
  listRecentExpenses: async (): Promise<ExpenseRecord[]> => [],
  listRecentIncomes: async (): Promise<IncomeRecord[]> => [],
  listExpensesByDateRange: async (): Promise<ExpenseRecord[]> => [],
  listIncomesByDateRange: async (): Promise<IncomeRecord[]> => [],
  getMonthlySummary: async () => emptySummary,
  ...overrides,
});

export const createLessonRepositoryMock = (
  overrides: Partial<LessonRepository> = {},
): LessonRepository => ({
  listLessons: async (): Promise<LessonWithStatus[]> => [],
  markLessonCompleted: async () => false,
  ...overrides,
});

export const createProfileRepositoryMock = (
  overrides: Partial<ProfileRepository> = {},
): ProfileRepository => ({
  getProfile: async () => emptyProfile,
  updateProfile: async () => {},
  addXp: async () => emptyProfile,
  applyGamification: async () => emptyProfile,
  ...overrides,
});

const emptyWeeklyPlan = (referenceDate = new Date()): WeeklyPlan => {
  const todayIso = toIsoDate(referenceDate);
  return {
    weekKey: toWeekKey(referenceDate),
    habitTarget: 0,
    savingsTarget: 0,
    createdAt: todayIso,
    updatedAt: todayIso,
  };
};

export const createWeeklyPlanRepositoryMock = (
  overrides: Partial<WeeklyPlanRepository> = {},
): WeeklyPlanRepository => ({
  getWeeklyPlan: async (referenceDate) => emptyWeeklyPlan(referenceDate),
  setWeeklyHabitTarget: async (referenceDate, target) => ({
    ...emptyWeeklyPlan(referenceDate),
    habitTarget: target,
  }),
  setWeeklySavingsTarget: async (referenceDate, target) => ({
    ...emptyWeeklyPlan(referenceDate),
    savingsTarget: target,
  }),
  ...overrides,
});
