import type { WeeklyPlan } from '../../entities/WeeklyPlan';
import type { WeeklyPlanRepository } from '../../repositories/WeeklyPlanRepository';

const MAX_WEEKLY_SAVINGS_TARGET = 1_000_000_000;

export const setWeeklySavingsTargetUseCase = async (
  repository: WeeklyPlanRepository,
  target: number,
  referenceDate = new Date(),
): Promise<WeeklyPlan> => {
  if (target < 0) {
    throw new Error('La meta semanal de ahorro no puede ser negativa.');
  }
  if (target > MAX_WEEKLY_SAVINGS_TARGET) {
    throw new Error('La meta semanal de ahorro es demasiado alta.');
  }

  return repository.setWeeklySavingsTarget(referenceDate, target);
};
