import { buildRecommendationsV2 } from '../../src/application/services/recommendationEngineV2';
import { emptyWeeklyComparison } from '../../src/application/services/weeklyComparison';

describe('recommendationEngineV2', () => {
  it('prioriza recomendaciones high cuando hay riesgo financiero y semanal', () => {
    const recommendations = buildRecommendationsV2({
      habitStats: {
        activeHabitsCount: 4,
        todayCompleted: 1,
        weeklyCompletionRate: 30,
        streakDays: 2,
      },
      financeSummary: {
        income: 1000000,
        expenses: 1200000,
        balance: -200000,
        savingsRate: -20,
      },
      weeklyPlanProgress: {
        weekKey: '2026-W11',
        dateFrom: '2026-03-09',
        dateTo: '2026-03-15',
        habitTarget: 10,
        completedHabits: 3,
        habitProgressRate: 30,
        savingsTarget: 200000,
        currentSavings: -50000,
        savingsProgressRate: -25,
        status: 'at_risk',
      },
      weeklyComparison: {
        ...emptyWeeklyComparison(),
        trend: 'declining',
      },
      recentFinanceMovementToday: false,
      lessons: [],
      referenceDate: new Date('2026-03-12T10:00:00.000Z'),
    });

    expect(recommendations.length).toBeGreaterThan(0);
    expect(recommendations[0].priority).toBe('high');
    expect(recommendations.some((item) => item.id === 'rec_negative_balance')).toBe(
      true,
    );
    expect(recommendations.some((item) => item.id === 'rec_weekly_decline')).toBe(
      true,
    );
  });

  it('devuelve recomendaciones de mantenimiento cuando el trend mejora', () => {
    const recommendations = buildRecommendationsV2({
      habitStats: {
        activeHabitsCount: 2,
        todayCompleted: 2,
        weeklyCompletionRate: 90,
        streakDays: 8,
      },
      financeSummary: {
        income: 2000000,
        expenses: 1200000,
        balance: 800000,
        savingsRate: 40,
      },
      weeklyPlanProgress: {
        weekKey: '2026-W11',
        dateFrom: '2026-03-09',
        dateTo: '2026-03-15',
        habitTarget: 6,
        completedHabits: 6,
        habitProgressRate: 100,
        savingsTarget: 200000,
        currentSavings: 800000,
        savingsProgressRate: 400,
        status: 'achieved',
      },
      weeklyComparison: {
        ...emptyWeeklyComparison(),
        trend: 'improving',
      },
      recentFinanceMovementToday: true,
      lessons: [
        {
          id: 'l1',
          title: 'Capsula',
          summary: 'S',
          content: 'C',
          estimatedMinutes: 2,
          completed: true,
          completedAt: '2026-03-12',
        },
      ],
      referenceDate: new Date('2026-03-12T10:00:00.000Z'),
    });

    expect(recommendations.some((item) => item.id === 'rec_weekly_improving')).toBe(
      true,
    );
  });
});
