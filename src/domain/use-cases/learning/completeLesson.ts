import type { LessonRepository } from '../../repositories/LessonRepository';
import type { ProfileRepository } from '../../repositories/ProfileRepository';
import { xpForAction } from '../../../application/services/gamification';
import { toIsoDate } from '../../../shared/utils/date';

interface Deps {
  lessonRepository: LessonRepository;
  profileRepository: ProfileRepository;
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

  await deps.profileRepository.addXp(xpForAction('lesson_completed'));
  return true;
};
