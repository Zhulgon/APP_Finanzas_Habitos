import type { ExpenseCategory } from '../entities/Finance';

interface DomainEventBase<TType extends string, TPayload> {
  id: string;
  type: TType;
  occurredAt: string;
  payload: TPayload;
}

export type HabitCompletedEvent = DomainEventBase<
  'habit.completed',
  {
    habitId: string;
    completedAt: string;
  }
>;

export type ExpenseLoggedEvent = DomainEventBase<
  'finance.expense_logged',
  {
    amount: number;
    category: ExpenseCategory;
    subCategory: string;
    recordedAt: string;
  }
>;

export type IncomeLoggedEvent = DomainEventBase<
  'finance.income_logged',
  {
    amount: number;
    recordedAt: string;
  }
>;

export type LessonCompletedEvent = DomainEventBase<
  'lesson.completed',
  {
    lessonId: string;
    completedAt: string;
  }
>;

export type AppDomainEvent =
  | HabitCompletedEvent
  | ExpenseLoggedEvent
  | IncomeLoggedEvent
  | LessonCompletedEvent;

