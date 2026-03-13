import type {
  BudgetProgress,
  ExpenseRecord,
  IncomeRecord,
  MonthlyFinanceSummary,
} from '../../../domain/entities/Finance';
import { EXPENSE_CATEGORIES } from '../../../domain/entities/Finance';
import type {
  CreateExpenseInput,
  CreateIncomeInput,
  FinanceRepository,
} from '../../../domain/repositories/FinanceRepository';
import { toMonthKey } from '../../../shared/utils/date';
import { clamp } from '../../../shared/utils/formatters';
import { readWebState, updateWebState } from './storage';

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

export class WebFinanceRepository implements FinanceRepository {
  async addIncome(input: CreateIncomeInput): Promise<void> {
    updateWebState((state) => {
      const id = state.counters.incomeId;
      return {
        ...state,
        incomes: [{ id, ...input }, ...state.incomes],
        counters: {
          ...state.counters,
          incomeId: id + 1,
        },
      };
    });
  }

  async addExpense(input: CreateExpenseInput): Promise<void> {
    updateWebState((state) => {
      const id = state.counters.expenseId;
      return {
        ...state,
        expenses: [{ id, ...input }, ...state.expenses],
        counters: {
          ...state.counters,
          expenseId: id + 1,
        },
      };
    });
  }

  async setMonthlyBudget(
    category: 'fixed' | 'variable' | 'services',
    amount: number,
    referenceDate: Date,
  ): Promise<void> {
    const monthKey = toMonthKey(referenceDate);
    updateWebState((state) => {
      const existingIndex = state.budgets.findIndex(
        (budget) => budget.monthKey === monthKey && budget.category === category,
      );
      if (existingIndex === -1) {
        return {
          ...state,
          budgets: [...state.budgets, { monthKey, category, amount }],
        };
      }

      const nextBudgets = [...state.budgets];
      nextBudgets[existingIndex] = {
        monthKey,
        category,
        amount,
      };
      return {
        ...state,
        budgets: nextBudgets,
      };
    });
  }

  async getBudgetProgress(referenceDate: Date): Promise<BudgetProgress[]> {
    const state = readWebState();
    const monthKey = toMonthKey(referenceDate);

    return EXPENSE_CATEGORIES.map((category) => {
      const budget =
        state.budgets.find(
          (item) => item.monthKey === monthKey && item.category === category,
        )?.amount ?? 0;
      const spent = state.expenses
        .filter(
          (expense) =>
            expense.category === category && expense.recordedAt.slice(0, 7) === monthKey,
        )
        .reduce((acc, row) => acc + row.amount, 0);
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
    const state = readWebState();
    return [...state.expenses]
      .sort((a, b) => {
        if (a.recordedAt !== b.recordedAt) {
          return a.recordedAt < b.recordedAt ? 1 : -1;
        }
        return b.id - a.id;
      })
      .slice(0, limit);
  }

  async listExpensesByDateRange(
    dateFrom: string,
    dateTo: string,
  ): Promise<ExpenseRecord[]> {
    const state = readWebState();
    return state.expenses
      .filter((expense) => expense.recordedAt >= dateFrom && expense.recordedAt <= dateTo)
      .sort((a, b) => {
        if (a.recordedAt !== b.recordedAt) {
          return a.recordedAt < b.recordedAt ? 1 : -1;
        }
        return b.id - a.id;
      });
  }

  async listRecentIncomes(limit: number): Promise<IncomeRecord[]> {
    const state = readWebState();
    return [...state.incomes]
      .sort((a, b) => {
        if (a.recordedAt !== b.recordedAt) {
          return a.recordedAt < b.recordedAt ? 1 : -1;
        }
        return b.id - a.id;
      })
      .slice(0, limit);
  }

  async listIncomesByDateRange(
    dateFrom: string,
    dateTo: string,
  ): Promise<IncomeRecord[]> {
    const state = readWebState();
    return state.incomes
      .filter((income) => income.recordedAt >= dateFrom && income.recordedAt <= dateTo)
      .sort((a, b) => {
        if (a.recordedAt !== b.recordedAt) {
          return a.recordedAt < b.recordedAt ? 1 : -1;
        }
        return b.id - a.id;
      });
  }

  async getMonthlySummary(referenceDate: Date): Promise<MonthlyFinanceSummary> {
    const state = readWebState();
    const monthKey = toMonthKey(referenceDate);
    const income = state.incomes
      .filter((row) => row.recordedAt.slice(0, 7) === monthKey)
      .reduce((acc, row) => acc + row.amount, 0);
    const expenses = state.expenses
      .filter((row) => row.recordedAt.slice(0, 7) === monthKey)
      .reduce((acc, row) => acc + row.amount, 0);

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
