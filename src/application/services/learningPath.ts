import type { LessonWithStatus } from '../../domain/entities/Lesson';
import { toIsoDate } from '../../shared/utils/date';

export interface LearningPathSnapshot {
  lessons: LessonWithStatus[];
  totalLessons: number;
  completedLessons: number;
  pendingLessons: number;
  availableToday: number;
  completedToday: number;
  nextUnlockDate?: string;
}

interface BuildLearningPathInput {
  lessons: LessonWithStatus[];
  referenceDate?: Date;
  dailyLimit?: number;
}

const sortLessons = (lessons: LessonWithStatus[]): LessonWithStatus[] => {
  return [...lessons].sort((a, b) => {
    const orderA = a.dayOrder ?? 999;
    const orderB = b.dayOrder ?? 999;
    if (orderA === orderB) {
      return a.title.localeCompare(b.title);
    }
    return orderA - orderB;
  });
};

export const buildLearningPath = (
  input: BuildLearningPathInput,
): LearningPathSnapshot => {
  const todayIso = toIsoDate(input.referenceDate ?? new Date());
  const dailyLimit = Math.max(1, input.dailyLimit ?? 1);
  const ordered = sortLessons(input.lessons);
  const completedToday = ordered.filter(
    (lesson) => lesson.completedAt === todayIso,
  ).length;
  const completedLessons = ordered.filter((lesson) => lesson.completed).length;
  const firstPendingIndex = ordered.findIndex((lesson) => !lesson.completed);

  const lessons = ordered.map((lesson, index) => {
    if (lesson.completed) {
      return {
        ...lesson,
        availableToday: true,
        lockedReason: undefined,
      };
    }

    if (index !== firstPendingIndex) {
      return {
        ...lesson,
        availableToday: false,
        lockedReason:
          'Completa la capsula anterior para desbloquear esta leccion.',
      };
    }

    if (completedToday >= dailyLimit) {
      return {
        ...lesson,
        availableToday: false,
        lockedReason:
          'Ya completaste tu capsula diaria. Vuelve manana para continuar.',
      };
    }

    return {
      ...lesson,
      availableToday: true,
      lockedReason: undefined,
    };
  });

  const availableToday = lessons.filter(
    (lesson) => !lesson.completed && lesson.availableToday,
  ).length;
  const pendingLessons = lessons.filter((lesson) => !lesson.completed).length;

  return {
    lessons,
    totalLessons: lessons.length,
    completedLessons,
    pendingLessons,
    availableToday,
    completedToday,
    nextUnlockDate:
      pendingLessons > 0 && completedToday >= dailyLimit
        ? toIsoDate(
            new Date(
              (input.referenceDate ?? new Date()).getTime() + 24 * 60 * 60 * 1000,
            ),
          )
        : undefined,
  };
};
