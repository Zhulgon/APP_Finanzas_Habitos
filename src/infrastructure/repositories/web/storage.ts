import type {
  ExpenseCategory,
  ExpenseRecord,
  IncomeRecord,
} from '../../../domain/entities/Finance';
import type { Habit } from '../../../domain/entities/Habit';
import type { AuthChallenge, AuthSession } from '../../../domain/entities/Auth';
import type { UserProfile } from '../../../domain/entities/Profile';
import type { SyncQueueItem } from '../../../domain/entities/Sync';
import type { WeeklyPlan } from '../../../domain/entities/WeeklyPlan';

interface HabitLog {
  habitId: string;
  completedAt: string;
}

interface LessonProgress {
  lessonId: string;
  completedAt: string;
}

interface Counters {
  incomeId: number;
  expenseId: number;
}

interface BudgetRecord {
  monthKey: string;
  category: ExpenseCategory;
  amount: number;
}

export interface WebAuthState {
  session: AuthSession | null;
  pendingEmail: string;
  challenge?: AuthChallenge;
}

export interface WebSyncState {
  queue: SyncQueueItem[];
  lastSyncedAt: string;
  lastStatus: 'idle' | 'running' | 'success' | 'error';
  cloudEnabled: boolean;
}

export interface WebState {
  habits: Habit[];
  habitLogs: HabitLog[];
  weeklyPlans: WeeklyPlan[];
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  budgets: BudgetRecord[];
  lessonProgress: LessonProgress[];
  profile: UserProfile;
  auth: WebAuthState;
  sync: WebSyncState;
  counters: Counters;
}

const STORAGE_KEY = 'app_habitos_finanzas_web_store_v1';

const defaultProfile: UserProfile = {
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

export const defaultWebState = (): WebState => ({
  habits: [],
  habitLogs: [],
  weeklyPlans: [],
  incomes: [],
  expenses: [],
  budgets: [],
  lessonProgress: [],
  profile: defaultProfile,
  auth: {
    session: null,
    pendingEmail: '',
  },
  sync: {
    queue: [],
    lastSyncedAt: '',
    lastStatus: 'idle',
    cloudEnabled: true,
  },
  counters: {
    incomeId: 1,
    expenseId: 1,
  },
});

let inMemoryFallback = defaultWebState();

export const normalizeWebState = (
  parsed: Partial<WebState> | null | undefined,
): WebState => {
  if (!parsed) {
    return defaultWebState();
  }

  return {
    ...defaultWebState(),
    ...parsed,
    profile: {
      ...defaultProfile,
      ...(parsed.profile ?? {}),
      xpByDimension: {
        ...defaultProfile.xpByDimension,
        ...(parsed.profile?.xpByDimension ?? {}),
      },
      claimedMissionIds: parsed.profile?.claimedMissionIds ?? [],
      unlockedAchievementIds: parsed.profile?.unlockedAchievementIds ?? [],
      ownedAvatarItems: parsed.profile?.ownedAvatarItems ?? ['seedling'],
      rewardHistory: parsed.profile?.rewardHistory ?? [],
    },
    counters: {
      ...defaultWebState().counters,
      ...(parsed.counters ?? {}),
    },
    auth: {
      ...defaultWebState().auth,
      ...(parsed.auth ?? {}),
    },
    sync: {
      ...defaultWebState().sync,
      ...(parsed.sync ?? {}),
      queue: parsed.sync?.queue ?? [],
    },
    weeklyPlans: parsed.weeklyPlans ?? [],
    budgets: parsed.budgets ?? [],
  };
};

const readFromStorage = (): WebState | null => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<WebState>;
    return normalizeWebState(parsed);
  } catch {
    return null;
  }
};

const writeToStorage = (state: WebState): void => {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    inMemoryFallback = state;
  }
};

export const readWebState = (): WebState => {
  const fromStorage = readFromStorage();
  if (fromStorage) {
    return fromStorage;
  }
  return inMemoryFallback;
};

export const updateWebState = (updater: (current: WebState) => WebState): WebState => {
  const current = readWebState();
  const next = updater(current);
  inMemoryFallback = next;
  writeToStorage(next);
  return next;
};

export const replaceWebState = (nextState: WebState): WebState => {
  inMemoryFallback = nextState;
  writeToStorage(nextState);
  return nextState;
};
