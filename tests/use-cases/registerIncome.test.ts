import { registerIncomeUseCase } from '../../src/domain/use-cases/finance/registerIncome';
import {
  createFinanceRepositoryMock,
  createProfileRepositoryMock,
} from '../helpers/repositoryMocks';

describe('registerIncomeUseCase', () => {
  it('registra ingreso tipo salary y suma xp', async () => {
    let capturedInput:
      | {
          type: string;
        }
      | undefined;
    const addIncomeSpy = jest.fn(async (input: { type: string }) => {
      capturedInput = input;
    });
    const addXpSpy = jest.fn(async () => ({
      name: '',
      objective: '',
      monthlyIncome: 0,
      monthlySavingsGoal: 0,
      currency: 'COP',
      xp: 5,
      level: 1,
      avatarColor: '#0f766e',
      avatarItem: 'seedling',
    }));
    const financeRepository = createFinanceRepositoryMock({
      addIncome: addIncomeSpy,
    });
    const profileRepository = createProfileRepositoryMock({
      addXp: addXpSpy,
    });

    await registerIncomeUseCase({ financeRepository, profileRepository }, 2000000);

    expect(addIncomeSpy).toHaveBeenCalledTimes(1);
    expect(capturedInput?.type).toBe('salary');
    expect(addXpSpy).toHaveBeenCalledWith(5);
  });

  it('falla si el ingreso es invalido', async () => {
    const financeRepository = createFinanceRepositoryMock();
    const profileRepository = createProfileRepositoryMock();

    await expect(
      registerIncomeUseCase({ financeRepository, profileRepository }, -1),
    ).rejects.toThrow('El ingreso debe ser mayor a cero.');
  });
});
