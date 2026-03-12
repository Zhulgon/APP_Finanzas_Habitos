import { format } from 'date-fns';
import type { MonthlyFinanceSummary } from '../../domain/entities/Finance';
import type { HabitStats } from '../../domain/entities/Habit';
import type { LessonWithStatus } from '../../domain/entities/Lesson';
import type { GamificationDimension, UserProfile } from '../../domain/entities/Profile';

export type MissionCycle = 'daily' | 'weekly';

export interface Mission {
  id: string;
  cycle: MissionCycle;
  title: string;
  description: string;
  current: number;
  target: number;
  rewardXp: number;
  rewardCoins: number;
  rewardDimension: GamificationDimension;
  completed: boolean;
  claimed: boolean;
}

interface MissionBuildContext {
  profile: UserProfile;
  habitStats: HabitStats;
  financeSummary: MonthlyFinanceSummary;
  lessons: LessonWithStatus[];
  activeHabitsCount: number;
  referenceDate?: Date;
}

const dailyHabitTarget = (
  activeHabitsCount: number,
  missionDifficulty: 1 | 2 | 3,
): number => {
  const baseTarget = missionDifficulty === 3 ? 3 : missionDifficulty === 2 ? 2 : 1;
  return Math.max(1, Math.min(activeHabitsCount || 1, baseTarget));
};

export const buildMissions = (context: MissionBuildContext): Mission[] => {
  const referenceDate = context.referenceDate ?? new Date();
  const dailyKey = format(referenceDate, 'yyyy-MM-dd');
  const weeklyKey = format(referenceDate, "RRRR-'W'II");
  const completedLessons = context.lessons.filter((lesson) => lesson.completed).length;
  const claimedSet = new Set(context.profile.claimedMissionIds);
  const habitTarget = dailyHabitTarget(
    context.activeHabitsCount,
    context.profile.missionDifficulty,
  );

  const weeklyPoints =
    (context.habitStats.weeklyCompletionRate >= 65 ? 1 : 0) +
    (context.financeSummary.savingsRate >=
    (context.profile.missionDifficulty === 3 ? 10 : 0)
      ? 1
      : 0) +
    (completedLessons >= (context.profile.missionDifficulty >= 2 ? 2 : 1) ? 1 : 0);

  const missions: Mission[] = [
    {
      id: `daily_habits_${dailyKey}`,
      cycle: 'daily',
      title: 'Rutina del dia',
      description: `Completa ${habitTarget} habito(s) hoy.`,
      current: context.habitStats.todayCompleted,
      target: habitTarget,
      rewardXp: 24,
      rewardCoins: 4,
      rewardDimension: 'discipline',
      completed: context.habitStats.todayCompleted >= habitTarget,
      claimed: claimedSet.has(`daily_habits_${dailyKey}`),
    },
    {
      id: `daily_finance_${dailyKey}`,
      cycle: 'daily',
      title: 'Dia financiero estable',
      description: 'Mantener balance mensual en cero o positivo.',
      current: context.financeSummary.balance >= 0 ? 1 : 0,
      target: 1,
      rewardXp: 16,
      rewardCoins: 3,
      rewardDimension: 'finance',
      completed: context.financeSummary.balance >= 0,
      claimed: claimedSet.has(`daily_finance_${dailyKey}`),
    },
    {
      id: `weekly_combo_${weeklyKey}`,
      cycle: 'weekly',
      title: 'Combo de progreso',
      description: 'Cumple 2 de 3 frentes: habitos, ahorro y aprendizaje.',
      current: weeklyPoints,
      target: 2,
      rewardXp: 48,
      rewardCoins: 8,
      rewardDimension: 'learning',
      completed: weeklyPoints >= 2,
      claimed: claimedSet.has(`weekly_combo_${weeklyKey}`),
    },
  ];

  return missions;
};

export const findUnclaimedCompletedMissions = (missions: Mission[]): Mission[] => {
  return missions.filter((mission) => mission.completed && !mission.claimed);
};

