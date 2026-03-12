import type { ExpenseCategory } from '../../entities/Finance';
import type { FinanceRepository } from '../../repositories/FinanceRepository';
import type { DomainEventBus } from '../../events/DomainEventBus';
import { toIsoDate } from '../../../shared/utils/date';
import { createId } from '../../../shared/utils/id';

interface Deps {
  financeRepository: FinanceRepository;
  eventBus?: DomainEventBus;
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

  const recordedAt = toIsoDate(new Date());
  const normalizedSubCategory = subCategory.trim() || 'General';

  await deps.financeRepository.addExpense({
    amount,
    category,
    subCategory: normalizedSubCategory,
    note: note?.trim(),
    recordedAt,
  });

  await deps.eventBus?.publish({
    id: createId('evt_expense_logged'),
    type: 'finance.expense_logged',
    occurredAt: new Date().toISOString(),
    payload: {
      amount,
      category,
      subCategory: normalizedSubCategory,
      recordedAt,
    },
  });
};
