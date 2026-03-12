import type { BudgetProgress, MonthlyFinanceSummary } from '../../domain/entities/Finance';
import type { HabitStats } from '../../domain/entities/Habit';
import type { LessonWithStatus } from '../../domain/entities/Lesson';
import type { UserProfile } from '../../domain/entities/Profile';

export type InsightTone = 'positive' | 'warning' | 'critical';

export interface ProgressInsight {
  id: string;
  title: string;
  body: string;
  tone: InsightTone;
}

export interface AchievementBadge {
  id: string;
  title: string;
  description: string;
  unlocked: boolean;
}

interface BuildInput {
  profile: UserProfile;
  habitStats: HabitStats;
  financeSummary: MonthlyFinanceSummary;
  budgetProgress: BudgetProgress[];
  lessons: LessonWithStatus[];
  activeHabitsCount: number;
}

export const buildProgressInsights = (input: BuildInput): ProgressInsight[] => {
  const insights: ProgressInsight[] = [];
  const overBudget = input.budgetProgress.filter((item) => item.status === 'over');

  if (input.habitStats.weeklyCompletionRate < 45) {
    insights.push({
      id: 'habit_low',
      title: 'Consistencia baja en habitos',
      body: 'Reduce temporalmente a 1-2 habitos clave para recuperar traccion semanal.',
      tone: 'warning',
    });
  } else {
    insights.push({
      id: 'habit_good',
      title: 'Buen ritmo de habitos',
      body: `Tu cumplimiento semanal esta en ${input.habitStats.weeklyCompletionRate.toFixed(
        0,
      )}%.`,
      tone: 'positive',
    });
  }

  if (input.financeSummary.balance < 0) {
    insights.push({
      id: 'finance_negative',
      title: 'Balance mensual negativo',
      body: 'Revisa gastos variables y servicios para volver al equilibrio cuanto antes.',
      tone: 'critical',
    });
  } else {
    insights.push({
      id: 'finance_positive',
      title: 'Balance mensual positivo',
      body: 'Vas bien. Mantener saldo positivo crea base para invertir y crecer.',
      tone: 'positive',
    });
  }

  if (overBudget.length > 0) {
    insights.push({
      id: 'budget_alert',
      title: 'Categorias sobre presupuesto',
      body: `Sobrepasadas: ${overBudget.map((item) => item.category).join(', ')}.`,
      tone: 'warning',
    });
  } else if (input.budgetProgress.some((item) => item.budget > 0)) {
    insights.push({
      id: 'budget_ok',
      title: 'Presupuestos bajo control',
      body: 'No tienes categorias excedidas este mes.',
      tone: 'positive',
    });
  }

  if (input.profile.monthlySavingsGoal > 0) {
    const goalRate = (input.financeSummary.balance / input.profile.monthlySavingsGoal) * 100;
    if (goalRate >= 100) {
      insights.push({
        id: 'goal_reached',
        title: 'Meta de ahorro alcanzada',
        body: 'Excelente. Cumpliste tu meta mensual de ahorro.',
        tone: 'positive',
      });
    } else {
      insights.push({
        id: 'goal_pending',
        title: 'Meta de ahorro en progreso',
        body: `Has completado ${Math.max(0, goalRate).toFixed(0)}% de tu meta mensual.`,
        tone: 'warning',
      });
    }
  }

  return insights.slice(0, 4);
};

export const buildAchievements = (input: BuildInput): AchievementBadge[] => {
  const completedLessons = input.lessons.filter((lesson) => lesson.completed).length;
  const hasAnyBudget = input.budgetProgress.some((item) => item.budget > 0);
  const noOverBudget = input.budgetProgress.every((item) => item.status !== 'over');

  return [
    {
      id: 'first_habit',
      title: 'Primer habito',
      description: 'Tienes al menos 1 habito activo.',
      unlocked: input.activeHabitsCount >= 1,
    },
    {
      id: 'streak_3',
      title: 'Racha de 3 dias',
      description: 'Mantener habitos por 3 dias seguidos.',
      unlocked: input.habitStats.streakDays >= 3,
    },
    {
      id: 'balance_positive',
      title: 'Mes en positivo',
      description: 'Balance mensual mayor o igual a cero.',
      unlocked: input.financeSummary.balance >= 0,
    },
    {
      id: 'lessons_3',
      title: 'Aprendiz financiero',
      description: 'Completar 3 capsulas financieras.',
      unlocked: completedLessons >= 3,
    },
    {
      id: 'budget_keeper',
      title: 'Guardian del presupuesto',
      description: 'Sin categorias sobrepasadas (con presupuesto definido).',
      unlocked: hasAnyBudget && noOverBudget,
    },
    {
      id: 'level_3',
      title: 'Nivel 3',
      description: 'Alcanzar nivel 3.',
      unlocked: input.profile.level >= 3,
    },
  ];
};
