import type { HabitCategory, HabitFrequency } from '../../entities/Habit';
import type { HabitRepository } from '../../repositories/HabitRepository';

interface Input {
  habitId: string;
  name: string;
  frequency: HabitFrequency;
  category: HabitCategory;
}

export const updateHabitUseCase = async (
  repository: HabitRepository,
  input: Input,
): Promise<boolean> => {
  const habitId = input.habitId.trim();
  const name = input.name.trim();

  if (!habitId) {
    throw new Error('El habito no es valido.');
  }

  if (!name) {
    throw new Error('El habito necesita un nombre.');
  }

  return repository.updateHabit({
    id: habitId,
    name,
    frequency: input.frequency,
    category: input.category,
    targetPerWeek: input.frequency === 'daily' ? 7 : 1,
  });
};

