import { endOfWeek, startOfWeek, subDays } from 'date-fns';
import { toIsoDate } from '../../shared/utils/date';
import type { Habit, HabitStats } from '../../domain/entities/Habit';
import type {
  CreateHabitInput,
  HabitRepository,
  UpdateHabitInput,
} from '../../domain/repositories/HabitRepository';
import { clamp } from '../../shared/utils/formatters';
import { getDatabase } from '../database/database';

interface HabitRow {
  id: string;
  name: string;
  frequency: 'daily' | 'weekly';
  target_per_week: number;
  category: 'health' | 'productivity' | 'finance';
  is_active: number;
  created_at: string;
}

export class SQLiteHabitRepository implements HabitRepository {
  async listActiveHabits(): Promise<Habit[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<HabitRow>(
      `
      SELECT id, name, frequency, target_per_week, category, is_active, created_at
      FROM habits
      WHERE is_active = 1
      ORDER BY created_at DESC
      `,
    );

    return rows.map((row) => ({
      id: row.id,
      name: row.name,
      frequency: row.frequency,
      targetPerWeek: row.target_per_week,
      category: row.category,
      isActive: row.is_active === 1,
      createdAt: row.created_at,
    }));
  }

  async createHabit(input: CreateHabitInput): Promise<void> {
    const db = await getDatabase();
    await db.runAsync(
      `
      INSERT INTO habits (id, name, frequency, target_per_week, category, is_active, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      `,
      input.id,
      input.name,
      input.frequency,
      input.targetPerWeek,
      input.category,
      1,
      input.createdAt,
    );
  }

  async updateHabit(input: UpdateHabitInput): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `
      UPDATE habits
      SET name = ?,
          frequency = ?,
          target_per_week = ?,
          category = ?
      WHERE id = ?
        AND is_active = 1
      `,
      input.name,
      input.frequency,
      input.targetPerWeek,
      input.category,
      input.id,
    );

    return result.changes > 0;
  }

  async archiveHabit(habitId: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `
      UPDATE habits
      SET is_active = 0
      WHERE id = ?
        AND is_active = 1
      `,
      habitId,
    );

    return result.changes > 0;
  }

  async logCompletion(habitId: string, completedAt: string): Promise<boolean> {
    const db = await getDatabase();
    const result = await db.runAsync(
      `
      INSERT INTO habit_logs (habit_id, completed_at)
      SELECT ?, ?
      WHERE NOT EXISTS (
        SELECT 1 FROM habit_logs
        WHERE habit_id = ?
          AND date(completed_at) = date(?)
      )
      `,
      habitId,
      completedAt,
      habitId,
      completedAt,
    );

    return result.changes > 0;
  }

  async getStats(referenceDate: Date): Promise<HabitStats> {
    const db = await getDatabase();
    const activeHabits = await this.listActiveHabits();
    const today = toIsoDate(referenceDate);
    const weekStart = toIsoDate(
      startOfWeek(referenceDate, { weekStartsOn: 1 }),
    );
    const weekEnd = toIsoDate(endOfWeek(referenceDate, { weekStartsOn: 1 }));

    const todayRow = await db.getFirstAsync<{ total: number }>(
      `
      SELECT COUNT(DISTINCT habit_id) as total
      FROM habit_logs
      WHERE date(completed_at) = date(?)
      `,
      today,
    );

    const weekCompletionsRow = await db.getFirstAsync<{ total: number }>(
      `
      SELECT COUNT(*) as total
      FROM habit_logs
      WHERE date(completed_at) BETWEEN date(?) AND date(?)
      `,
      weekStart,
      weekEnd,
    );

    const completionDays = await db.getAllAsync<{ day: string }>(
      `
      SELECT DISTINCT date(completed_at) as day
      FROM habit_logs
      ORDER BY day DESC
      LIMIT 120
      `,
    );

    const daySet = new Set(completionDays.map((row) => row.day));
    let streakDays = 0;
    let cursor = referenceDate;
    while (daySet.has(toIsoDate(cursor))) {
      streakDays += 1;
      cursor = subDays(cursor, 1);
    }

    const weeklyTarget = activeHabits.reduce(
      (acc, habit) => acc + habit.targetPerWeek,
      0,
    );
    const weekCompletions = weekCompletionsRow?.total ?? 0;
    const weeklyCompletionRate =
      weeklyTarget === 0
        ? 0
        : clamp((weekCompletions / weeklyTarget) * 100, 0, 100);

    return {
      activeHabitsCount: activeHabits.length,
      todayCompleted: todayRow?.total ?? 0,
      weeklyCompletionRate,
      streakDays,
    };
  }

  async listCompletionDates(referenceDate: Date, lookbackDays: number): Promise<string[]> {
    const db = await getDatabase();
    const safeLookbackDays = Math.max(1, lookbackDays);
    const lowerBound = toIsoDate(subDays(referenceDate, safeLookbackDays));

    const completionDays = await db.getAllAsync<{ day: string }>(
      `
      SELECT DISTINCT date(completed_at) as day
      FROM habit_logs
      WHERE date(completed_at) >= date(?)
      ORDER BY day DESC
      `,
      lowerBound,
    );

    return completionDays.map((row) => row.day);
  }
}
