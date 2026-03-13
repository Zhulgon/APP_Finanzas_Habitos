interface DatedAmount {
  amount: number;
  recordedAt: string;
}

const isoDatePattern = /^\d{4}-\d{2}-\d{2}$/;

const toDateStamp = (isoDate: string): number | null => {
  if (!isoDatePattern.test(isoDate)) {
    return null;
  }
  const date = new Date(`${isoDate}T00:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return null;
  }
  return date.getTime();
};

export const validateDateRange = (
  fromIsoDate: string,
  toIsoDate: string,
): { ok: boolean; message?: string } => {
  const fromStamp = toDateStamp(fromIsoDate);
  const toStamp = toDateStamp(toIsoDate);

  if (fromStamp === null || toStamp === null) {
    return {
      ok: false,
      message: 'Usa formato de fecha YYYY-MM-DD.',
    };
  }

  if (fromStamp > toStamp) {
    return {
      ok: false,
      message: 'La fecha inicial no puede ser mayor que la final.',
    };
  }

  return { ok: true };
};

export const filterMovementsByDateRange = <T extends DatedAmount>(
  movements: T[],
  fromIsoDate: string,
  toIsoDate: string,
): T[] => {
  const validation = validateDateRange(fromIsoDate, toIsoDate);
  if (!validation.ok) {
    return movements;
  }

  return movements.filter((movement) => {
    return movement.recordedAt >= fromIsoDate && movement.recordedAt <= toIsoDate;
  });
};

export const buildMovementTotals = (
  incomes: DatedAmount[],
  expenses: DatedAmount[],
): {
  incomesTotal: number;
  expensesTotal: number;
  balance: number;
} => {
  const incomesTotal = incomes.reduce((acc, item) => acc + item.amount, 0);
  const expensesTotal = expenses.reduce((acc, item) => acc + item.amount, 0);

  return {
    incomesTotal,
    expensesTotal,
    balance: incomesTotal - expensesTotal,
  };
};

