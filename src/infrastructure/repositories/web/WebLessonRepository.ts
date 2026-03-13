import { LESSON_CATALOG } from '../../../domain/constants/lessonCatalog';
import type { LessonWithStatus } from '../../../domain/entities/Lesson';
import type { LessonRepository } from '../../../domain/repositories/LessonRepository';
import { readWebState, updateWebState } from './storage';

export class WebLessonRepository implements LessonRepository {
  async listLessons(): Promise<LessonWithStatus[]> {
    const state = readWebState();
    const progressMap = new Map(
      state.lessonProgress.map((item) => [item.lessonId, item.completedAt]),
    );

    return LESSON_CATALOG.map((lesson) => {
      const completedAt = progressMap.get(lesson.id);
      return {
        ...lesson,
        completed: Boolean(completedAt),
        completedAt,
      };
    }).sort((a, b) => (a.dayOrder ?? 999) - (b.dayOrder ?? 999));
  }

  async markLessonCompleted(lessonId: string, completedAt: string): Promise<boolean> {
    let inserted = false;
    updateWebState((state) => {
      if (state.lessonProgress.some((item) => item.lessonId === lessonId)) {
        inserted = false;
        return state;
      }
      inserted = true;
      return {
        ...state,
        lessonProgress: [...state.lessonProgress, { lessonId, completedAt }],
      };
    });

    return inserted;
  }
}
