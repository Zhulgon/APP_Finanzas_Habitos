export interface Lesson {
  id: string;
  title: string;
  summary: string;
  content: string;
  estimatedMinutes: number;
}

export interface LessonWithStatus extends Lesson {
  completed: boolean;
  completedAt?: string;
}
