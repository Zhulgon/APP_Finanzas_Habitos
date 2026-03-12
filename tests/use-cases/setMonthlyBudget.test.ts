import { setMonthlyBudgetUseCase } from '../../src/domain/use-cases/finance/setMonthlyBudget';
import { createFinanceRepositoryMock } from '../helpers/repositoryMocks';

describe('setMonthlyBudgetUseCase', () => {
  it('guarda presupuesto mensual por categoria', async () => {
    const setBudgetSpy = jest.fn(async () => {});
    const repository = createFinanceRepositoryMock({
      setMonthlyBudget: setBudgetSpy,
    });
    const referenceDate = new Date('2026-03-12T12:00:00.000Z');

    await setMonthlyBudgetUseCase(repository, 'fixed', 850000, referenceDate);

    expect(setBudgetSpy).toHaveBeenCalledWith('fixed', 850000, referenceDate);
  });

  it('falla con presupuesto negativo', async () => {
    const repository = createFinanceRepositoryMock();
    await expect(
      setMonthlyBudgetUseCase(repository, 'services', -1, new Date()),
    ).rejects.toThrow('El presupuesto no puede ser negativo.');
  });
});
