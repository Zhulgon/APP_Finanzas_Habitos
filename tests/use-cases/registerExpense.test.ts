import { registerExpenseUseCase } from '../../src/domain/use-cases/finance/registerExpense';
import { createFinanceRepositoryMock } from '../helpers/repositoryMocks';
import { InMemoryDomainEventBus } from '../../src/application/services/InMemoryDomainEventBus';

describe('registerExpenseUseCase', () => {
  it('registra gasto y publica evento', async () => {
    let capturedInput:
      | {
          subCategory: string;
        }
      | undefined;
    const addExpenseSpy = jest.fn(async (input: { subCategory: string }) => {
      capturedInput = input;
    });
    const financeRepository = createFinanceRepositoryMock({
      addExpense: addExpenseSpy,
    });
    const eventBus = new InMemoryDomainEventBus();
    const handler = jest.fn(async (_event: any) => {});
    eventBus.subscribe('finance.expense_logged', handler);

    await registerExpenseUseCase(
      { financeRepository, eventBus },
      100000,
      'fixed',
      '  arriendo  ',
    );

    expect(addExpenseSpy).toHaveBeenCalledTimes(1);
    expect(capturedInput?.subCategory).toBe('arriendo');
    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0]?.[0] as { payload: { amount: number } };
    expect(event.payload.amount).toBe(100000);
  });

  it('falla si el monto es menor o igual a cero', async () => {
    const financeRepository = createFinanceRepositoryMock();

    await expect(
      registerExpenseUseCase(
        { financeRepository },
        0,
        'fixed',
        'arriendo',
      ),
    ).rejects.toThrow('El gasto debe ser mayor a cero.');
  });
});
