import type { SQLiteDatabase } from 'expo-sqlite';
import { levelFromXp } from '../../application/services/gamification';
import { LESSON_CATALOG } from '../../domain/constants/lessonCatalog';

export const seedProfileIfNeeded = async (db: SQLiteDatabase): Promise<void> => {
  const row = await db.getFirstAsync<{ total: number }>(
    'SELECT COUNT(*) as total FROM user_profile WHERE id = 1',
  );

  if ((row?.total ?? 0) > 0) {
    return;
  }

  const xp = 0;
  await db.runAsync(
    `
    INSERT INTO user_profile (
      id, name, objective, monthly_income, currency, xp, level, avatar_color, avatar_item
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `,
    1,
    '',
    '',
    0,
    'COP',
    xp,
    levelFromXp(xp),
    '#0f766e',
    'seedling',
  );
};

export const seedLessonsIfNeeded = async (db: SQLiteDatabase): Promise<void> => {
  for (const lesson of LESSON_CATALOG) {
    await db.runAsync(
      `
      INSERT OR IGNORE INTO lessons (
        id, title, summary, content, estimated_minutes
      ) VALUES (?, ?, ?, ?, ?)
      `,
      lesson.id,
      lesson.title,
      lesson.summary,
      lesson.content,
      lesson.estimatedMinutes,
    );
  }
};
