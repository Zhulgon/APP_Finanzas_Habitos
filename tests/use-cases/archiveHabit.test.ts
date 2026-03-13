import { archiveHabitUseCase } from '../../src/domain/use-cases/habits/archiveHabit';
import { createHabitRepositoryMock } from '../helpers/repositoryMocks';

describe('archiveHabitUseCase', () => {
  it('archiva habito cuando existe activo', async () => {
    const archiveSpy = jest.fn(async () => true);
    const repository = createHabitRepositoryMock({
      archiveHabit: archiveSpy,
    });

    const result = await archiveHabitUseCase(repository, 'habit_1');

    expect(result).toBe(true);
    expect(archiveSpy).toHaveBeenCalledWith('habit_1');
  });

  it('falla si habitId no es valido', async () => {
    const repository = createHabitRepositoryMock();
    await expect(archiveHabitUseCase(repository, '   ')).rejects.toThrow(
      'El habito no es valido.',
    );
  });
});

