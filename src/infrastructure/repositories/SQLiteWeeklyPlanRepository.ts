import type { WeeklyPlan } from '../../domain/entities/WeeklyPlan';
import type { WeeklyPlanRepository } from '../../domain/repositories/WeeklyPlanRepository';
import { toIsoDate, toWeekKey } from '../../shared/utils/date';
import { getDatabase } from '../database/database';

interface WeeklyPlanRow {
  week_key: string;
  habit_target: number;
  savings_target: number;
  created_at: string;
  updated_at: string;
}

const buildDefaultPlan = (referenceDate: Date): WeeklyPlan => {
  const todayIso = toIsoDate(referenceDate);
  return {
    weekKey: toWeekKey(referenceDate),
    habitTarget: 0,
    savingsTarget: 0,
    createdAt: todayIso,
    updatedAt: todayIso,
  };
};

const mapRow = (row: WeeklyPlanRow): WeeklyPlan => ({
  weekKey: row.week_key,
  habitTarget: row.habit_target,
  savingsTarget: row.savings_target,
  createdAt: row.created_at,
  updatedAt: row.updated_at,
});

export class SQLiteWeeklyPlanRepository implements WeeklyPlanRepository {
  async getWeeklyPlan(referenceDate: Date): Promise<WeeklyPlan> {
    const db = await getDatabase();
    const weekKey = toWeekKey(referenceDate);
    const row = await db.getFirstAsync<WeeklyPlanRow>(
      `
      SELECT week_key, habit_target, savings_target, created_at, updated_at
      FROM weekly_plan
      WHERE week_key = ?
      `,
      weekKey,
    );

    if (!row) {
      return buildDefaultPlan(referenceDate);
    }

    return mapRow(row);
  }

  async setWeeklyHabitTarget(referenceDate: Date, target: number): Promise<WeeklyPlan> {
    const db = await getDatabase();
    const current = await this.getWeeklyPlan(referenceDate);
    const todayIso = toIsoDate(referenceDate);
    await db.runAsync(
      `
      INSERT INTO weekly_plan (
        week_key, habit_target, savings_target, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(week_key)
      DO UPDATE SET
        habit_target = excluded.habit_target,
        updated_at = excluded.updated_at
      `,
      current.weekKey,
      target,
      current.savingsTarget,
      current.createdAt,
      todayIso,
    );

    return this.getWeeklyPlan(referenceDate);
  }

  async setWeeklySavingsTarget(referenceDate: Date, target: number): Promise<WeeklyPlan> {
    const db = await getDatabase();
    const current = await this.getWeeklyPlan(referenceDate);
    const todayIso = toIsoDate(referenceDate);
    await db.runAsync(
      `
      INSERT INTO weekly_plan (
        week_key, habit_target, savings_target, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(week_key)
      DO UPDATE SET
        savings_target = excluded.savings_target,
        updated_at = excluded.updated_at
      `,
      current.weekKey,
      current.habitTarget,
      target,
      current.createdAt,
      todayIso,
    );

    return this.getWeeklyPlan(referenceDate);
  }
}
