import type { WeeklySummary } from './weeklySummary';

export const buildWeeklySummaryShareText = (
  summary: WeeklySummary,
  currency: string,
): string => {
  return [
    `Resumen semanal (${summary.periodLabel})`,
    `Dias activos: ${summary.activeDays}/7`,
    `Habitos: ${summary.habitCompletionRate.toFixed(0)}%`,
    `Ingresos: ${summary.incomesTotal.toFixed(2)} ${currency}`,
    `Gastos: ${summary.expensesTotal.toFixed(2)} ${currency}`,
    `Balance: ${summary.balance.toFixed(2)} ${currency}`,
    `XP ganada: ${summary.xpEarned}`,
    `Monedas: +${summary.coinsEarned} / -${summary.coinsSpent}`,
    `Titular: ${summary.headline}`,
    `Recomendacion: ${summary.recommendation}`,
  ].join('\n');
};

export const copyTextToClipboard = async (text: string): Promise<void> => {
  if (!globalThis.navigator?.clipboard?.writeText) {
    throw new Error('Copiar al portapapeles solo esta disponible en web segura (HTTPS o localhost).');
  }
  await globalThis.navigator.clipboard.writeText(text);
};
