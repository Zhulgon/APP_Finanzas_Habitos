import type {
  BudgetProgress,
  ExpenseCategory,
  ExpenseRecord,
  IncomeRecord,
  IncomeType,
  MonthlyFinanceSummary,
} from '../entities/Finance';

export interface CreateIncomeInput {
  amount: number;
  type: IncomeType;
  recordedAt: string;
}

export interface CreateExpenseInput {
  amount: number;
  category: ExpenseCategory;
  subCategory: string;
  note?: string;
  recordedAt: string;
}

export interface FinanceRepository {
  addIncome(input: CreateIncomeInput): Promise<void>;
  addExpense(input: CreateExpenseInput): Promise<void>;
  setMonthlyBudget(
    category: ExpenseCategory,
    amount: number,
    referenceDate: Date,
  ): Promise<void>;
  getBudgetProgress(referenceDate: Date): Promise<BudgetProgress[]>;
  listRecentExpenses(limit: number): Promise<ExpenseRecord[]>;
  listRecentIncomes(limit: number): Promise<IncomeRecord[]>;
  listExpensesByDateRange(dateFrom: string, dateTo: string): Promise<ExpenseRecord[]>;
  listIncomesByDateRange(dateFrom: string, dateTo: string): Promise<IncomeRecord[]>;
  getMonthlySummary(referenceDate: Date): Promise<MonthlyFinanceSummary>;
}
