import { updateHabitUseCase } from '../../src/domain/use-cases/habits/updateHabit';
import { createHabitRepositoryMock } from '../helpers/repositoryMocks';

describe('updateHabitUseCase', () => {
  it('actualiza habito activo con target segun frecuencia', async () => {
    const updateSpy = jest.fn(async () => true);
    const repository = createHabitRepositoryMock({
      updateHabit: updateSpy,
    });

    const result = await updateHabitUseCase(repository, {
      habitId: 'habit_1',
      name: '  Leer 20 min  ',
      frequency: 'daily',
      category: 'productivity',
    });

    expect(result).toBe(true);
    expect(updateSpy).toHaveBeenCalledWith({
      id: 'habit_1',
      name: 'Leer 20 min',
      frequency: 'daily',
      category: 'productivity',
      targetPerWeek: 7,
    });
  });

  it('falla si nombre esta vacio', async () => {
    const repository = createHabitRepositoryMock();
    await expect(
      updateHabitUseCase(repository, {
        habitId: 'habit_1',
        name: '  ',
        frequency: 'weekly',
        category: 'health',
      }),
    ).rejects.toThrow('El habito necesita un nombre.');
  });
});

