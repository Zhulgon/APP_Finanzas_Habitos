export type HabitFrequency = 'daily' | 'weekly';
export type HabitCategory = 'health' | 'productivity' | 'finance';

export interface Habit {
  id: string;
  name: string;
  frequency: HabitFrequency;
  targetPerWeek: number;
  category: HabitCategory;
  isActive: boolean;
  createdAt: string;
}

export interface HabitStats {
  activeHabitsCount: number;
  todayCompleted: number;
  weeklyCompletionRate: number;
  streakDays: number;
}
