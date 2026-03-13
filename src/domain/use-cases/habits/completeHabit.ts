import type { HabitRepository } from '../../repositories/HabitRepository';
import type { DomainEventBus } from '../../events/DomainEventBus';
import { toIsoDate } from '../../../shared/utils/date';
import { createId } from '../../../shared/utils/id';

interface Deps {
  habitRepository: HabitRepository;
  eventBus?: DomainEventBus;
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

  await deps.eventBus?.publish({
    id: createId('evt_habit_completed'),
    type: 'habit.completed',
    occurredAt: new Date().toISOString(),
    payload: {
      habitId,
      completedAt: toIsoDate(completedAt),
    },
  });

  return true;
};
