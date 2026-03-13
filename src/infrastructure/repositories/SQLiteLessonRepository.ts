import { LESSON_CATALOG } from '../../domain/constants/lessonCatalog';
import type { LessonWithStatus } from '../../domain/entities/Lesson';
import type { LessonRepository } from '../../domain/repositories/LessonRepository';
import { getDatabase } from '../database/database';

interface LessonRow {
  lesson_id: string;
  completed_at: string;
}

export class SQLiteLessonRepository implements LessonRepository {
  async listLessons(): Promise<LessonWithStatus[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<LessonRow>(
      `
      SELECT
        lesson_id,
        completed_at
      FROM lesson_progress
      `,
    );

    const progressMap = new Map(rows.map((row) => [row.lesson_id, row.completed_at]));

    return LESSON_CATALOG.map((lesson) => ({
      ...lesson,
      completed: progressMap.has(lesson.id),
      completedAt: progressMap.get(lesson.id),
    })).sort((a, b) => (a.dayOrder ?? 999) - (b.dayOrder ?? 999));
  }

  async markLessonCompleted(lessonId: string, completedAt: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `
      INSERT OR IGNORE INTO lesson_progress (lesson_id, completed_at)
      VALUES (?, ?)
      `,
      lessonId,
      completedAt,
    );

    return result.changes > 0;
  }
}
