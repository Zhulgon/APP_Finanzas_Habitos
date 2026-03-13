import type {
  Habit,
  HabitCategory,
  HabitFrequency,
  HabitStats,
} from '../entities/Habit';

export interface CreateHabitInput {
  id: string;
  name: string;
  frequency: HabitFrequency;
  targetPerWeek: number;
  category: HabitCategory;
  createdAt: string;
}

export interface UpdateHabitInput {
  id: string;
  name: string;
  frequency: HabitFrequency;
  targetPerWeek: number;
  category: HabitCategory;
}

export interface HabitRepository {
  listActiveHabits(): Promise<Habit[]>;
  createHabit(input: CreateHabitInput): Promise<void>;
  updateHabit(input: UpdateHabitInput): Promise<boolean>;
  archiveHabit(habitId: string): Promise<boolean>;
  logCompletion(habitId: string, completedAt: string): Promise<boolean>;
  getStats(referenceDate: Date): Promise<HabitStats>;
  listCompletionDates(referenceDate: Date, lookbackDays: number): Promise<string[]>;
  countCompletionsByDateRange(dateFrom: string, dateTo: string): Promise<number>;
}
