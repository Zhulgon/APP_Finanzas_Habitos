import { buildAchievementsWithSpecifications } from '../../src/application/services/achievementSpecifications';

describe('achievement specifications', () => {
  it('retorna logros nuevos cuando cumplen condiciones', () => {
    const result = buildAchievementsWithSpecifications({
      profile: {
        name: 'Ana',
        objective: 'Ahorrar',
        monthlyIncome: 3000000,
        monthlySavingsGoal: 500000,
        currency: 'COP',
        xp: 520,
        level: 5,
        rank: 'constante',
        xpByDimension: {
          discipline: 120,
          finance: 160,
          learning: 90,
        },
        coins: 22,
        streakFreezes: 1,
        lastFreezeGrantMonth: '',
        missionDifficulty: 2,
        claimedMissionIds: [],
        unlockedAchievementIds: ['first_habit'],
        ownedAvatarItems: ['seedling'],
        avatarColor: '#0f766e',
        avatarItem: 'seedling',
      },
      habitStats: {
        activeHabitsCount: 2,
        todayCompleted: 2,
        weeklyCompletionRate: 78,
        streakDays: 5,
      },
      financeSummary: {
        income: 3000000,
        expenses: 1200000,
        balance: 1800000,
        savingsRate: 60,
      },
      budgetProgress: [
        {
          category: 'fixed',
          budget: 1000000,
          spent: 750000,
          remaining: 250000,
          usageRate: 75,
          status: 'healthy',
        },
      ],
      lessons: [
        {
          id: 'lesson_1',
          title: 'Intro',
          summary: '',
          content: '',
          estimatedMinutes: 5,
          completed: true,
        },
        {
          id: 'lesson_2',
          title: 'Presupuesto',
          summary: '',
          content: '',
          estimatedMinutes: 5,
          completed: true,
        },
        {
          id: 'lesson_3',
          title: 'Ahorro',
          summary: '',
          content: '',
          estimatedMinutes: 5,
          completed: true,
        },
      ],
      activeHabitsCount: 2,
    });

    expect(result.badges.some((item) => item.id === 'first_habit' && item.unlocked)).toBe(
      true,
    );
    expect(result.newlyUnlockedIds.length).toBeGreaterThan(0);
  });
});
