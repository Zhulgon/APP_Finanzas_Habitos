import { create } from 'zustand';
import type {
  BudgetProgress,
  ExpenseCategory,
  ExpenseRecord,
  MonthlyFinanceSummary,
} from '../../domain/entities/Finance';
import type { Habit, HabitCategory, HabitFrequency, HabitStats } from '../../domain/entities/Habit';
import type { LessonWithStatus } from '../../domain/entities/Lesson';
import type { UserProfile } from '../../domain/entities/Profile';
import { createRepositoryBundle } from '../../infrastructure/repositories/repositoryFactory';
import { createHabitUseCase } from '../../domain/use-cases/habits/createHabit';
import { completeHabitUseCase } from '../../domain/use-cases/habits/completeHabit';
import { registerExpenseUseCase } from '../../domain/use-cases/finance/registerExpense';
import { registerIncomeUseCase } from '../../domain/use-cases/finance/registerIncome';
import { setMonthlyBudgetUseCase } from '../../domain/use-cases/finance/setMonthlyBudget';
import { completeLessonUseCase } from '../../domain/use-cases/learning/completeLesson';
import {
  buildAchievements,
  buildProgressInsights,
  type AchievementBadge,
  type ProgressInsight,
} from '../services/progressInsights';

interface OnboardingInput {
  name: string;
  objective: string;
  monthlyIncome: number;
  monthlySavingsGoal: number;
  currency: string;
  initialHabits: string[];
}

interface AppState {
  isBootstrapping: boolean;
  error?: string;
  profile: UserProfile | null;
  habits: Habit[];
  habitStats: HabitStats;
  financeSummary: MonthlyFinanceSummary;
  budgetProgress: BudgetProgress[];
  insights: ProgressInsight[];
  achievements: AchievementBadge[];
  recentExpenses: ExpenseRecord[];
  lessons: LessonWithStatus[];
  bootstrap: () => Promise<void>;
  finishOnboarding: (input: OnboardingInput) => Promise<void>;
  createHabit: (name: string, frequency: HabitFrequency, category: HabitCategory) => Promise<void>;
  completeHabit: (habitId: string) => Promise<boolean>;
  addExpense: (amount: number, category: ExpenseCategory, subCategory: string, note?: string) => Promise<void>;
  addIncome: (amount: number) => Promise<void>;
  setMonthlyBudget: (category: ExpenseCategory, amount: number) => Promise<void>;
  exportBackup: () => Promise<string>;
  importBackup: (serializedBackup: string) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<boolean>;
  updateProfile: (input: {
    name: string;
    objective: string;
    monthlyIncome: number;
    monthlySavingsGoal: number;
    currency: string;
    avatarColor: string;
    avatarItem: string;
  }) => Promise<void>;
}

const repositories = createRepositoryBundle();

const emptyHabitStats: HabitStats = {
  activeHabitsCount: 0,
  todayCompleted: 0,
  weeklyCompletionRate: 0,
  streakDays: 0,
};

const emptyFinanceSummary: MonthlyFinanceSummary = {
  income: 0,
  expenses: 0,
  balance: 0,
  savingsRate: 0,
};

const emptyBudgetProgress: BudgetProgress[] = [];
const emptyInsights: ProgressInsight[] = [];
const emptyAchievements: AchievementBadge[] = [];

const refreshSnapshots = async (): Promise<{
  profile: UserProfile;
  habits: Habit[];
  habitStats: HabitStats;
  financeSummary: MonthlyFinanceSummary;
  budgetProgress: BudgetProgress[];
  insights: ProgressInsight[];
  achievements: AchievementBadge[];
  recentExpenses: ExpenseRecord[];
  lessons: LessonWithStatus[];
}> => {
  const [
    profile,
    habits,
    habitStats,
    financeSummary,
    budgetProgress,
    recentExpenses,
    lessons,
  ] =
    await Promise.all([
      repositories.profileRepository.getProfile(),
      repositories.habitRepository.listActiveHabits(),
      repositories.habitRepository.getStats(new Date()),
      repositories.financeRepository.getMonthlySummary(new Date()),
      repositories.financeRepository.getBudgetProgress(new Date()),
      repositories.financeRepository.listRecentExpenses(8),
      repositories.lessonRepository.listLessons(),
    ]);

  return {
    profile,
    habits,
    habitStats,
    financeSummary,
    budgetProgress,
    insights: buildProgressInsights({
      profile,
      habitStats,
      financeSummary,
      budgetProgress,
      lessons,
      activeHabitsCount: habits.length,
    }),
    achievements: buildAchievements({
      profile,
      habitStats,
      financeSummary,
      budgetProgress,
      lessons,
      activeHabitsCount: habits.length,
    }),
    recentExpenses,
    lessons,
  };
};

export const useAppStore = create<AppState>((set) => ({
  isBootstrapping: true,
  profile: null,
  habits: [],
  habitStats: emptyHabitStats,
  financeSummary: emptyFinanceSummary,
  budgetProgress: emptyBudgetProgress,
  insights: emptyInsights,
  achievements: emptyAchievements,
  recentExpenses: [],
  lessons: [],
  async bootstrap() {
    set({ isBootstrapping: true, error: undefined });
    try {
      await repositories.initialize();
      const snapshots = await refreshSnapshots();
      set({ ...snapshots, isBootstrapping: false });
    } catch (error) {
      set({
        isBootstrapping: false,
        error: error instanceof Error ? error.message : 'Error al inicializar la app.',
      });
    }
  },
  async finishOnboarding(input) {
    await repositories.profileRepository.updateProfile({
      name: input.name,
      objective: input.objective,
      monthlyIncome: input.monthlyIncome,
      monthlySavingsGoal: input.monthlySavingsGoal,
      currency: input.currency,
      avatarColor: '#0f766e',
      avatarItem: 'seedling',
    });

    for (const habitName of input.initialHabits) {
      if (!habitName.trim()) {
        continue;
      }
      await createHabitUseCase(repositories.habitRepository, {
        name: habitName,
        frequency: 'daily',
        category: 'health',
      });
    }

    const snapshots = await refreshSnapshots();
    set({ ...snapshots });
  },
  async createHabit(name, frequency, category) {
    await createHabitUseCase(repositories.habitRepository, {
      name,
      frequency,
      category,
    });
    const snapshots = await refreshSnapshots();
    set({ ...snapshots });
  },
  async completeHabit(habitId) {
    const wasCompleted = await completeHabitUseCase(
      {
        habitRepository: repositories.habitRepository,
        profileRepository: repositories.profileRepository,
      },
      habitId,
    );
    const snapshots = await refreshSnapshots();
    set({ ...snapshots });
    return wasCompleted;
  },
  async addExpense(amount, category, subCategory, note) {
    await registerExpenseUseCase(
      {
        financeRepository: repositories.financeRepository,
        profileRepository: repositories.profileRepository,
      },
      amount,
      category,
      subCategory,
      note,
    );
    const snapshots = await refreshSnapshots();
    set({ ...snapshots });
  },
  async addIncome(amount) {
    await registerIncomeUseCase(
      {
        financeRepository: repositories.financeRepository,
        profileRepository: repositories.profileRepository,
      },
      amount,
    );
    const snapshots = await refreshSnapshots();
    set({ ...snapshots });
  },
  async setMonthlyBudget(category, amount) {
    await setMonthlyBudgetUseCase(
      repositories.financeRepository,
      category,
      amount,
      new Date(),
    );
    const snapshots = await refreshSnapshots();
    set({ ...snapshots });
  },
  async exportBackup() {
    return repositories.backupRepository.exportBackup();
  },
  async importBackup(serializedBackup) {
    await repositories.backupRepository.importBackup(serializedBackup);
    const snapshots = await refreshSnapshots();
    set({ ...snapshots });
  },
  async completeLesson(lessonId) {
    const wasCompleted = await completeLessonUseCase(
      {
        lessonRepository: repositories.lessonRepository,
        profileRepository: repositories.profileRepository,
      },
      lessonId,
    );
    const snapshots = await refreshSnapshots();
    set({ ...snapshots });
    return wasCompleted;
  },
  async updateProfile(input) {
    await repositories.profileRepository.updateProfile({
      ...input,
    });
    const snapshots = await refreshSnapshots();
    set({ ...snapshots });
  },
}));
