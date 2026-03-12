export type IncomeType = 'salary' | 'extra';
export type ExpenseCategory = 'fixed' | 'variable' | 'services';
export const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'fixed',
  'variable',
  'services',
];

export interface IncomeRecord {
  id: number;
  amount: number;
  type: IncomeType;
  recordedAt: string;
}

export interface ExpenseRecord {
  id: number;
  amount: number;
  category: ExpenseCategory;
  subCategory: string;
  note?: string;
  recordedAt: string;
}

export interface MonthlyFinanceSummary {
  income: number;
  expenses: number;
  balance: number;
  savingsRate: number;
}

export type BudgetStatus = 'healthy' | 'warning' | 'over';

export interface BudgetProgress {
  category: ExpenseCategory;
  budget: number;
  spent: number;
  remaining: number;
  usageRate: number;
  status: BudgetStatus;
}
