import type { LessonRepository } from '../../repositories/LessonRepository';
import type { DomainEventBus } from '../../events/DomainEventBus';
import { toIsoDate } from '../../../shared/utils/date';
import { createId } from '../../../shared/utils/id';

interface Deps {
  lessonRepository: LessonRepository;
  eventBus?: DomainEventBus;
}

export const completeLessonUseCase = async (
  deps: Deps,
  lessonId: string,
): Promise<boolean> => {
  const wasCompleted = await deps.lessonRepository.markLessonCompleted(
    lessonId,
    toIsoDate(new Date()),
  );

  if (!wasCompleted) {
    return false;
  }

  await deps.eventBus?.publish({
    id: createId('evt_lesson_completed'),
    type: 'lesson.completed',
    occurredAt: new Date().toISOString(),
    payload: {
      lessonId,
      completedAt: toIsoDate(new Date()),
    },
  });

  return true;
};
