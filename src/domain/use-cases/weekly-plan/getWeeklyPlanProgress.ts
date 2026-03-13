import { clamp } from '../../../shared/utils/formatters';
import { toWeekDateRange } from '../../../shared/utils/date';
import type { WeeklyPlanProgress } from '../../entities/WeeklyPlan';
import type { FinanceRepository } from '../../repositories/FinanceRepository';
import type { HabitRepository } from '../../repositories/HabitRepository';
import type { WeeklyPlanRepository } from '../../repositories/WeeklyPlanRepository';

interface Deps {
  weeklyPlanRepository: WeeklyPlanRepository;
  habitRepository: HabitRepository;
  financeRepository: FinanceRepository;
}

const resolveStatus = (input: {
  habitTarget: number;
  completedHabits: number;
  savingsTarget: number;
  currentSavings: number;
  habitProgressRate: number;
  savingsProgressRate: number;
}): WeeklyPlanProgress['status'] => {
  if (input.habitTarget <= 0 && input.savingsTarget <= 0) {
    return 'unplanned';
  }

  const habitGoalReached =
    input.habitTarget <= 0 || input.completedHabits >= input.habitTarget;
  const savingsGoalReached =
    input.savingsTarget <= 0 || input.currentSavings >= input.savingsTarget;

  if (habitGoalReached && savingsGoalReached) {
    return 'achieved';
  }

  const habitOnTrack = input.habitTarget <= 0 || input.habitProgressRate >= 60;
  const savingsOnTrack =
    input.savingsTarget <= 0 || input.savingsProgressRate >= 60;

  if (habitOnTrack && savingsOnTrack) {
    return 'on_track';
  }

  return 'at_risk';
};

export const getWeeklyPlanProgressUseCase = async (
  deps: Deps,
  referenceDate = new Date(),
): Promise<WeeklyPlanProgress> => {
  const plan = await deps.weeklyPlanRepository.getWeeklyPlan(referenceDate);
  const weekRange = toWeekDateRange(referenceDate);

  const [completedHabits, incomes, expenses] = await Promise.all([
    deps.habitRepository.countCompletionsByDateRange(
      weekRange.dateFrom,
      weekRange.dateTo,
    ),
    deps.financeRepository.listIncomesByDateRange(
      weekRange.dateFrom,
      weekRange.dateTo,
    ),
    deps.financeRepository.listExpensesByDateRange(
      weekRange.dateFrom,
      weekRange.dateTo,
    ),
  ]);

  const incomesTotal = incomes.reduce((acc, row) => acc + row.amount, 0);
  const expensesTotal = expenses.reduce((acc, row) => acc + row.amount, 0);
  const currentSavings = incomesTotal - expensesTotal;

  const habitProgressRate =
    plan.habitTarget <= 0
      ? 0
      : clamp((completedHabits / plan.habitTarget) * 100, 0, 999);
  const savingsProgressRate =
    plan.savingsTarget <= 0
      ? 0
      : clamp((currentSavings / plan.savingsTarget) * 100, -999, 999);

  return {
    weekKey: plan.weekKey,
    dateFrom: weekRange.dateFrom,
    dateTo: weekRange.dateTo,
    habitTarget: plan.habitTarget,
    completedHabits,
    habitProgressRate,
    savingsTarget: plan.savingsTarget,
    currentSavings,
    savingsProgressRate,
    status: resolveStatus({
      habitTarget: plan.habitTarget,
      completedHabits,
      savingsTarget: plan.savingsTarget,
      currentSavings,
      habitProgressRate,
      savingsProgressRate,
    }),
  };
};
