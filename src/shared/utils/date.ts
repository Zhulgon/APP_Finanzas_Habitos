import { format } from 'date-fns';

export const toIsoDate = (date: Date): string => format(date, 'yyyy-MM-dd');

export const toMonthKey = (date: Date): string => format(date, 'yyyy-MM');
