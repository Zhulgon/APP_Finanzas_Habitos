import { buildWeeklySummary, emptyWeeklySummary } from '../../src/application/services/weeklySummary';
import type { LessonWithStatus } from '../../src/domain/entities/Lesson';
import type { RewardHistoryEntry } from '../../src/domain/entities/Profile';
import type { Mission } from '../../src/application/services/missions';

describe('weeklySummary', () => {
  const referenceDate = new Date('2026-03-12T12:00:00.000Z');

  it('calcula metricas semanales con movimientos, lecciones y recompensas', () => {
    const lessons: LessonWithStatus[] = [
      {
        id: 'l1',
        title: 'Capsula',
        summary: 'Resumen',
        content: 'Contenido',
        estimatedMinutes: 2,
        completed: true,
        completedAt: '2026-03-10',
      },
    ];
    const missions: Mission[] = [
      {
        id: 'm1',
        cycle: 'daily',
        title: 'Mision 1',
        description: 'Desc',
        current: 1,
        target: 1,
        rewardXp: 10,
        rewardCoins: 2,
        rewardDimension: 'discipline',
        completed: true,
        claimed: true,
      },
      {
        id: 'm2',
        cycle: 'weekly',
        title: 'Mision 2',
        description: 'Desc',
        current: 0,
        target: 1,
        rewardXp: 12,
        rewardCoins: 2,
        rewardDimension: 'finance',
        completed: false,
        claimed: false,
      },
    ];
    const rewardHistory: RewardHistoryEntry[] = [
      {
        id: 'r1',
        createdAt: '2026-03-11T08:00:00.000Z',
        source: 'event',
        reason: 'Habito',
        xpDelta: 9,
        coinsDelta: 2,
        dimension: 'discipline',
      },
      {
        id: 'r2',
        createdAt: '2026-03-09T08:00:00.000Z',
        source: 'shop',
        reason: 'Compra',
        xpDelta: 0,
        coinsDelta: -15,
        dimension: 'system',
      },
      {
        id: 'r-old',
        createdAt: '2026-02-28T08:00:00.000Z',
        source: 'event',
        reason: 'Fuera rango',
        xpDelta: 50,
        coinsDelta: 10,
        dimension: 'finance',
      },
    ];

    const result = buildWeeklySummary({
      referenceDate,
      habitStats: {
        activeHabitsCount: 3,
        todayCompleted: 2,
        weeklyCompletionRate: 72.5,
        streakDays: 4,
      },
      completionDates: ['2026-03-12', '2026-03-11', '2026-03-09'],
      incomes: [
        { id: 1, amount: 500000, type: 'salary', recordedAt: '2026-03-10' },
        { id: 2, amount: 100000, type: 'extra', recordedAt: '2026-03-12' },
      ],
      expenses: [
        {
          id: 1,
          amount: 200000,
          category: 'fixed',
          subCategory: 'arriendo',
          recordedAt: '2026-03-10',
        },
      ],
      lessons,
      missions,
      rewardHistory,
    });

    expect(result.activeDays).toBe(3);
    expect(result.incomesTotal).toBe(600000);
    expect(result.expensesTotal).toBe(200000);
    expect(result.balance).toBe(400000);
    expect(result.savingsRate).toBeCloseTo(66.66, 1);
    expect(result.missionsCompleted).toBe(1);
    expect(result.missionsClaimed).toBe(1);
    expect(result.completedLessons).toBe(1);
    expect(result.xpEarned).toBe(9);
    expect(result.coinsEarned).toBe(2);
    expect(result.coinsSpent).toBe(15);
    expect(result.periodLabel).toBe('06/03 - 12/03');
  });

  it('prioriza recomendacion de ajuste financiero cuando el balance semanal es negativo', () => {
    const result = buildWeeklySummary({
      referenceDate,
      habitStats: {
        activeHabitsCount: 1,
        todayCompleted: 1,
        weeklyCompletionRate: 90,
        streakDays: 7,
      },
      completionDates: ['2026-03-12', '2026-03-11', '2026-03-10', '2026-03-09'],
      incomes: [{ id: 1, amount: 100000, type: 'salary', recordedAt: '2026-03-10' }],
      expenses: [
        {
          id: 1,
          amount: 250000,
          category: 'services',
          subCategory: 'servicios',
          recordedAt: '2026-03-11',
        },
      ],
      lessons: [],
      missions: [],
      rewardHistory: [],
    });

    expect(result.headline).toBe('Ajuste financiero urgente');
    expect(result.balance).toBeLessThan(0);
  });

  it('genera estado vacio inicial consistente', () => {
    const result = emptyWeeklySummary(referenceDate);

    expect(result.startDate).toBe('2026-03-06');
    expect(result.endDate).toBe('2026-03-12');
    expect(result.activeDays).toBe(0);
    expect(result.headline).toBe('Semana por iniciar');
  });
});
