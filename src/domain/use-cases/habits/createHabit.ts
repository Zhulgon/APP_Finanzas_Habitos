import type { HabitCategory, HabitFrequency } from '../../entities/Habit';
import type { HabitRepository } from '../../repositories/HabitRepository';
import { createId } from '../../../shared/utils/id';
import { toIsoDate } from '../../../shared/utils/date';

interface Input {
  name: string;
  frequency: HabitFrequency;
  category: HabitCategory;
}

export const createHabitUseCase = async (
  repository: HabitRepository,
  input: Input,
): Promise<void> => {
  const name = input.name.trim();
  if (!name) {
    throw new Error('El habito necesita un nombre.');
  }

  await repository.createHabit({
    id: createId('habit'),
    name,
    frequency: input.frequency,
    category: input.category,
    targetPerWeek: input.frequency === 'daily' ? 7 : 1,
    createdAt: toIsoDate(new Date()),
  });
};
