import { endOfWeek, startOfWeek, subDays } from 'date-fns';
import type { Habit, HabitStats } from '../../../domain/entities/Habit';
import type {
  CreateHabitInput,
  HabitRepository,
  UpdateHabitInput,
} from '../../../domain/repositories/HabitRepository';
import { toIsoDate } from '../../../shared/utils/date';
import { clamp } from '../../../shared/utils/formatters';
import { readWebState, updateWebState } from './storage';

export class WebHabitRepository implements HabitRepository {
  async listActiveHabits(): Promise<Habit[]> {
    const state = readWebState();
    return state.habits.filter((habit) => habit.isActive);
  }

  async createHabit(input: CreateHabitInput): Promise<void> {
    updateWebState((state) => ({
      ...state,
      habits: [
        {
          id: input.id,
          name: input.name,
          frequency: input.frequency,
          targetPerWeek: input.targetPerWeek,
          category: input.category,
          isActive: true,
          createdAt: input.createdAt,
        },
        ...state.habits,
      ],
    }));
  }

  async updateHabit(input: UpdateHabitInput): Promise<boolean> {
    let wasUpdated = false;
    updateWebState((state) => {
      const nextHabits = state.habits.map((habit) => {
        if (habit.id !== input.id || !habit.isActive) {
          return habit;
        }
        wasUpdated = true;
        return {
          ...habit,
          name: input.name,
          frequency: input.frequency,
          targetPerWeek: input.targetPerWeek,
          category: input.category,
        };
      });

      if (!wasUpdated) {
        return state;
      }

      return {
        ...state,
        habits: nextHabits,
      };
    });

    return wasUpdated;
  }

  async archiveHabit(habitId: string): Promise<boolean> {
    let wasArchived = false;
    updateWebState((state) => {
      const nextHabits = state.habits.map((habit) => {
        if (habit.id !== habitId || !habit.isActive) {
          return habit;
        }
        wasArchived = true;
        return {
          ...habit,
          isActive: false,
        };
      });

      if (!wasArchived) {
        return state;
      }

      return {
        ...state,
        habits: nextHabits,
      };
    });

    return wasArchived;
  }

  async logCompletion(habitId: string, completedAt: string): Promise<boolean> {
    let inserted = false;
    updateWebState((state) => {
      const already = state.habitLogs.some(
        (log) => log.habitId === habitId && log.completedAt === completedAt,
      );
      if (already) {
        inserted = false;
        return state;
      }
      inserted = true;
      return {
        ...state,
        habitLogs: [...state.habitLogs, { habitId, completedAt }],
      };
    });
    return inserted;
  }

  async getStats(referenceDate: Date): Promise<HabitStats> {
    const state = readWebState();
    const activeHabits = state.habits.filter((habit) => habit.isActive);
    const today = toIsoDate(referenceDate);
    const weekStart = toIsoDate(
      startOfWeek(referenceDate, { weekStartsOn: 1 }),
    );
    const weekEnd = toIsoDate(endOfWeek(referenceDate, { weekStartsOn: 1 }));

    const todayCompleted = new Set(
      state.habitLogs
        .filter((log) => log.completedAt === today)
        .map((log) => log.habitId),
    ).size;

    const weekCompletions = state.habitLogs.filter(
      (log) => log.completedAt >= weekStart && log.completedAt <= weekEnd,
    ).length;

    const weeklyTarget = activeHabits.reduce(
      (acc, habit) => acc + habit.targetPerWeek,
      0,
    );
    const weeklyCompletionRate =
      weeklyTarget === 0
        ? 0
        : clamp((weekCompletions / weeklyTarget) * 100, 0, 100);

    const completionDaySet = new Set(
      state.habitLogs
        .map((log) => log.completedAt)
        .sort((a, b) => (a < b ? 1 : -1)),
    );

    let streakDays = 0;
    let cursor = referenceDate;
    while (completionDaySet.has(toIsoDate(cursor))) {
      streakDays += 1;
      cursor = subDays(cursor, 1);
    }

    return {
      activeHabitsCount: activeHabits.length,
      todayCompleted,
      weeklyCompletionRate,
      streakDays,
    };
  }

  async listCompletionDates(referenceDate: Date, lookbackDays: number): Promise<string[]> {
    const safeLookbackDays = Math.max(1, lookbackDays);
    const state = readWebState();
    const lowerBound = toIsoDate(subDays(referenceDate, safeLookbackDays));

    const uniqueDays = new Set(
      state.habitLogs
        .filter((log) => log.completedAt >= lowerBound)
        .map((log) => log.completedAt),
    );

    return Array.from(uniqueDays).sort((a, b) => (a < b ? 1 : -1));
  }

  async countCompletionsByDateRange(dateFrom: string, dateTo: string): Promise<number> {
    const state = readWebState();
    return state.habitLogs.filter(
      (log) => log.completedAt >= dateFrom && log.completedAt <= dateTo,
    ).length;
  }
}
