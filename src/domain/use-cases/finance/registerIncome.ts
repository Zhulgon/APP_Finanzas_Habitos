import type { FinanceRepository } from '../../repositories/FinanceRepository';
import type { DomainEventBus } from '../../events/DomainEventBus';
import { toIsoDate } from '../../../shared/utils/date';
import { createId } from '../../../shared/utils/id';

interface Deps {
  financeRepository: FinanceRepository;
  eventBus?: DomainEventBus;
}

export const registerIncomeUseCase = async (
  deps: Deps,
  amount: number,
): Promise<void> => {
  if (amount <= 0) {
    throw new Error('El ingreso debe ser mayor a cero.');
  }

  const recordedAt = toIsoDate(new Date());

  await deps.financeRepository.addIncome({
    amount,
    type: 'salary',
    recordedAt,
  });

  await deps.eventBus?.publish({
    id: createId('evt_income_logged'),
    type: 'finance.income_logged',
    occurredAt: new Date().toISOString(),
    payload: {
      amount,
      recordedAt,
    },
  });
};
