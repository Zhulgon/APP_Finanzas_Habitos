import type { MonthlyFinanceSummary } from '../../domain/entities/Finance';
import type { HabitStats } from '../../domain/entities/Habit';
import type { Mission } from './missions';

export interface BalanceTelemetry {
  missionCompletionRate: number;
  weeklyHabitRate: number;
  savingsRate: number;
  engagementRisk: 'low' | 'medium' | 'high';
}

export const buildBalanceTelemetry = (input: {
  missions: Mission[];
  habitStats: HabitStats;
  financeSummary: MonthlyFinanceSummary;
}): BalanceTelemetry => {
  const completedMissions = input.missions.filter((mission) => mission.completed).length;
  const missionCompletionRate =
    input.missions.length === 0
      ? 0
      : (completedMissions / input.missions.length) * 100;

  const engagementRisk =
    input.habitStats.weeklyCompletionRate >= 70 && missionCompletionRate >= 60
      ? 'low'
      : input.habitStats.weeklyCompletionRate >= 45
        ? 'medium'
        : 'high';

  return {
    missionCompletionRate,
    weeklyHabitRate: input.habitStats.weeklyCompletionRate,
    savingsRate: input.financeSummary.savingsRate,
    engagementRisk,
  };
};

