import type { FinanceRepository } from '../../repositories/FinanceRepository';
import type { ProfileRepository } from '../../repositories/ProfileRepository';
import { xpForAction } from '../../../application/services/gamification';
import { toIsoDate } from '../../../shared/utils/date';

interface Deps {
  financeRepository: FinanceRepository;
  profileRepository: ProfileRepository;
}

export const registerIncomeUseCase = async (
  deps: Deps,
  amount: number,
): Promise<void> => {
  if (amount <= 0) {
    throw new Error('El ingreso debe ser mayor a cero.');
  }

  await deps.financeRepository.addIncome({
    amount,
    type: 'salary',
    recordedAt: toIsoDate(new Date()),
  });

  await deps.profileRepository.addXp(xpForAction('income_logged'));
};
