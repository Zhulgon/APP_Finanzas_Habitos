import type { LessonWithStatus } from '../../domain/entities/Lesson';
import type { LessonRepository } from '../../domain/repositories/LessonRepository';
import { getDatabase } from '../database/database';

interface LessonRow {
  id: string;
  title: string;
  summary: string;
  content: string;
  estimated_minutes: number;
  completed: number;
  completed_at: string | null;
}

export class SQLiteLessonRepository implements LessonRepository {
  async listLessons(): Promise<LessonWithStatus[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<LessonRow>(
      `
      SELECT
        l.id,
        l.title,
        l.summary,
        l.content,
        l.estimated_minutes,
        CASE WHEN lp.lesson_id IS NULL THEN 0 ELSE 1 END as completed,
        lp.completed_at
      FROM lessons l
      LEFT JOIN lesson_progress lp ON lp.lesson_id = l.id
      ORDER BY l.id ASC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      summary: row.summary,
      content: row.content,
      estimatedMinutes: row.estimated_minutes,
      completed: row.completed === 1,
      completedAt: row.completed_at ?? undefined,
    }));
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
