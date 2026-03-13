import {
  buildWeeklySummaryCsv,
} from '../../src/application/services/weeklySummaryCsv';
import type { WeeklySummary } from '../../src/application/services/weeklySummary';

describe('weeklySummaryCsv', () => {
  it('genera CSV con encabezado y campos esperados', () => {
    const summary: WeeklySummary = {
      startDate: '2026-03-06',
      endDate: '2026-03-12',
      periodLabel: '06/03 - 12/03',
      activeDays: 5,
      habitCompletionRate: 78.3,
      completedLessons: 2,
      incomesTotal: 1200000,
      expensesTotal: 800000,
      balance: 400000,
      savingsRate: 33.3,
      missionsCompleted: 2,
      missionsClaimed: 1,
      xpEarned: 120,
      coinsEarned: 18,
      coinsSpent: 5,
      headline: 'Semana en buen ritmo',
      recommendation: 'Mantener enfoque en habitos y control de gastos.',
    };

    const csv = buildWeeklySummaryCsv(summary, 'COP');
    const lines = csv.split('\n');

    expect(lines[0]).toBe('campo,valor');
    expect(csv).toContain('periodo,06/03 - 12/03');
    expect(csv).toContain('dias_activos,5');
    expect(csv).toContain('balance,400000.00');
    expect(csv).toContain('moneda,COP');
    expect(csv).toContain('titular,Semana en buen ritmo');
  });

  it('escapa comas y comillas para mantener formato CSV valido', () => {
    const summary: WeeklySummary = {
      startDate: '2026-03-06',
      endDate: '2026-03-12',
      periodLabel: '06/03 - 12/03',
      activeDays: 1,
      habitCompletionRate: 10,
      completedLessons: 0,
      incomesTotal: 0,
      expensesTotal: 0,
      balance: 0,
      savingsRate: 0,
      missionsCompleted: 0,
      missionsClaimed: 0,
      xpEarned: 0,
      coinsEarned: 0,
      coinsSpent: 0,
      headline: 'Ajuste "fino"',
      recommendation: 'Reducir gasto, revisar "suscripciones".',
    };

    const csv = buildWeeklySummaryCsv(summary, 'COP');

    expect(csv).toContain('titular,"Ajuste ""fino"""');
    expect(csv).toContain(
      'recomendacion,"Reducir gasto, revisar ""suscripciones""."',
    );
  });
});
