import type { WeeklyPlan } from '../entities/WeeklyPlan';

export interface WeeklyPlanRepository {
  getWeeklyPlan(referenceDate: Date): Promise<WeeklyPlan>;
  setWeeklyHabitTarget(referenceDate: Date, target: number): Promise<WeeklyPlan>;
  setWeeklySavingsTarget(referenceDate: Date, target: number): Promise<WeeklyPlan>;
}
