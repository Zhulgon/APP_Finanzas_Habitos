import { buildWeeklySummaryShareText } from '../../src/application/services/weeklySummaryShare';
import type { WeeklySummary } from '../../src/application/services/weeklySummary';

describe('weeklySummaryShare', () => {
  it('genera texto legible para compartir', () => {
    const summary: WeeklySummary = {
      startDate: '2026-03-06',
      endDate: '2026-03-12',
      periodLabel: '06/03 - 12/03',
      activeDays: 4,
      habitCompletionRate: 67,
      completedLessons: 1,
      incomesTotal: 900000,
      expensesTotal: 700000,
      balance: 200000,
      savingsRate: 22.2,
      missionsCompleted: 2,
      missionsClaimed: 1,
      xpEarned: 80,
      coinsEarned: 10,
      coinsSpent: 4,
      headline: 'Semana en buen ritmo',
      recommendation: 'Mantener constancia diaria.',
    };

    const text = buildWeeklySummaryShareText(summary, 'COP');

    expect(text).toContain('Resumen semanal (06/03 - 12/03)');
    expect(text).toContain('Dias activos: 4/7');
    expect(text).toContain('Habitos: 67%');
    expect(text).toContain('Balance: 200000.00 COP');
    expect(text).toContain('Titular: Semana en buen ritmo');
  });
});
