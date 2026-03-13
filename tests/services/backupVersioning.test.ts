import { parseBackupPayload } from '../../src/infrastructure/repositories/web/WebBackupRepository';

const baseData = {
  profile: {
    name: 'Usuario',
    objective: 'Objetivo',
    monthlyIncome: 1000,
    monthlySavingsGoal: 200,
    currency: 'COP',
    xp: 10,
    level: 1,
    rank: 'novato' as const,
    xpByDimension: {
      discipline: 5,
      finance: 3,
      learning: 2,
    },
    coins: 2,
    streakFreezes: 1,
    lastFreezeGrantMonth: '',
    missionDifficulty: 1 as const,
    claimedMissionIds: [],
    unlockedAchievementIds: [],
    ownedAvatarItems: ['seedling'],
    rewardHistory: [],
    avatarColor: '#0f766e',
    avatarItem: 'seedling',
  },
  habits: [],
  habitLogs: [],
  incomes: [],
  expenses: [],
  budgets: [],
  lessonProgress: [],
  counters: {
    incomeId: 1,
    expenseId: 1,
  },
};

describe('backupVersioning', () => {
  it('importa payload v2 con weeklyPlans', () => {
    const parsed = parseBackupPayload({
      version: 2,
      exportedAt: '2026-03-13T10:00:00.000Z',
      exportedByVersion: '1.2.0',
      data: {
        ...baseData,
        weeklyPlans: [
          {
            weekKey: '2026-W11',
            habitTarget: 8,
            savingsTarget: 120000,
            createdAt: '2026-03-10',
            updatedAt: '2026-03-10',
          },
        ],
      },
    });

    expect(parsed.weeklyPlans.length).toBe(1);
    expect(parsed.weeklyPlans[0].weekKey).toBe('2026-W11');
  });

  it('importa payload v1 y normaliza weeklyPlans vacio', () => {
    const parsed = parseBackupPayload({
      version: 1,
      exportedAt: '2026-03-13T10:00:00.000Z',
      data: baseData,
    });

    expect(Array.isArray(parsed.weeklyPlans)).toBe(true);
    expect(parsed.weeklyPlans.length).toBe(0);
  });
});
