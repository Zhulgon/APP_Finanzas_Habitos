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
  avatarColor: '#0f766e',
  avatarItem: 'seedling',
};

export const createHabitRepositoryMock = (
  overrides: Partial<HabitRepository> = {},
): HabitRepository => ({
  listActiveHabits: async (): Promise<Habit[]> => [],
  createHabit: async () => {},
  logCompletion: async () => false,
  getStats: async () => emptyHabitStats,
  listCompletionDates: async (): Promise<string[]> => [],
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
