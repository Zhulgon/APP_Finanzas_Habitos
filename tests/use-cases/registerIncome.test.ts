import { registerIncomeUseCase } from '../../src/domain/use-cases/finance/registerIncome';
import { createFinanceRepositoryMock } from '../helpers/repositoryMocks';
import { InMemoryDomainEventBus } from '../../src/application/services/InMemoryDomainEventBus';

describe('registerIncomeUseCase', () => {
  it('registra ingreso tipo salary y publica evento', async () => {
    let capturedInput:
      | {
          type: string;
        }
      | undefined;
    const addIncomeSpy = jest.fn(async (input: { type: string }) => {
      capturedInput = input;
    });
    const financeRepository = createFinanceRepositoryMock({
      addIncome: addIncomeSpy,
    });
    const eventBus = new InMemoryDomainEventBus();
    const handler = jest.fn(async (_event: any) => {});
    eventBus.subscribe('finance.income_logged', handler);

    await registerIncomeUseCase({ financeRepository, eventBus }, 2000000);

    expect(addIncomeSpy).toHaveBeenCalledTimes(1);
    expect(capturedInput?.type).toBe('salary');
    expect(handler).toHaveBeenCalledTimes(1);
    const event = handler.mock.calls[0]?.[0] as { payload: { amount: number } };
    expect(event.payload.amount).toBe(2000000);
  });

  it('falla si el ingreso es invalido', async () => {
    const financeRepository = createFinanceRepositoryMock();

    await expect(
      registerIncomeUseCase({ financeRepository }, -1),
    ).rejects.toThrow('El ingreso debe ser mayor a cero.');
  });
});
