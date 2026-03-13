export type LessonPillar =
  | 'mindset'
  | 'cashflow'
  | 'budget'
  | 'safety'
  | 'investing'
  | 'debt';

export interface Lesson {
  id: string;
  title: string;
  summary: string;
  content: string;
  estimatedMinutes: number;
  dayOrder?: number;
  pillar?: LessonPillar;
  inspiredBy?: string;
}

export interface LessonWithStatus extends Lesson {
  completed: boolean;
  completedAt?: string;
  availableToday?: boolean;
  lockedReason?: string;
}
