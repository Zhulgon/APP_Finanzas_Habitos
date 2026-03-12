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

export interface HabitRepository {
  listActiveHabits(): Promise<Habit[]>;
  createHabit(input: CreateHabitInput): Promise<void>;
  logCompletion(habitId: string, completedAt: string): Promise<boolean>;
  getStats(referenceDate: Date): Promise<HabitStats>;
}
