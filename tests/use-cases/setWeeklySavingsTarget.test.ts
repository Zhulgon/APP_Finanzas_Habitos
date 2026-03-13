import { setWeeklySavingsTargetUseCase } from '../../src/domain/use-cases/weekly-plan/setWeeklySavingsTarget';
import { createWeeklyPlanRepositoryMock } from '../helpers/repositoryMocks';

describe('setWeeklySavingsTargetUseCase', () => {
  it('guarda la meta semanal de ahorro valida', async () => {
    const repository = createWeeklyPlanRepositoryMock({
      setWeeklySavingsTarget: async (_referenceDate, target) => ({
        weekKey: '2026-W11',
        habitTarget: 8,
        savingsTarget: target,
        createdAt: '2026-03-10',
        updatedAt: '2026-03-10',
      }),
    });

    const result = await setWeeklySavingsTargetUseCase(
      repository,
      300000,
      new Date('2026-03-10T10:00:00.000Z'),
    );

    expect(result.savingsTarget).toBe(300000);
  });

  it('lanza error cuando la meta es negativa', async () => {
    const repository = createWeeklyPlanRepositoryMock();
    await expect(
      setWeeklySavingsTargetUseCase(repository, -10),
    ).rejects.toThrow('no puede ser negativa');
  });
});
