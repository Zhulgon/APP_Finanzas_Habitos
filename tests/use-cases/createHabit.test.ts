import { createHabitUseCase } from '../../src/domain/use-cases/habits/createHabit';
import { createHabitRepositoryMock } from '../helpers/repositoryMocks';

describe('createHabitUseCase', () => {
  it('crea un habito diario con target semanal 7', async () => {
    const createHabitSpy = jest.fn();
    const repository = createHabitRepositoryMock({
      createHabit: createHabitSpy,
    });

    await createHabitUseCase(repository, {
      name: '  Leer 10 paginas  ',
      frequency: 'daily',
      category: 'health',
    });

    expect(createHabitSpy).toHaveBeenCalledTimes(1);
    const input = createHabitSpy.mock.calls[0][0];
    expect(input.name).toBe('Leer 10 paginas');
    expect(input.targetPerWeek).toBe(7);
    expect(input.id).toContain('habit_');
  });

  it('falla cuando el nombre es vacio', async () => {
    const repository = createHabitRepositoryMock();
    await expect(
      createHabitUseCase(repository, {
        name: '   ',
        frequency: 'weekly',
        category: 'finance',
      }),
    ).rejects.toThrow('El habito necesita un nombre.');
  });
});
