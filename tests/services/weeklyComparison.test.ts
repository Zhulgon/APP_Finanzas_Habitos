import { buildWeeklyComparison, emptyWeeklyComparison } from '../../src/application/services/weeklyComparison';
import type { RewardHistoryEntry } from '../../src/domain/entities/Profile';

describe('weeklyComparison', () => {
  it('calcula deltas y tendencia improving cuando hay mejora clara', () => {
    const rewards: RewardHistoryEntry[] = [
      {
        id: 'r1',
        createdAt: '2026-03-11T10:00:00.000Z',
        source: 'event',
        reason: 'Habito',
        xpDelta: 12,
        coinsDelta: 2,
        dimension: 'discipline',
      },
      {
        id: 'r2',
        createdAt: '2026-03-04T10:00:00.000Z',
        source: 'event',
        reason: 'Habito',
        xpDelta: 5,
        coinsDelta: 1,
        dimension: 'discipline',
      },
    ];

    const result = buildWeeklyComparison({
      current: {
        weekKey: '2026-W11',
        dateFrom: '2026-03-09',
        dateTo: '2026-03-15',
        completedHabits: 9,
        balance: 300000,
      },
      previous: {
        weekKey: '2026-W10',
        dateFrom: '2026-03-02',
        dateTo: '2026-03-08',
        completedHabits: 6,
        balance: 100000,
      },
      rewardHistory: rewards,
    });

    expect(result.current.xpEarned).toBe(12);
    expect(result.previous.xpEarned).toBe(5);
    expect(result.delta.completedHabits).toBe(3);
    expect(result.delta.balance).toBe(200000);
    expect(result.delta.xpEarned).toBe(7);
    expect(result.trend).toBe('improving');
  });

  it('calcula tendencia declining cuando los deltas van a la baja', () => {
    const result = buildWeeklyComparison({
      current: {
        weekKey: '2026-W11',
        dateFrom: '2026-03-09',
        dateTo: '2026-03-15',
        completedHabits: 2,
        balance: -50000,
      },
      previous: {
        weekKey: '2026-W10',
        dateFrom: '2026-03-02',
        dateTo: '2026-03-08',
        completedHabits: 8,
        balance: 120000,
      },
      rewardHistory: [],
    });

    expect(result.delta.completedHabits).toBe(-6);
    expect(result.delta.balance).toBe(-170000);
    expect(result.trend).toBe('declining');
  });

  it('retorna baseline vacio consistente', () => {
    const result = emptyWeeklyComparison();
    expect(result.trend).toBe('stable');
    expect(result.current.completedHabits).toBe(0);
    expect(result.previous.balance).toBe(0);
  });
});
