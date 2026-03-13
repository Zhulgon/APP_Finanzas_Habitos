import { endOfWeek, format, startOfWeek } from 'date-fns';

export const toIsoDate = (date: Date): string => format(date, 'yyyy-MM-dd');

export const toMonthKey = (date: Date): string => format(date, 'yyyy-MM');

export const toWeekKey = (date: Date): string => format(date, "RRRR-'W'II");

export const toWeekDateRange = (
  referenceDate: Date,
): { dateFrom: string; dateTo: string } => {
  const weekStart = startOfWeek(referenceDate, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(referenceDate, { weekStartsOn: 1 });
  return {
    dateFrom: toIsoDate(weekStart),
    dateTo: toIsoDate(weekEnd),
  };
};
