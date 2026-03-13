import { setWeeklyHabitTargetUseCase } from '../../src/domain/use-cases/weekly-plan/setWeeklyHabitTarget';
import { createWeeklyPlanRepositoryMock } from '../helpers/repositoryMocks';

describe('setWeeklyHabitTargetUseCase', () => {
  it('guarda la meta semanal de habitos valida', async () => {
    const repository = createWeeklyPlanRepositoryMock({
      setWeeklyHabitTarget: async (referenceDate, target) => ({
        weekKey: '2026-W11',
        habitTarget: target,
        savingsTarget: 0,
        createdAt: '2026-03-10',
        updatedAt: '2026-03-10',
      }),
    });

    const result = await setWeeklyHabitTargetUseCase(
      repository,
      9,
      new Date('2026-03-10T10:00:00.000Z'),
    );

    expect(result.habitTarget).toBe(9);
  });

  it('lanza error cuando la meta es negativa', async () => {
    const repository = createWeeklyPlanRepositoryMock();
    await expect(
      setWeeklyHabitTargetUseCase(repository, -1),
    ).rejects.toThrow('no puede ser negativa');
  });
});
