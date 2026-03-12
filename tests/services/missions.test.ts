import { buildMissions, findUnclaimedCompletedMissions } from '../../src/application/services/missions';

describe('missions', () => {
  it('genera misiones y detecta completadas no reclamadas', () => {
    const missions = buildMissions({
      profile: {
        name: 'Ana',
        objective: 'Ahorrar',
        monthlyIncome: 3000000,
        monthlySavingsGoal: 500000,
        currency: 'COP',
        xp: 220,
        level: 2,
        rank: 'novato',
        xpByDimension: {
          discipline: 50,
          finance: 80,
          learning: 30,
        },
        coins: 10,
        streakFreezes: 1,
        lastFreezeGrantMonth: '',
        missionDifficulty: 2,
        claimedMissionIds: [],
        unlockedAchievementIds: [],
        ownedAvatarItems: ['seedling'],
        rewardHistory: [],
        avatarColor: '#0f766e',
        avatarItem: 'seedling',
      },
      habitStats: {
        activeHabitsCount: 3,
        todayCompleted: 2,
        weeklyCompletionRate: 75,
        streakDays: 4,
      },
      financeSummary: {
        income: 3000000,
        expenses: 1800000,
        balance: 1200000,
        savingsRate: 40,
      },
      lessons: [
        {
          id: 'lesson_1',
          title: 'Intro',
          summary: '',
          content: '',
          estimatedMinutes: 5,
          completed: true,
        },
      ],
      activeHabitsCount: 3,
      referenceDate: new Date('2026-03-12T10:00:00.000Z'),
    });

    const claimable = findUnclaimedCompletedMissions(missions);

    expect(missions.length).toBe(3);
    expect(claimable.length).toBeGreaterThanOrEqual(1);
  });
});
