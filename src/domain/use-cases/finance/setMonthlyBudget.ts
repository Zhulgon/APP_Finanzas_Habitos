import type { ExpenseCategory } from '../../entities/Finance';
import type { FinanceRepository } from '../../repositories/FinanceRepository';

export const setMonthlyBudgetUseCase = async (
  repository: FinanceRepository,
  category: ExpenseCategory,
  amount: number,
  referenceDate = new Date(),
): Promise<void> => {
  if (amount < 0) {
    throw new Error('El presupuesto no puede ser negativo.');
  }

  await repository.setMonthlyBudget(category, amount, referenceDate);
};
