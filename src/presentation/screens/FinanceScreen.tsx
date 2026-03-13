import { startOfMonth, startOfWeek, subDays } from 'date-fns';
import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { ExpenseCategory } from '../../domain/entities/Finance';
import { useAppStore } from '../../application/stores/useAppStore';
import { ScreenContainer } from '../components/ScreenContainer';
import { StatCard } from '../components/StatCard';
import { colors, radius, spacing } from '../../shared/theme/tokens';
import { formatCurrency } from '../../shared/utils/formatters';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { SectionCard } from '../components/SectionCard';
import { EmptyState } from '../components/EmptyState';
import {
  budgetSchema,
  expenseSchema,
  getValidationMessage,
  incomeSchema,
} from '../../application/validation/schemas';
import { useUiStore } from '../stores/useUiStore';
import { ProgressBar } from '../components/ProgressBar';
import { toIsoDate } from '../../shared/utils/date';
import {
  buildMovementTotals,
  filterMovementsByDateRange,
  validateDateRange,
} from '../../application/services/financeFilters';

const expenseCategories: ExpenseCategory[] = ['fixed', 'variable', 'services'];
type RangePreset = 'today' | 'week' | '7d' | '30d' | 'month' | 'custom';

export const FinanceScreen = () => {
  const profile = useAppStore((state) => state.profile);
  const financeSummary = useAppStore((state) => state.financeSummary);
  const budgetProgress = useAppStore((state) => state.budgetProgress);
  const recentExpenses = useAppStore((state) => state.recentExpenses);
  const recentIncomes = useAppStore((state) => state.recentIncomes);
  const addIncome = useAppStore((state) => state.addIncome);
  const addExpense = useAppStore((state) => state.addExpense);
  const setMonthlyBudget = useAppStore((state) => state.setMonthlyBudget);
  const showToast = useUiStore((state) => state.showToast);

  const [income, setIncome] = useState('');
  const [expense, setExpense] = useState('');
  const [subCategory, setSubCategory] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('fixed');
  const [budgetCategory, setBudgetCategory] = useState<ExpenseCategory>('fixed');
  const [budgetAmount, setBudgetAmount] = useState('');
  const [dateFrom, setDateFrom] = useState(() => toIsoDate(subDays(new Date(), 29)));
  const [dateTo, setDateTo] = useState(() => toIsoDate(new Date()));
  const [rangePreset, setRangePreset] = useState<RangePreset>('30d');
  const [isSavingIncome, setIsSavingIncome] = useState(false);
  const [isSavingExpense, setIsSavingExpense] = useState(false);
  const [isSavingBudget, setIsSavingBudget] = useState(false);

  const currency = profile?.currency ?? 'COP';

  const savingsStatus = useMemo(() => {
    if (financeSummary.savingsRate >= 20) {
      return { text: 'Saludable', color: colors.success };
    }
    if (financeSummary.savingsRate >= 0) {
      return { text: 'En vigilancia', color: colors.warning };
    }
    return { text: 'Riesgo', color: colors.danger };
  }, [financeSummary.savingsRate]);

  const rangeValidation = useMemo(
    () => validateDateRange(dateFrom, dateTo),
    [dateFrom, dateTo],
  );

  const filteredExpenses = useMemo(
    () => filterMovementsByDateRange(recentExpenses, dateFrom, dateTo),
    [recentExpenses, dateFrom, dateTo],
  );

  const filteredIncomes = useMemo(
    () => filterMovementsByDateRange(recentIncomes, dateFrom, dateTo),
    [recentIncomes, dateFrom, dateTo],
  );

  const movementTotals = useMemo(
    () => buildMovementTotals(filteredIncomes, filteredExpenses),
    [filteredIncomes, filteredExpenses],
  );

  const onApplyDaysRange = (days: number) => {
    const endDate = new Date();
    setDateTo(toIsoDate(endDate));
    setDateFrom(toIsoDate(subDays(endDate, days - 1)));
    setRangePreset(days === 7 ? '7d' : '30d');
  };

  const onApplyCurrentMonth = () => {
    const endDate = new Date();
    setDateTo(toIsoDate(endDate));
    setDateFrom(toIsoDate(startOfMonth(endDate)));
    setRangePreset('month');
  };

  const onApplyToday = () => {
    const current = toIsoDate(new Date());
    setDateFrom(current);
    setDateTo(current);
    setRangePreset('today');
  };

  const onApplyCurrentWeek = () => {
    const endDate = new Date();
    setDateTo(toIsoDate(endDate));
    setDateFrom(toIsoDate(startOfWeek(endDate, { weekStartsOn: 1 })));
    setRangePreset('week');
  };

  const onChangeFrom = (value: string) => {
    setDateFrom(value);
    setRangePreset('custom');
  };

  const onChangeTo = (value: string) => {
    setDateTo(value);
    setRangePreset('custom');
  };

  const onAddIncome = async () => {
    const result = incomeSchema.safeParse({
      amount: income,
    });

    if (!result.success) {
      showToast(getValidationMessage(result.error), 'error');
      return;
    }

    setIsSavingIncome(true);
    try {
      await addIncome(result.data.amount);
      setIncome('');
      showToast('Ingreso registrado.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo agregar ingreso.',
        'error',
      );
    } finally {
      setIsSavingIncome(false);
    }
  };

  const onAddExpense = async () => {
    const result = expenseSchema.safeParse({
      amount: expense,
      category,
      subCategory,
    });

    if (!result.success) {
      showToast(getValidationMessage(result.error), 'error');
      return;
    }

    setIsSavingExpense(true);
    try {
      await addExpense(result.data.amount, result.data.category, result.data.subCategory);
      setExpense('');
      setSubCategory('');
      showToast('Gasto registrado.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo agregar gasto.',
        'error',
      );
    } finally {
      setIsSavingExpense(false);
    }
  };

  const onSaveBudget = async () => {
    const result = budgetSchema.safeParse({
      category: budgetCategory,
      amount: budgetAmount,
    });
    if (!result.success) {
      showToast(getValidationMessage(result.error), 'error');
      return;
    }

    setIsSavingBudget(true);
    try {
      await setMonthlyBudget(result.data.category, result.data.amount);
      setBudgetAmount('');
      showToast('Presupuesto mensual actualizado.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo guardar presupuesto.',
        'error',
      );
    } finally {
      setIsSavingBudget(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Finanzas</Text>
        <Text style={styles.subtitle}>Tu panel mensual simplificado</Text>
      </View>

      <StatCard
        label="Ingresos del mes"
        value={formatCurrency(financeSummary.income, currency)}
      />
      <StatCard
        label="Gastos del mes"
        value={formatCurrency(financeSummary.expenses, currency)}
      />
      <StatCard
        label="Balance actual"
        value={formatCurrency(financeSummary.balance, currency)}
        helper={`Ahorro: ${financeSummary.savingsRate.toFixed(1)}%`}
      />

      <View style={styles.statusBox}>
        <Text style={styles.statusLabel}>Estado financiero</Text>
        <Text style={[styles.statusText, { color: savingsStatus.color }]}>
          {savingsStatus.text}
        </Text>
      </View>

      <SectionCard title="Filtro de movimientos por fecha">
        <View style={styles.row}>
          <AppInput
            label="Desde"
            placeholder="YYYY-MM-DD"
            value={dateFrom}
            onChangeText={onChangeFrom}
            style={styles.dateInput}
          />
          <AppInput
            label="Hasta"
            placeholder="YYYY-MM-DD"
            value={dateTo}
            onChangeText={onChangeTo}
            style={styles.dateInput}
          />
        </View>
        <View style={styles.row}>
          <Pressable
            style={[styles.filterChip, rangePreset === 'today' && styles.filterChipSelected]}
            onPress={onApplyToday}
          >
            <Text style={[styles.filterChipText, rangePreset === 'today' && styles.filterChipTextSelected]}>
              Hoy
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, rangePreset === 'week' && styles.filterChipSelected]}
            onPress={onApplyCurrentWeek}
          >
            <Text style={[styles.filterChipText, rangePreset === 'week' && styles.filterChipTextSelected]}>
              Esta semana
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, rangePreset === '7d' && styles.filterChipSelected]}
            onPress={() => onApplyDaysRange(7)}
          >
            <Text style={[styles.filterChipText, rangePreset === '7d' && styles.filterChipTextSelected]}>
              Ultimos 7 dias
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, rangePreset === '30d' && styles.filterChipSelected]}
            onPress={() => onApplyDaysRange(30)}
          >
            <Text style={[styles.filterChipText, rangePreset === '30d' && styles.filterChipTextSelected]}>
              Ultimos 30 dias
            </Text>
          </Pressable>
          <Pressable
            style={[styles.filterChip, rangePreset === 'month' && styles.filterChipSelected]}
            onPress={onApplyCurrentMonth}
          >
            <Text style={[styles.filterChipText, rangePreset === 'month' && styles.filterChipTextSelected]}>
              Mes actual
            </Text>
          </Pressable>
        </View>
        {!rangeValidation.ok ? (
          <Text style={styles.rangeError}>{rangeValidation.message}</Text>
        ) : (
          <Text style={styles.rangeSummary}>
            En rango: ingresos {formatCurrency(movementTotals.incomesTotal, currency)} | gastos{' '}
            {formatCurrency(movementTotals.expensesTotal, currency)} | balance{' '}
            {formatCurrency(movementTotals.balance, currency)}
          </Text>
        )}
      </SectionCard>

      <SectionCard title="Registrar ingreso">
        <AppInput
          label="Monto"
          placeholder="0"
          keyboardType="numeric"
          value={income}
          onChangeText={setIncome}
        />
        <AppButton onPress={onAddIncome} loading={isSavingIncome}>
          Agregar ingreso
        </AppButton>
      </SectionCard>

      <SectionCard title="Registrar gasto">
        <AppInput
          label="Monto"
          placeholder="0"
          keyboardType="numeric"
          value={expense}
          onChangeText={setExpense}
        />
        <AppInput
          label="Subcategoria"
          placeholder="Ej: arriendo, transporte"
          value={subCategory}
          onChangeText={setSubCategory}
        />
        <View style={styles.row}>
          {expenseCategories.map((item) => (
            <Pressable
              key={item}
              style={[styles.selector, category === item && styles.selectorSelected]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.selectorText,
                  category === item && styles.selectorTextSelected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <AppButton onPress={onAddExpense} loading={isSavingExpense}>
          Agregar gasto
        </AppButton>
      </SectionCard>

      <SectionCard title="Presupuesto por categoria">
        <AppInput
          label="Monto mensual objetivo"
          placeholder="0"
          keyboardType="numeric"
          value={budgetAmount}
          onChangeText={setBudgetAmount}
        />
        <View style={styles.row}>
          {expenseCategories.map((item) => (
            <Pressable
              key={`budget-${item}`}
              style={[styles.selector, budgetCategory === item && styles.selectorSelected]}
              onPress={() => setBudgetCategory(item)}
            >
              <Text
                style={[
                  styles.selectorText,
                  budgetCategory === item && styles.selectorTextSelected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <AppButton onPress={onSaveBudget} loading={isSavingBudget}>
          Guardar presupuesto
        </AppButton>
      </SectionCard>

      <SectionCard title="Consumo del mes vs presupuesto">
        {budgetProgress.length === 0 ? (
          <EmptyState
            title="Aun no hay presupuesto por categoria"
            body="Define montos en fijo, variable o servicios para activar alertas de consumo."
          />
        ) : (
          budgetProgress.map((entry) => {
            const statusColor =
              entry.status === 'healthy'
                ? colors.success
                : entry.status === 'warning'
                  ? colors.warning
                  : colors.danger;
            const statusLabel =
              entry.status === 'healthy'
                ? 'Saludable'
                : entry.status === 'warning'
                  ? 'Cerca del limite'
                  : 'Sobrepasado';
            return (
              <View key={`progress-${entry.category}`} style={styles.budgetRow}>
                <View style={styles.budgetHeader}>
                  <Text style={styles.budgetCategory}>{entry.category}</Text>
                  <Text style={[styles.budgetStatus, { color: statusColor }]}>
                    {statusLabel}
                  </Text>
                </View>
                <ProgressBar
                  label={`${formatCurrency(entry.spent, currency)} / ${formatCurrency(
                    entry.budget,
                    currency,
                  )}`}
                  value={entry.usageRate}
                />
                <Text style={styles.budgetHelper}>
                  {entry.remaining >= 0
                    ? `Disponible: ${formatCurrency(entry.remaining, currency)}`
                    : `Exceso: ${formatCurrency(Math.abs(entry.remaining), currency)}`}
                </Text>
              </View>
            );
          })
        )}
      </SectionCard>

      <SectionCard title={`Ultimos gastos (${filteredExpenses.length})`}>
        {filteredExpenses.length === 0 ? (
          <EmptyState
            title="No hay gastos en este rango"
            body="Prueba otro rango de fechas o registra un gasto nuevo."
          />
        ) : (
          filteredExpenses.map((item) => (
            <View key={item.id} style={styles.expenseRow}>
              <View>
                <Text style={styles.expenseName}>{item.subCategory}</Text>
                <Text style={styles.expenseMeta}>
                  {item.category} - {item.recordedAt}
                </Text>
              </View>
              <Text style={styles.expenseAmount}>
                {formatCurrency(item.amount, currency)}
              </Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title={`Ultimos ingresos (${filteredIncomes.length})`}>
        {filteredIncomes.length === 0 ? (
          <EmptyState
            title="No hay ingresos en este rango"
            body="Prueba otro rango de fechas o registra un ingreso nuevo."
          />
        ) : (
          filteredIncomes.map((item) => (
            <View key={`income-${item.id}`} style={styles.expenseRow}>
              <View>
                <Text style={styles.expenseName}>
                  {item.type === 'salary' ? 'Ingreso principal' : 'Ingreso extra'}
                </Text>
                <Text style={styles.expenseMeta}>{item.recordedAt}</Text>
              </View>
              <Text style={styles.incomeAmount}>
                {formatCurrency(item.amount, currency)}
              </Text>
            </View>
          ))
        )}
      </SectionCard>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    gap: 2,
  },
  title: {
    color: colors.text,
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
  },
  statusBox: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusLabel: {
    color: colors.mutedText,
    fontWeight: '600',
  },
  statusText: {
    fontWeight: '800',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  dateInput: {
    minWidth: 130,
    flex: 1,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingVertical: 7,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
  },
  filterChipText: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  filterChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  filterChipTextSelected: {
    color: colors.primary,
  },
  rangeError: {
    color: colors.danger,
    fontSize: 12,
  },
  rangeSummary: {
    color: colors.mutedText,
    fontSize: 12,
  },
  selector: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 8,
    alignItems: 'center',
    backgroundColor: colors.surface,
  },
  selectorSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  selectorText: {
    fontSize: 12,
    color: colors.mutedText,
  },
  selectorTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  budgetRow: {
    gap: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  budgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  budgetCategory: {
    color: colors.text,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  budgetStatus: {
    fontWeight: '700',
    fontSize: 12,
  },
  budgetHelper: {
    color: colors.mutedText,
    fontSize: 12,
  },
  expenseRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  expenseName: {
    color: colors.text,
    fontWeight: '600',
  },
  expenseMeta: {
    color: colors.mutedText,
    fontSize: 12,
  },
  expenseAmount: {
    color: colors.text,
    fontWeight: '700',
  },
  incomeAmount: {
    color: colors.success,
    fontWeight: '700',
  },
});
