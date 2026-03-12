import type { BudgetProgress, ExpenseRecord, IncomeRecord } from './Finance';
import type { Habit } from './Habit';
import type { UserProfile } from './Profile';

export interface BackupHabitLog {
  habitId: string;
  completedAt: string;
}

export interface BackupLessonProgress {
  lessonId: string;
  completedAt: string;
}

export interface BackupBudgetRecord {
  monthKey: string;
  category: 'fixed' | 'variable' | 'services';
  amount: number;
}

export interface BackupCounters {
  incomeId: number;
  expenseId: number;
}

export interface BackupPayload {
  version: 1;
  exportedAt: string;
  data: {
    profile: UserProfile;
    habits: Habit[];
    habitLogs: BackupHabitLog[];
    incomes: IncomeRecord[];
    expenses: ExpenseRecord[];
    budgets: BackupBudgetRecord[];
    lessonProgress: BackupLessonProgress[];
    counters: BackupCounters;
  };
}

export type BackupBudgetSnapshot = Pick<
  BudgetProgress,
  'category' | 'budget' | 'spent' | 'remaining' | 'usageRate' | 'status'
>;
