import {
  buildMovementTotals,
  filterMovementsByDateRange,
  validateDateRange,
} from '../../src/application/services/financeFilters';

describe('financeFilters', () => {
  it('valida rango de fechas en formato ISO', () => {
    expect(validateDateRange('2026-03-01', '2026-03-31').ok).toBe(true);
    expect(validateDateRange('2026/03/01', '2026-03-31').ok).toBe(false);
    expect(validateDateRange('2026-03-31', '2026-03-01').ok).toBe(false);
  });

  it('filtra movimientos por rango inclusivo', () => {
    const movements = [
      { amount: 100, recordedAt: '2026-03-01' },
      { amount: 200, recordedAt: '2026-03-10' },
      { amount: 300, recordedAt: '2026-03-20' },
    ];

    const filtered = filterMovementsByDateRange(
      movements,
      '2026-03-05',
      '2026-03-20',
    );

    expect(filtered).toHaveLength(2);
    expect(filtered[0].amount).toBe(200);
    expect(filtered[1].amount).toBe(300);
  });

  it('calcula totales de ingresos y gastos', () => {
    const totals = buildMovementTotals(
      [
        { amount: 1200, recordedAt: '2026-03-01' },
        { amount: 300, recordedAt: '2026-03-02' },
      ],
      [
        { amount: 400, recordedAt: '2026-03-03' },
        { amount: 150, recordedAt: '2026-03-04' },
      ],
    );

    expect(totals.incomesTotal).toBe(1500);
    expect(totals.expensesTotal).toBe(550);
    expect(totals.balance).toBe(950);
  });
});

