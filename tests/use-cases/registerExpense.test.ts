import { registerExpenseUseCase } from '../../src/domain/use-cases/finance/registerExpense';
import {
  createFinanceRepositoryMock,
  createProfileRepositoryMock,
} from '../helpers/repositoryMocks';

describe('registerExpenseUseCase', () => {
  it('registra gasto y suma xp', async () => {
    let capturedInput:
      | {
          subCategory: string;
        }
      | undefined;
    const addExpenseSpy = jest.fn(async (input: { subCategory: string }) => {
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
      addExpense: addExpenseSpy,
    });
    const profileRepository = createProfileRepositoryMock({
      addXp: addXpSpy,
    });

    await registerExpenseUseCase(
      { financeRepository, profileRepository },
      100000,
      'fixed',
      '  arriendo  ',
    );

    expect(addExpenseSpy).toHaveBeenCalledTimes(1);
    expect(capturedInput?.subCategory).toBe('arriendo');
    expect(addXpSpy).toHaveBeenCalledWith(5);
  });

  it('falla si el monto es menor o igual a cero', async () => {
    const financeRepository = createFinanceRepositoryMock();
    const profileRepository = createProfileRepositoryMock();

    await expect(
      registerExpenseUseCase(
        { financeRepository, profileRepository },
        0,
        'fixed',
        'arriendo',
      ),
    ).rejects.toThrow('El gasto debe ser mayor a cero.');
  });
});
