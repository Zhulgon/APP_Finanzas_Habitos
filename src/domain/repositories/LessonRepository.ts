import type { LessonWithStatus } from '../entities/Lesson';

export interface LessonRepository {
  listLessons(): Promise<LessonWithStatus[]>;
  markLessonCompleted(lessonId: string, completedAt: string): Promise<boolean>;
}
