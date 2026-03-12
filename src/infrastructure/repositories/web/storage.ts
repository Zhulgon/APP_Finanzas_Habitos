import type {
  ExpenseCategory,
  ExpenseRecord,
  IncomeRecord,
} from '../../../domain/entities/Finance';
import type { Habit } from '../../../domain/entities/Habit';
import type { UserProfile } from '../../../domain/entities/Profile';

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

export interface WebState {
  habits: Habit[];
  habitLogs: HabitLog[];
  incomes: IncomeRecord[];
  expenses: ExpenseRecord[];
  budgets: BudgetRecord[];
  lessonProgress: LessonProgress[];
  profile: UserProfile;
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
  avatarColor: '#0f766e',
  avatarItem: 'seedling',
};

const defaultState = (): WebState => ({
  habits: [],
  habitLogs: [],
  incomes: [],
  expenses: [],
  budgets: [],
  lessonProgress: [],
  profile: defaultProfile,
  counters: {
    incomeId: 1,
    expenseId: 1,
  },
});

let inMemoryFallback = defaultState();

const readFromStorage = (): WebState | null => {
  try {
    const raw = globalThis.localStorage?.getItem(STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<WebState>;
    return {
      ...defaultState(),
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
      },
      counters: {
        ...defaultState().counters,
        ...(parsed.counters ?? {}),
      },
      budgets: parsed.budgets ?? [],
    };
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
