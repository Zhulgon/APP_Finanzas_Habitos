import type { WeeklyPlan } from '../../../domain/entities/WeeklyPlan';
import type { WeeklyPlanRepository } from '../../../domain/repositories/WeeklyPlanRepository';
import { toIsoDate, toWeekKey } from '../../../shared/utils/date';
import { readWebState, updateWebState } from './storage';

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

export class WebWeeklyPlanRepository implements WeeklyPlanRepository {
  async getWeeklyPlan(referenceDate: Date): Promise<WeeklyPlan> {
    const state = readWebState();
    const weekKey = toWeekKey(referenceDate);
    return (
      state.weeklyPlans.find((item) => item.weekKey === weekKey) ??
      buildDefaultPlan(referenceDate)
    );
  }

  async setWeeklyHabitTarget(referenceDate: Date, target: number): Promise<WeeklyPlan> {
    let nextPlan = buildDefaultPlan(referenceDate);
    updateWebState((state) => {
      const weekKey = toWeekKey(referenceDate);
      const todayIso = toIsoDate(referenceDate);
      const existing = state.weeklyPlans.find((item) => item.weekKey === weekKey);
      nextPlan = {
        ...(existing ?? buildDefaultPlan(referenceDate)),
        habitTarget: target,
        updatedAt: todayIso,
      };

      const filtered = state.weeklyPlans.filter((item) => item.weekKey !== weekKey);
      return {
        ...state,
        weeklyPlans: [nextPlan, ...filtered],
      };
    });

    return nextPlan;
  }

  async setWeeklySavingsTarget(referenceDate: Date, target: number): Promise<WeeklyPlan> {
    let nextPlan = buildDefaultPlan(referenceDate);
    updateWebState((state) => {
      const weekKey = toWeekKey(referenceDate);
      const todayIso = toIsoDate(referenceDate);
      const existing = state.weeklyPlans.find((item) => item.weekKey === weekKey);
      nextPlan = {
        ...(existing ?? buildDefaultPlan(referenceDate)),
        savingsTarget: target,
        updatedAt: todayIso,
      };

      const filtered = state.weeklyPlans.filter((item) => item.weekKey !== weekKey);
      return {
        ...state,
        weeklyPlans: [nextPlan, ...filtered],
      };
    });

    return nextPlan;
  }
}
