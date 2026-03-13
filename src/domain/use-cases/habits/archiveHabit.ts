import type { HabitRepository } from '../../repositories/HabitRepository';

export const archiveHabitUseCase = async (
  repository: HabitRepository,
  habitId: string,
): Promise<boolean> => {
  const trimmedHabitId = habitId.trim();
  if (!trimmedHabitId) {
    throw new Error('El habito no es valido.');
  }

  return repository.archiveHabit(trimmedHabitId);
};

