import type {
  BudgetProgress,
  ExpenseRecord,
  IncomeRecord,
  MonthlyFinanceSummary,
} from '../../domain/entities/Finance';
import { EXPENSE_CATEGORIES } from '../../domain/entities/Finance';
import type {
  CreateExpenseInput,
  CreateIncomeInput,
  FinanceRepository,
} from '../../domain/repositories/FinanceRepository';
import { clamp } from '../../shared/utils/formatters';
import { toMonthKey } from '../../shared/utils/date';
import { getDatabase } from '../database/database';

interface IncomeRow {
  id: number;
  amount: number;
  type: 'salary' | 'extra';
  recorded_at: string;
}

interface ExpenseRow {
  id: number;
  amount: number;
  category: 'fixed' | 'variable' | 'services';
  sub_category: string;
  note: string | null;
  recorded_at: string;
}

interface BudgetRow {
  category: 'fixed' | 'variable' | 'services';
  amount: number;
}

interface SpentRow {
  category: 'fixed' | 'variable' | 'services';
  spent: number;
}

const budgetStatus = (budget: number, spent: number): BudgetProgress['status'] => {
  if (budget <= 0) {
    return spent > 0 ? 'over' : 'healthy';
  }

  const usage = (spent / budget) * 100;
  if (usage <= 80) {
    return 'healthy';
  }
  if (usage <= 100) {
    return 'warning';
  }
  return 'over';
};

export class SQLiteFinanceRepository implements FinanceRepository {
  async addIncome(input: CreateIncomeInput): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `
      INSERT INTO incomes (amount, type, recorded_at)
      VALUES (?, ?, ?)
      `,
      input.amount,
      input.type,
      input.recordedAt,
    );
  }

  async addExpense(input: CreateExpenseInput): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `
      INSERT INTO expenses (amount, category, sub_category, note, recorded_at)
      VALUES (?, ?, ?, ?, ?)
      `,
      input.amount,
      input.category,
      input.subCategory,
      input.note ?? null,
      input.recordedAt,
    );
  }

  async setMonthlyBudget(
    category: 'fixed' | 'variable' | 'services',
    amount: number,
    referenceDate: Date,
  ): Promise<void> {
    const db = await getDatabase();
    const monthKey = toMonthKey(referenceDate);
    await db.runAsync(
      `
      INSERT INTO budgets (month_key, category, amount)
      VALUES (?, ?, ?)
      ON CONFLICT(month_key, category)
      DO UPDATE SET amount = excluded.amount
      `,
      monthKey,
      category,
      amount,
    );
  }

  async getBudgetProgress(referenceDate: Date): Promise<BudgetProgress[]> {
    const db = await getDatabase();
    const monthKey = toMonthKey(referenceDate);

    const budgets = await db.getAllAsync<BudgetRow>(
      `
      SELECT category, amount
      FROM budgets
      WHERE month_key = ?
      `,
      monthKey,
    );
    const budgetMap = new Map(budgets.map((row) => [row.category, row.amount]));

    const spentRows = await db.getAllAsync<SpentRow>(
      `
      SELECT category, COALESCE(SUM(amount), 0) as spent
      FROM expenses
      WHERE strftime('%Y-%m', recorded_at) = ?
      GROUP BY category
      `,
      monthKey,
    );
    const spentMap = new Map(spentRows.map((row) => [row.category, row.spent]));

    return EXPENSE_CATEGORIES.map((category) => {
      const budget = budgetMap.get(category) ?? 0;
      const spent = spentMap.get(category) ?? 0;
      const remaining = budget - spent;
      const usageRate =
        budget <= 0 ? (spent > 0 ? 100 : 0) : clamp((spent / budget) * 100, 0, 999);

      return {
        category,
        budget,
        spent,
        remaining,
        usageRate,
        status: budgetStatus(budget, spent),
      };
    });
  }

  async listRecentExpenses(limit: number): Promise<ExpenseRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<ExpenseRow>(
      `
      SELECT id, amount, category, sub_category, note, recorded_at
      FROM expenses
      ORDER BY recorded_at DESC, id DESC
      LIMIT ?
      `,
      limit,
    );

    return rows.map((row) => ({
      id: row.id,
      amount: row.amount,
      category: row.category,
      subCategory: row.sub_category,
      note: row.note ?? undefined,
      recordedAt: row.recorded_at,
    }));
  }

  async listRecentIncomes(limit: number): Promise<IncomeRecord[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<IncomeRow>(
      `
      SELECT id, amount, type, recorded_at
      FROM incomes
      ORDER BY recorded_at DESC, id DESC
      LIMIT ?
      `,
      limit,
    );

    return rows.map((row) => ({
      id: row.id,
      amount: row.amount,
      type: row.type,
      recordedAt: row.recorded_at,
    }));
  }

  async getMonthlySummary(referenceDate: Date): Promise<MonthlyFinanceSummary> {
    const db = await getDatabase();
    const monthKey = toMonthKey(referenceDate);

    const incomeRow = await db.getFirstAsync<{ total: number }>(
      `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM incomes
      WHERE strftime('%Y-%m', recorded_at) = ?
      `,
      monthKey,
    );

    const expenseRow = await db.getFirstAsync<{ total: number }>(
      `
      SELECT COALESCE(SUM(amount), 0) as total
      FROM expenses
      WHERE strftime('%Y-%m', recorded_at) = ?
      `,
      monthKey,
    );

    const income = incomeRow?.total ?? 0;
    const expenses = expenseRow?.total ?? 0;
    const balance = income - expenses;
    const savingsRate = income <= 0 ? 0 : clamp((balance / income) * 100, -100, 100);

    return {
      income,
      expenses,
      balance,
      savingsRate,
    };
  }
}
