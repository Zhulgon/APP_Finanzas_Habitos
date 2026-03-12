import type { HabitRepository } from '../../repositories/HabitRepository';
import type { ProfileRepository } from '../../repositories/ProfileRepository';
import { xpForAction } from '../../../application/services/gamification';
import { toIsoDate } from '../../../shared/utils/date';

interface Deps {
  habitRepository: HabitRepository;
  profileRepository: ProfileRepository;
}

export const completeHabitUseCase = async (
  deps: Deps,
  habitId: string,
  completedAt = new Date(),
): Promise<boolean> => {
  const wasInserted = await deps.habitRepository.logCompletion(
    habitId,
    toIsoDate(completedAt),
  );

  if (!wasInserted) {
    return false;
  }

  await deps.profileRepository.addXp(xpForAction('habit_completion'));
  return true;
};
