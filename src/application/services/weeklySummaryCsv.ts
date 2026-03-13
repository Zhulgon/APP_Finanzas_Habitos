import type { WeeklySummary } from './weeklySummary';

const WEEKLY_CSV_PREFIX = 'resumen-semanal-habitos-finanzas';

const csvEscape = (value: string | number): string => {
  const text = String(value);
  if (!text.includes(',') && !text.includes('"') && !text.includes('\n')) {
    return text;
  }
  return `"${text.replaceAll('"', '""')}"`;
};

const formatTimestamp = (date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
};

export const buildWeeklySummaryCsv = (
  summary: WeeklySummary,
  currency: string,
): string => {
  const rows: Array<[string, string | number]> = [
    ['periodo', summary.periodLabel],
    ['fecha_inicio', summary.startDate],
    ['fecha_fin', summary.endDate],
    ['dias_activos', summary.activeDays],
    ['cumplimiento_habitos_pct', summary.habitCompletionRate.toFixed(1)],
    ['lecciones_completadas', summary.completedLessons],
    ['ingresos_totales', summary.incomesTotal.toFixed(2)],
    ['gastos_totales', summary.expensesTotal.toFixed(2)],
    ['balance', summary.balance.toFixed(2)],
    ['tasa_ahorro_pct', summary.savingsRate.toFixed(1)],
    ['misiones_completadas', summary.missionsCompleted],
    ['misiones_reclamadas', summary.missionsClaimed],
    ['xp_ganada', summary.xpEarned],
    ['monedas_ganadas', summary.coinsEarned],
    ['monedas_gastadas', summary.coinsSpent],
    ['moneda', currency],
    ['titular', summary.headline],
    ['recomendacion', summary.recommendation],
  ];

  const csvRows = rows.map(([field, value]) => `${csvEscape(field)},${csvEscape(value)}`);
  return ['campo,valor', ...csvRows].join('\n');
};

export const downloadWeeklySummaryCsv = async (
  csvContent: string,
  referenceDate = new Date(),
): Promise<void> => {
  if (
    !globalThis.document?.createElement ||
    !globalThis.URL?.createObjectURL ||
    typeof Blob === 'undefined'
  ) {
    throw new Error('La exportacion CSV esta disponible en web.');
  }

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = globalThis.URL.createObjectURL(blob);
  const anchor = globalThis.document.createElement('a');
  anchor.href = url;
  anchor.download = `${WEEKLY_CSV_PREFIX}-${formatTimestamp(referenceDate)}.csv`;
  globalThis.document.body.appendChild(anchor);
  anchor.click();
  globalThis.document.body.removeChild(anchor);
  globalThis.URL.revokeObjectURL(url);
};
