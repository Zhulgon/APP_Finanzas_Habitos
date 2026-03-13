import type { BudgetProgress, MonthlyFinanceSummary } from '../../domain/entities/Finance';
import type { HabitStats } from '../../domain/entities/Habit';
import type { LessonWithStatus } from '../../domain/entities/Lesson';
import type { UserProfile } from '../../domain/entities/Profile';
import type { AchievementBadge } from './progressInsights';

export interface AchievementContext {
  profile: UserProfile;
  habitStats: HabitStats;
  financeSummary: MonthlyFinanceSummary;
  budgetProgress: BudgetProgress[];
  lessons: LessonWithStatus[];
  activeHabitsCount: number;
}

interface AchievementSpecification {
  id: string;
  title: string;
  description: string;
  isSatisfied: (context: AchievementContext) => boolean;
}

const achievementSpecifications: AchievementSpecification[] = [
  {
    id: 'first_habit',
    title: 'Primer habito',
    description: 'Tienes al menos 1 habito activo.',
    isSatisfied: (context) => context.activeHabitsCount >= 1,
  },
  {
    id: 'streak_3',
    title: 'Racha de 3 dias',
    description: 'Mantener habitos por 3 dias seguidos.',
    isSatisfied: (context) => context.habitStats.streakDays >= 3,
  },
  {
    id: 'balance_positive',
    title: 'Mes en positivo',
    description: 'Balance mensual mayor o igual a cero.',
    isSatisfied: (context) => context.financeSummary.balance >= 0,
  },
  {
    id: 'lessons_3',
    title: 'Aprendiz financiero',
    description: 'Completar 3 capsulas financieras.',
    isSatisfied: (context) =>
      context.lessons.filter((lesson) => lesson.completed).length >= 3,
  },
  {
    id: 'budget_keeper',
    title: 'Guardian del presupuesto',
    description: 'Sin categorias sobrepasadas (con presupuesto definido).',
    isSatisfied: (context) => {
      const hasAnyBudget = context.budgetProgress.some((item) => item.budget > 0);
      const noOverBudget = context.budgetProgress.every(
        (item) => item.status !== 'over',
      );
      return hasAnyBudget && noOverBudget;
    },
  },
  {
    id: 'rank_constante',
    title: 'Rango Constante',
    description: 'Alcanzar el rango Constante.',
    isSatisfied: (context) =>
      context.profile.rank === 'constante' ||
      context.profile.rank === 'estratega' ||
      context.profile.rank === 'maestro',
  },
];

export const buildAchievementsWithSpecifications = (
  context: AchievementContext,
): {
  badges: AchievementBadge[];
  newlyUnlockedIds: string[];
} => {
  const alreadyUnlocked = new Set(context.profile.unlockedAchievementIds);
  const newlyUnlockedIds: string[] = [];

  const badges = achievementSpecifications.map((spec) => {
    const unlockedNow = spec.isSatisfied(context);
    const unlocked = alreadyUnlocked.has(spec.id) || unlockedNow;

    if (unlockedNow && !alreadyUnlocked.has(spec.id)) {
      newlyUnlockedIds.push(spec.id);
    }

    return {
      id: spec.id,
      title: spec.title,
      description: spec.description,
      unlocked,
    };
  });

  return {
    badges,
    newlyUnlockedIds,
  };
};

