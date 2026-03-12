import type { ExpenseCategory } from '../../entities/Finance';
import type { FinanceRepository } from '../../repositories/FinanceRepository';
import type { ProfileRepository } from '../../repositories/ProfileRepository';
import { xpForAction } from '../../../application/services/gamification';
import { toIsoDate } from '../../../shared/utils/date';

interface Deps {
  financeRepository: FinanceRepository;
  profileRepository: ProfileRepository;
}

export const registerExpenseUseCase = async (
  deps: Deps,
  amount: number,
  category: ExpenseCategory,
  subCategory: string,
  note?: string,
): Promise<void> => {
  if (amount <= 0) {
    throw new Error('El gasto debe ser mayor a cero.');
  }

  await deps.financeRepository.addExpense({
    amount,
    category,
    subCategory: subCategory.trim() || 'General',
    note: note?.trim(),
    recordedAt: toIsoDate(new Date()),
  });

  await deps.profileRepository.addXp(xpForAction('expense_logged'));
};
