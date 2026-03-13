import { create } from 'zustand';
import type {
  BudgetProgress,
  ExpenseCategory,
  ExpenseRecord,
  IncomeRecord,
  MonthlyFinanceSummary,
} from '../../domain/entities/Finance';
import type {
  Habit,
  HabitCategory,
  HabitFrequency,
  HabitStats,
} from '../../domain/entities/Habit';
import type { AuthSession } from '../../domain/entities/Auth';
import type { LessonWithStatus } from '../../domain/entities/Lesson';
import type { UserProfile } from '../../domain/entities/Profile';
import type { SyncSummary } from '../../domain/entities/Sync';
import type { WeeklyPlanProgress } from '../../domain/entities/WeeklyPlan';
import { createRepositoryBundle } from '../../infrastructure/repositories/repositoryFactory';
import { createHabitUseCase } from '../../domain/use-cases/habits/createHabit';
import { archiveHabitUseCase } from '../../domain/use-cases/habits/archiveHabit';
import { updateHabitUseCase } from '../../domain/use-cases/habits/updateHabit';
import { completeHabitUseCase } from '../../domain/use-cases/habits/completeHabit';
import { registerExpenseUseCase } from '../../domain/use-cases/finance/registerExpense';
import { registerIncomeUseCase } from '../../domain/use-cases/finance/registerIncome';
import { setMonthlyBudgetUseCase } from '../../domain/use-cases/finance/setMonthlyBudget';
import { completeLessonUseCase } from '../../domain/use-cases/learning/completeLesson';
import { requestEmailCodeUseCase } from '../../domain/use-cases/auth/requestEmailCode';
import { verifyEmailCodeUseCase } from '../../domain/use-cases/auth/verifyEmailCode';
import { signInAsGuestUseCase } from '../../domain/use-cases/auth/signInAsGuest';
import { signOutUseCase } from '../../domain/use-cases/auth/signOut';
import { enqueueSyncItemUseCase } from '../../domain/use-cases/sync/enqueueSyncItem';
import { flushSyncQueueUseCase } from '../../domain/use-cases/sync/flushSyncQueue';
import { getWeeklyPlanProgressUseCase } from '../../domain/use-cases/weekly-plan/getWeeklyPlanProgress';
import { setWeeklyHabitTargetUseCase } from '../../domain/use-cases/weekly-plan/setWeeklyHabitTarget';
import { setWeeklySavingsTargetUseCase } from '../../domain/use-cases/weekly-plan/setWeeklySavingsTarget';
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
import {
  toIsoDate,
  toMonthKey,
  toWeekDateRange,
  toWeekKey,
} from '../../shared/utils/date';
import {
  buildBalanceTelemetry,
  type BalanceTelemetry,
} from '../services/telemetry';
import { subDays } from 'date-fns';
import {
  buildWeeklySummary,
  emptyWeeklySummary,
  type WeeklySummary,
} from '../services/weeklySummary';
import {
  buildRecommendationsV2,
  type RecommendationV2,
} from '../services/recommendationEngineV2';
import {
  buildLearningPath,
  type LearningPathSnapshot,
} from '../services/learningPath';
import { trackAppEvent } from '../services/observability';
import {
  buildWeeklyComparison,
  emptyWeeklyComparison,
  type WeeklyComparison,
} from '../services/weeklyComparison';

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
  isAuthLoading: boolean;
  error?: string;
  authSession: AuthSession | null;
  authPendingEmail: string;
  syncSummary: SyncSummary;
  profile: UserProfile | null;
  habits: Habit[];
  habitStats: HabitStats;
  financeSummary: MonthlyFinanceSummary;
  budgetProgress: BudgetProgress[];
  insights: ProgressInsight[];
  achievements: AchievementBadge[];
  missions: Mission[];
  telemetry: BalanceTelemetry;
  weeklyPlanProgress: WeeklyPlanProgress;
  weeklyComparison: WeeklyComparison;
  recommendationsV2: RecommendationV2[];
  learningPath: LearningPathSnapshot;
  weeklySummary: WeeklySummary;
  recentExpenses: ExpenseRecord[];
  recentIncomes: IncomeRecord[];
  lessons: LessonWithStatus[];
  bootstrap: () => Promise<void>;
  requestAuthCode: (
    email: string,
  ) => Promise<{ ok: boolean; message: string; devCode?: string }>;
  verifyAuthCode: (email: string, code: string) => Promise<{ ok: boolean; message: string }>;
  signInAsGuest: () => Promise<void>;
  signOut: () => Promise<void>;
  flushCloudSync: () => Promise<{ ok: boolean; message: string }>;
  finishOnboarding: (input: OnboardingInput) => Promise<void>;
  createHabit: (
    name: string,
    frequency: HabitFrequency,
    category: HabitCategory,
  ) => Promise<void>;
  updateHabit: (
    habitId: string,
    name: string,
    frequency: HabitFrequency,
    category: HabitCategory,
  ) => Promise<boolean>;
  archiveHabit: (habitId: string) => Promise<boolean>;
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
  updateAvatar: (avatarColor: string, avatarItem: string) => Promise<void>;
  useStreakFreeze: () => Promise<{ ok: boolean; message: string }>;
  setWeeklyHabitTarget: (target: number) => Promise<void>;
  setWeeklySavingsTarget: (target: number) => Promise<void>;
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
const emptyWeeklyPlanProgress: WeeklyPlanProgress = {
  weekKey: '',
  dateFrom: '',
  dateTo: '',
  habitTarget: 0,
  completedHabits: 0,
  habitProgressRate: 0,
  savingsTarget: 0,
  currentSavings: 0,
  savingsProgressRate: 0,
  status: 'unplanned',
};
const emptyWeeklyComparisonState: WeeklyComparison = emptyWeeklyComparison();
const emptyRecommendations: RecommendationV2[] = [];
const emptyLearningPath: LearningPathSnapshot = {
  lessons: [],
  totalLessons: 0,
  completedLessons: 0,
  pendingLessons: 0,
  availableToday: 0,
  completedToday: 0,
};
const emptySyncSummary: SyncSummary = {
  pending: 0,
  synced: 0,
  failed: 0,
  lastStatus: 'idle',
};
const emptyWeekly = emptyWeeklySummary();

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
  weeklyPlanProgress: WeeklyPlanProgress;
  weeklyComparison: WeeklyComparison;
  recommendationsV2: RecommendationV2[];
  learningPath: LearningPathSnapshot;
  weeklySummary: WeeklySummary;
  newlyUnlockedAchievementIds: string[];
  recentExpenses: ExpenseRecord[];
  recentIncomes: IncomeRecord[];
  lessons: LessonWithStatus[];
}

const refreshSnapshots = async (): Promise<SnapshotResult> => {
  const referenceDate = new Date();
  const rollingWeekStart = toIsoDate(subDays(referenceDate, 6));
  const rollingWeekEnd = toIsoDate(referenceDate);
  const currentWeekRange = toWeekDateRange(referenceDate);
  const previousReferenceDate = subDays(referenceDate, 7);
  const previousWeekRange = toWeekDateRange(previousReferenceDate);

  const [
    profile,
    habits,
    habitStats,
    financeSummary,
    budgetProgress,
    recentExpenses,
    recentIncomes,
    lessonCatalog,
    completionDates,
    weekIncomes,
    weekExpenses,
    weeklyPlanProgress,
    previousWeekCompletions,
    previousWeekIncomes,
    previousWeekExpenses,
  ] = await Promise.all([
    repositories.profileRepository.getProfile(),
    repositories.habitRepository.listActiveHabits(),
    repositories.habitRepository.getStats(referenceDate),
    repositories.financeRepository.getMonthlySummary(referenceDate),
    repositories.financeRepository.getBudgetProgress(referenceDate),
    repositories.financeRepository.listRecentExpenses(8),
    repositories.financeRepository.listRecentIncomes(5),
    repositories.lessonRepository.listLessons(),
    repositories.habitRepository.listCompletionDates(referenceDate, 7),
    repositories.financeRepository.listIncomesByDateRange(
      rollingWeekStart,
      rollingWeekEnd,
    ),
    repositories.financeRepository.listExpensesByDateRange(
      rollingWeekStart,
      rollingWeekEnd,
    ),
    getWeeklyPlanProgressUseCase(
      {
        weeklyPlanRepository: repositories.weeklyPlanRepository,
        habitRepository: repositories.habitRepository,
        financeRepository: repositories.financeRepository,
      },
      referenceDate,
    ),
    repositories.habitRepository.countCompletionsByDateRange(
      previousWeekRange.dateFrom,
      previousWeekRange.dateTo,
    ),
    repositories.financeRepository.listIncomesByDateRange(
      previousWeekRange.dateFrom,
      previousWeekRange.dateTo,
    ),
    repositories.financeRepository.listExpensesByDateRange(
      previousWeekRange.dateFrom,
      previousWeekRange.dateTo,
    ),
  ]);

  const achievementResult = buildAchievementsWithSpecifications({
    profile,
    habitStats,
    financeSummary,
    budgetProgress,
    lessons: lessonCatalog,
    activeHabitsCount: habits.length,
  });

  const missions = buildMissions({
    profile,
    habitStats,
    financeSummary,
    lessons: lessonCatalog,
    activeHabitsCount: habits.length,
  });
  const learningPath = buildLearningPath({
    lessons: lessonCatalog,
    referenceDate,
  });

  const previousBalance =
    previousWeekIncomes.reduce((acc, row) => acc + row.amount, 0) -
    previousWeekExpenses.reduce((acc, row) => acc + row.amount, 0);
  const weeklyComparison = buildWeeklyComparison({
    current: {
      weekKey: weeklyPlanProgress.weekKey || toWeekKey(referenceDate),
      dateFrom: currentWeekRange.dateFrom,
      dateTo: currentWeekRange.dateTo,
      completedHabits: weeklyPlanProgress.completedHabits,
      balance: weeklyPlanProgress.currentSavings,
    },
    previous: {
      weekKey: toWeekKey(previousReferenceDate),
      dateFrom: previousWeekRange.dateFrom,
      dateTo: previousWeekRange.dateTo,
      completedHabits: previousWeekCompletions,
      balance: previousBalance,
    },
    rewardHistory: profile.rewardHistory,
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
      lessons: learningPath.lessons,
      activeHabitsCount: habits.length,
    }),
    achievements: achievementResult.badges,
    missions,
    telemetry: buildBalanceTelemetry({
      missions,
      habitStats,
      financeSummary,
    }),
    weeklyPlanProgress,
    weeklyComparison,
    recommendationsV2: buildRecommendationsV2({
      habitStats,
      financeSummary,
      weeklyPlanProgress,
      weeklyComparison,
      recentFinanceMovementToday:
        recentExpenses.some((item) => item.recordedAt === toIsoDate(referenceDate)) ||
        recentIncomes.some((item) => item.recordedAt === toIsoDate(referenceDate)),
      lessons: learningPath.lessons,
      referenceDate,
    }),
    learningPath,
    weeklySummary: buildWeeklySummary({
      referenceDate,
      habitStats,
      completionDates,
      incomes: weekIncomes,
      expenses: weekExpenses,
      lessons: learningPath.lessons,
      missions,
      rewardHistory: profile.rewardHistory,
    }),
    newlyUnlockedAchievementIds: achievementResult.newlyUnlockedIds,
    recentExpenses,
    recentIncomes,
    lessons: learningPath.lessons,
  };
};

const applyProgressionRewards = async (snapshots: SnapshotResult): Promise<boolean> => {
  let hasChanges = false;
  const currentMonth = toMonthKey(new Date());

  if (snapshots.profile.lastFreezeGrantMonth !== currentMonth) {
    await repositories.profileRepository.applyGamification({
      streakFreezesDelta: 1,
      lastFreezeGrantMonth: currentMonth,
      auditSource: 'system',
      auditReason: 'Comodin mensual otorgado',
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
      totalXpDelta: 12,
      dimensionXpDelta: 12,
      coinsDelta: 3,
      auditSource: 'achievement',
      auditReason: `Logro desbloqueado: ${achievementId}`,
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
      auditSource: 'mission',
      auditReason: `Mision completada: ${mission.title}`,
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

export const useAppStore = create<AppState>((set, get) => {
  const refreshSyncSummary = async (): Promise<SyncSummary> => {
    const syncSummary = await repositories.syncRepository.getSummary();
    set({ syncSummary });
    return syncSummary;
  };

  const enqueueSync = async (
    entity: string,
    action: string,
    payload: Record<string, unknown>,
  ): Promise<void> => {
    try {
      await enqueueSyncItemUseCase(repositories.syncRepository, {
        entity,
        action,
        payload,
      });
      await refreshSyncSummary();
    } catch (error) {
      trackAppEvent('sync.enqueue.error', 'warn', {
        entity,
        action,
        message: error instanceof Error ? error.message : 'Error en cola de sync.',
      });
    }
  };

  return {
  isBootstrapping: true,
  isAuthLoading: false,
  authSession: null,
  authPendingEmail: '',
  syncSummary: emptySyncSummary,
  profile: null,
  habits: [],
  habitStats: emptyHabitStats,
  financeSummary: emptyFinanceSummary,
  budgetProgress: emptyBudgetProgress,
  insights: emptyInsights,
  achievements: emptyAchievements,
  missions: emptyMissions,
  telemetry: emptyTelemetry,
  weeklyPlanProgress: emptyWeeklyPlanProgress,
  weeklyComparison: emptyWeeklyComparisonState,
  recommendationsV2: emptyRecommendations,
  learningPath: emptyLearningPath,
  weeklySummary: emptyWeekly,
  recentExpenses: [],
  recentIncomes: [],
  lessons: [],
  async requestAuthCode(email) {
    set({ isAuthLoading: true });
    try {
      const result = await requestEmailCodeUseCase(
        repositories.authRepository,
        email,
      );
      if (result.ok) {
        set({ authPendingEmail: email.trim().toLowerCase() });
        trackAppEvent('auth.code_requested', 'info', {
          email: email.trim().toLowerCase(),
        });
      }
      return result;
    } finally {
      set({ isAuthLoading: false });
    }
  },
  async verifyAuthCode(email, code) {
    set({ isAuthLoading: true });
    try {
      const result = await verifyEmailCodeUseCase(
        repositories.authRepository,
        email,
        code,
      );
      if (result.ok) {
        set({
          authSession: result.session ?? null,
          authPendingEmail: '',
        });
        await refreshSyncSummary();
        trackAppEvent('auth.signed_in', 'info', {
          provider: result.session?.provider ?? 'email_magic_code',
        });
      }

      return {
        ok: result.ok,
        message: result.message,
      };
    } finally {
      set({ isAuthLoading: false });
    }
  },
  async signInAsGuest() {
    set({ isAuthLoading: true });
    try {
      const session = await signInAsGuestUseCase(repositories.authRepository);
      set({
        authSession: session,
        authPendingEmail: '',
      });
      await refreshSyncSummary();
      trackAppEvent('auth.signed_in_guest', 'info');
    } finally {
      set({ isAuthLoading: false });
    }
  },
  async signOut() {
    await signOutUseCase(repositories.authRepository);
    set({
      authSession: null,
      authPendingEmail: '',
    });
    trackAppEvent('auth.signed_out', 'info');
  },
  async flushCloudSync() {
    const result = await flushSyncQueueUseCase(
      repositories.syncRepository,
      get().authSession,
    );
    await refreshSyncSummary();
    trackAppEvent(
      'sync.flush',
      result.ok ? 'info' : 'warn',
      {
        processed: result.processed,
        remaining: result.remaining,
      },
    );
    return {
      ok: result.ok,
      message: result.message,
    };
  },
  async bootstrap() {
    set({ isBootstrapping: true, error: undefined });
    try {
      await repositories.initialize();
      const [snapshots, authSession, syncSummary] = await Promise.all([
        refreshSnapshotsWithProgression(),
        repositories.authRepository.getSession(),
        repositories.syncRepository.getSummary(),
      ]);
      set({
        ...snapshots,
        authSession,
        syncSummary,
        isBootstrapping: false,
      });
      trackAppEvent('app.bootstrap.success', 'info');
    } catch (error) {
      trackAppEvent('app.bootstrap.error', 'error', {
        message:
          error instanceof Error ? error.message : 'Error al inicializar la app.',
      });
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
    await enqueueSync('profile', 'onboarding_completed', {
      initialHabits: input.initialHabits.length,
      currency: input.currency,
    });
    trackAppEvent('onboarding.completed', 'info', {
      initialHabits: input.initialHabits.length,
    });
  },
  async createHabit(name, frequency, category) {
    await createHabitUseCase(repositories.habitRepository, {
      name,
      frequency,
      category,
    });
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    await enqueueSync('habit', 'created', {
      name,
      frequency,
      category,
    });
    trackAppEvent('habit.created', 'info', {
      category,
      frequency,
    });
  },
  async updateHabit(habitId, name, frequency, category) {
    const wasUpdated = await updateHabitUseCase(repositories.habitRepository, {
      habitId,
      name,
      frequency,
      category,
    });
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    await enqueueSync('habit', 'updated', {
      habitId,
      frequency,
      category,
    });
    return wasUpdated;
  },
  async archiveHabit(habitId) {
    const wasArchived = await archiveHabitUseCase(
      repositories.habitRepository,
      habitId,
    );
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    await enqueueSync('habit', 'archived', {
      habitId,
      archived: wasArchived,
    });
    trackAppEvent('habit.archived', 'info', {
      habitId,
      archived: wasArchived,
    });
    return wasArchived;
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
    await enqueueSync('habit', 'completed', {
      habitId,
      completed: wasCompleted,
    });
    trackAppEvent('habit.completed', wasCompleted ? 'info' : 'warn', {
      habitId,
      completed: wasCompleted,
    });
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
    await enqueueSync('finance', 'expense_added', {
      amount,
      category,
      subCategory,
      hasNote: Boolean(note),
    });
    trackAppEvent('finance.expense_added', 'info', {
      amount,
      category,
      subCategory,
      hasNote: Boolean(note),
    });
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
    await enqueueSync('finance', 'income_added', {
      amount,
    });
    trackAppEvent('finance.income_added', 'info', {
      amount,
    });
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
    await enqueueSync('finance', 'budget_set', {
      category,
      amount,
    });
  },
  async exportBackup() {
    trackAppEvent('backup.export.requested', 'info');
    return repositories.backupRepository.exportBackup();
  },
  async importBackup(serializedBackup) {
    await repositories.backupRepository.importBackup(serializedBackup);
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    await enqueueSync('backup', 'imported', {
      bytes: serializedBackup.length,
    });
    trackAppEvent('backup.import.completed', 'info', {
      bytes: serializedBackup.length,
    });
  },
  async completeLesson(lessonId) {
    const lesson = get().lessons.find((item) => item.id === lessonId);
    if (!lesson || lesson.completed || !lesson.availableToday) {
      trackAppEvent('lesson.complete_blocked', 'warn', {
        lessonId,
      });
      return false;
    }

    const wasCompleted = await completeLessonUseCase(
      {
        lessonRepository: repositories.lessonRepository,
        eventBus,
      },
      lessonId,
    );
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    await enqueueSync('lesson', 'completed', {
      lessonId,
      completed: wasCompleted,
    });
    trackAppEvent('lesson.completed', wasCompleted ? 'info' : 'warn', {
      lessonId,
      completed: wasCompleted,
    });
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
      auditSource: 'shop',
      auditReason: `Compra item avatar: ${item}`,
    });

    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    await enqueueSync('avatar', 'item_purchased', {
      item,
      cost,
    });
    return true;
  },
  async updateAvatar(avatarColor, avatarItem) {
    const current = await repositories.profileRepository.getProfile();
    await repositories.profileRepository.updateProfile({
      name: current.name,
      objective: current.objective,
      monthlyIncome: current.monthlyIncome,
      monthlySavingsGoal: current.monthlySavingsGoal,
      currency: current.currency,
      avatarColor,
      avatarItem,
    });

    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    await enqueueSync('avatar', 'updated', {
      avatarColor,
      avatarItem,
    });
  },
  async useStreakFreeze() {
    const profile = await repositories.profileRepository.getProfile();
    if (profile.streakFreezes <= 0) {
      return {
        ok: false,
        message: 'No tienes comodines disponibles.',
      };
    }

    const activeHabits = await repositories.habitRepository.listActiveHabits();
    if (activeHabits.length === 0) {
      return {
        ok: false,
        message: 'Necesitas al menos un habito activo para usar comodin.',
      };
    }

    const referenceDate = new Date();
    const completionDates = await repositories.habitRepository.listCompletionDates(
      referenceDate,
      14,
    );
    const completionSet = new Set(completionDates);

    let missedDate: string | null = null;
    for (let dayOffset = 1; dayOffset <= 7; dayOffset += 1) {
      const dayIso = toIsoDate(subDays(referenceDate, dayOffset));
      if (!completionSet.has(dayIso)) {
        missedDate = dayIso;
        break;
      }
    }

    if (!missedDate) {
      return {
        ok: false,
        message: 'No hay un dia perdido reciente para proteger.',
      };
    }

    const applied = await repositories.habitRepository.logCompletion(
      activeHabits[0].id,
      missedDate,
    );

    if (!applied) {
      return {
        ok: false,
        message: 'Ese dia ya estaba protegido.',
      };
    }

    await repositories.profileRepository.applyGamification({
      streakFreezesDelta: -1,
      auditSource: 'freeze',
      auditReason: `Comodin usado para proteger ${missedDate}`,
    });

    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    await enqueueSync('habit', 'streak_freeze_used', {
      missedDate,
    });
    return {
      ok: true,
      message: `Racha protegida para ${missedDate}.`,
    };
  },
  async setWeeklyHabitTarget(target) {
    await setWeeklyHabitTargetUseCase(
      repositories.weeklyPlanRepository,
      target,
      new Date(),
    );
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    await enqueueSync('weekly_plan', 'habit_target_set', {
      target,
    });
    trackAppEvent('weekly_plan.habit_target_set', 'info', {
      target,
    });
  },
  async setWeeklySavingsTarget(target) {
    await setWeeklySavingsTargetUseCase(
      repositories.weeklyPlanRepository,
      target,
      new Date(),
    );
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    await enqueueSync('weekly_plan', 'savings_target_set', {
      target,
    });
    trackAppEvent('weekly_plan.savings_target_set', 'info', {
      target,
    });
  },
  async updateProfile(input) {
    await repositories.profileRepository.updateProfile({
      ...input,
    });
    const snapshots = await refreshSnapshotsWithProgression();
    set({ ...snapshots });
    await enqueueSync('profile', 'updated', {
      currency: input.currency,
      hasObjective: Boolean(input.objective),
    });
  },
  };
});
