import type { MonthlyFinanceSummary } from '../../domain/entities/Finance';
import type { HabitStats } from '../../domain/entities/Habit';
import type { LessonWithStatus } from '../../domain/entities/Lesson';
import type { WeeklyPlanProgress } from '../../domain/entities/WeeklyPlan';
import type { WeeklyComparison } from './weeklyComparison';
import { toIsoDate } from '../../shared/utils/date';

export type RecommendationPriority = 'high' | 'medium' | 'low';
export type RecommendationCategory =
  | 'consistency'
  | 'finance'
  | 'learning'
  | 'weekly_plan';

export interface RecommendationV2 {
  id: string;
  priority: RecommendationPriority;
  category: RecommendationCategory;
  title: string;
  body: string;
  actionLabel: string;
}

interface BuildRecommendationsV2Input {
  habitStats: HabitStats;
  financeSummary: MonthlyFinanceSummary;
  weeklyPlanProgress: WeeklyPlanProgress;
  weeklyComparison: WeeklyComparison;
  recentFinanceMovementToday: boolean;
  lessons: LessonWithStatus[];
  referenceDate?: Date;
}

const priorityScore: Record<RecommendationPriority, number> = {
  high: 3,
  medium: 2,
  low: 1,
};

export const buildRecommendationsV2 = (
  input: BuildRecommendationsV2Input,
): RecommendationV2[] => {
  const result: RecommendationV2[] = [];
  const todayIso = toIsoDate(input.referenceDate ?? new Date());
  const completedLessonToday = input.lessons.some(
    (lesson) => lesson.completedAt === todayIso,
  );

  if (input.weeklyPlanProgress.status === 'at_risk') {
    result.push({
      id: 'rec_weekly_plan_recover',
      priority: 'high',
      category: 'weekly_plan',
      title: 'Plan semanal en riesgo',
      body: 'Tu avance de habitos o ahorro va por debajo de lo esperado. Ajusta hoy para recuperar ritmo.',
      actionLabel: 'Revisar plan semanal',
    });
  }

  if (input.financeSummary.balance < 0) {
    result.push({
      id: 'rec_negative_balance',
      priority: 'high',
      category: 'finance',
      title: 'Balance mensual negativo',
      body: 'Tus gastos superan ingresos. Registra y reduce gastos variables esta semana.',
      actionLabel: 'Registrar gasto consciente',
    });
  }

  if (input.habitStats.todayCompleted < input.habitStats.activeHabitsCount) {
    result.push({
      id: 'rec_pending_habits',
      priority: 'medium',
      category: 'consistency',
      title: 'Habitos pendientes hoy',
      body: `Llevas ${input.habitStats.todayCompleted}/${input.habitStats.activeHabitsCount}. Completar al menos uno mas mantiene consistencia.`,
      actionLabel: 'Completar habito',
    });
  }

  if (!input.recentFinanceMovementToday) {
    result.push({
      id: 'rec_missing_finance_log',
      priority: 'medium',
      category: 'finance',
      title: 'Sin registro financiero hoy',
      body: 'Registrar un movimiento diario mejora precision de tu balance semanal.',
      actionLabel: 'Registrar movimiento',
    });
  }

  if (!completedLessonToday) {
    result.push({
      id: 'rec_learning_capsule',
      priority: 'low',
      category: 'learning',
      title: 'Micro aprendizaje pendiente',
      body: 'Completa una capsula de 2 minutos para reforzar decisiones financieras.',
      actionLabel: 'Abrir Aprender',
    });
  }

  if (input.weeklyComparison.trend === 'declining') {
    result.push({
      id: 'rec_weekly_decline',
      priority: 'high',
      category: 'weekly_plan',
      title: 'Comparativo semanal en retroceso',
      body: 'Esta semana va por debajo de la anterior. Prioriza una accion de alto impacto hoy.',
      actionLabel: 'Ver comparativo',
    });
  }

  if (input.weeklyComparison.trend === 'improving') {
    result.push({
      id: 'rec_weekly_improving',
      priority: 'low',
      category: 'consistency',
      title: 'Buen avance semanal',
      body: 'Vas mejor que la semana pasada. Mantener el mismo patron es la prioridad.',
      actionLabel: 'Mantener ritmo',
    });
  }

  return result
    .sort((a, b) => priorityScore[b.priority] - priorityScore[a.priority])
    .slice(0, 4);
};
