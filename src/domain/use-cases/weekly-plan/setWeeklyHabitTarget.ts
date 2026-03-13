import type { WeeklyPlan } from '../../entities/WeeklyPlan';
import type { WeeklyPlanRepository } from '../../repositories/WeeklyPlanRepository';

const MAX_WEEKLY_HABIT_TARGET = 70;

export const setWeeklyHabitTargetUseCase = async (
  repository: WeeklyPlanRepository,
  target: number,
  referenceDate = new Date(),
): Promise<WeeklyPlan> => {
  const safeTarget = Math.trunc(target);
  if (safeTarget < 0) {
    throw new Error('La meta semanal de habitos no puede ser negativa.');
  }
  if (safeTarget > MAX_WEEKLY_HABIT_TARGET) {
    throw new Error('La meta semanal de habitos es demasiado alta.');
  }

  return repository.setWeeklyHabitTarget(referenceDate, safeTarget);
};
