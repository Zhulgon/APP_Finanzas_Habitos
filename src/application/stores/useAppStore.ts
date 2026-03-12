import { create } from 'zustand';
import type {
  BudgetProgress,
  ExpenseCategory,
  ExpenseRecord,
  MonthlyFinanceSummary,
} from '../../domain/entities/Finance';
import type {
  Habit,
  HabitCategory,
  HabitFrequency,
  HabitStats,
} from '../../domain/entities/Habit';
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
  buildProgressInsights,
  type AchievementBadge,
  type ProgressInsight,
} from '../services/progressInsights';
import { InMemoryDomainEventBus } from '../services/InMemoryDomainEventBus';
import { bindGamificationEngine } from '../services/GamificationEngine';
import {
  buildMissions,
  findUnclaimedCompletedMissions,
  type Mission,
} from '../services/missions';
import { buildAchievementsWithSpecifications } from '../services/achievementSpecifications';
import { missionDifficultyFromRate } from '../services/gamification';
import { toMonthKey } from '../../shared/utils/date';
import {
  buildBalanceTelemetry,
  type BalanceTelemetry,
} from '../services/telemetry';

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
  missions: Mission[];
  telemetry: BalanceTelemetry;
  recentExpenses: ExpenseRecord[];
  lessons: LessonWithStatus[];
  bootstrap: () => Promise<void>;
  finishOnboarding: (input: OnboardingInput) => Promise<void>;
  createHabit: (
    name: string,
    frequency: HabitFrequency,
    category: HabitCategory,
  ) => Promise<void>;
  completeHabit: (habitId: string) => Promise<boolean>;
  addExpense: (
    amount: number,
    category: ExpenseCategory,
    subCategory: string,
    note?: string,
  ) => Promise<void>;
  addIncome: (amount: number) => Promise<void>;
  setMonthlyBudget: (category: ExpenseCategory, amount: number) => Promise<void>;
  exportBackup: () => Promise<string>;
  importBackup: (serializedBackup: string) => Promise<void>;
  completeLesson: (lessonId: string) => Promise<boolean>;
  buyAvatarItem: (item: string, cost: number) => Promise<boolean>;
  useStreakFreeze: () => Promise<boolean>;
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
const eventBus = new InMemoryDomainEventBus();
bindGamificationEngine(eventBus, repositories.profileRepository);

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
const emptyMissions: Mission[] = [];
const emptyTelemetry: BalanceTelemetry = {
  missionCompletionRate: 0,
  weeklyHabitRate: 0,
  savingsRate: 0,
  engagementRisk: 'high',
};

interface SnapshotResult {
  profile: UserProfile;
  habits: Habit[];
  habitStats: HabitStats;
  financeSummary: MonthlyFinanceSummary;
  budgetProgress: BudgetProgress[];
  insights: ProgressInsight[];
  achievements: AchievementBadge[];
  missions: Mission[];
  telemetry: BalanceTelemetry;
  newlyUnlockedAchievementIds: string[];
  recentExpenses: ExpenseRecord[];
  lessons: LessonWithStatus[];
}

const refreshSnapshots = async (): Promise<SnapshotResult> => {
  const [
    profile,
    habits,
    habitStats,
    financeSummary,
    budgetProgress,
    recentExpenses,
    lessons,
  ] = await Promise.all([
    repositories.profileRepository.getProfile(),
    repositories.habitRepository.listActiveHabits(),
    repositories.habitRepository.getStats(new Date()),
    repositories.financeRepository.getMonthlySummary(new Date()),
    repositories.financeRepository.getBudgetProgress(new Date()),
    repositories.financeRepository.listRecentExpenses(8),
    repositories.lessonRepository.listLessons(),
  ]);

  const achievementResult = buildAchievementsWithSpecifications({
    profile,
    habitStats,
    financeSummary,
    budgetProgress,
    lessons,
    activeHabitsCount: habits.length,
  });

  const missions = buildMissions({
    profile,
    habitStats,
    financeSummary,
    lessons,
    activeHabitsCount: habits.length,
  });

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
    achievements: achievementResult.badges,
    missions,
    telemetry: buildBalanceTelemetry({
      missions,
      habitStats,
      financeSummary,
    }),
    newlyUnlockedAchievementIds: achievementResult.newlyUnlockedIds,
    recentExpenses,
    lessons,
  };
};

const applyProgressionRewards = async (snapshots: SnapshotResult): Promise<boolean> => {
  let hasChanges = false;
  const currentMonth = toMonthKey(new Date());

  if (snapshots.profile.lastFreezeGrantMonth !== currentMonth) {
    await repositories.profileRepository.applyGamification({
      streakFreezesDelta: 1,
      lastFreezeGrantMonth: currentMonth,
    });
    hasChanges = true;
  }

  const nextDifficulty = missionDifficultyFromRate(
    snapshots.habitStats.weeklyCompletionRate,
  );

  if (nextDifficulty !== snapshots.profile.missionDifficulty) {
    await repositories.profileRepository.applyGamification({
      missionDifficulty: nextDifficulty,
    });
    hasChanges = true;
  }

  for (const achievementId of snapshots.newlyUnlockedAchievementIds) {
    await repositories.profileRepository.applyGamification({
      unlockedAchievementId: achievementId,
      dimension: 'learning',
      totalXpDelta: 18,
      dimensionXpDelta: 18,
      coinsDelta: 5,
    });
    hasChanges = true;
  }

  const claimableMissions = findUnclaimedCompletedMissions(snapshots.missions);
  for (const mission of claimableMissions) {
    await repositories.profileRepository.applyGamification({
      claimedMissionId: mission.id,
      dimension: mission.rewardDimension,
      totalXpDelta: mission.rewardXp,
      dimensionXpDelta: mission.rewardXp,
      coinsDelta: mission.rewardCoins,
    });
    hasChanges = true;
  }

  return hasChanges;
};

const refreshSnapshotsWithProgression = async (): Promise<SnapshotResult> => {
  let snapshots = await refreshSnapshots();

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const changed = await applyProgressionRewards(snapshots);
    if (!changed) {
      return snapshots;
    }
    snapshots = await refreshSnapshots();
  }

  return snapshots;
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
  missions: emptyMissions,
  telemetry: emptyTelemetry,
  recentExpenses: [],
  lessons: [],
  async bootstrap() {
    set({ isBootstrapping: true, error: undefined });
    try {
      await repositories.initialize();
      const snapshots = await refreshSnapshotsWithProgression();
      set({ ...snapshots, isBootstrapping: false });
    } catch (error) {
      set({
        isBootstrapping: false,
        error:
          error instanceof Error
            ? error.message
            : 'Error al inicializar la app.',
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

    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
  },
  async createHabit(name, frequency, category) {
    await createHabitUseCase(repositories.habitRepository, {
      name,
      frequency,
      category,
    });
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
  },
  async completeHabit(habitId) {
    const wasCompleted = await completeHabitUseCase(
      {
        habitRepository: repositories.habitRepository,
        eventBus,
      },
      habitId,
    );
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    return wasCompleted;
  },
  async addExpense(amount, category, subCategory, note) {
    await registerExpenseUseCase(
      {
        financeRepository: repositories.financeRepository,
        eventBus,
      },
      amount,
      category,
      subCategory,
      note,
    );
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
  },
  async addIncome(amount) {
    await registerIncomeUseCase(
      {
        financeRepository: repositories.financeRepository,
        eventBus,
      },
      amount,
    );
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
  },
  async setMonthlyBudget(category, amount) {
    await setMonthlyBudgetUseCase(
      repositories.financeRepository,
      category,
      amount,
      new Date(),
    );
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
  },
  async exportBackup() {
    return repositories.backupRepository.exportBackup();
  },
  async importBackup(serializedBackup) {
    await repositories.backupRepository.importBackup(serializedBackup);
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
  },
  async completeLesson(lessonId) {
    const wasCompleted = await completeLessonUseCase(
      {
        lessonRepository: repositories.lessonRepository,
        eventBus,
      },
      lessonId,
    );
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    return wasCompleted;
  },
  async buyAvatarItem(item, cost) {
    const profile = await repositories.profileRepository.getProfile();
    if (profile.ownedAvatarItems.includes(item)) {
      return true;
    }
    if (profile.coins < cost) {
      return false;
    }

    await repositories.profileRepository.applyGamification({
      coinsDelta: -Math.max(0, cost),
      unlockAvatarItem: item,
    });

    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    return true;
  },
  async useStreakFreeze() {
    const profile = await repositories.profileRepository.getProfile();
    if (profile.streakFreezes <= 0) {
      return false;
    }

    await repositories.profileRepository.applyGamification({
      streakFreezesDelta: -1,
    });

    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    return true;
  },
  async updateProfile(input) {
    await repositories.profileRepository.updateProfile({
      ...input,
    });
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
  },
}));
