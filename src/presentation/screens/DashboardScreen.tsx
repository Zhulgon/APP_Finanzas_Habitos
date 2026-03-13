import { useEffect, useState } from 'react';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MainTabParamList } from '../../app/navigation/MainTabs';
import type { ExpenseCategory } from '../../domain/entities/Finance';
import { useAppStore } from '../../application/stores/useAppStore';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radius, spacing } from '../../shared/theme/tokens';
import { clamp, formatCurrency } from '../../shared/utils/formatters';
import { ProgressBar } from '../components/ProgressBar';
import { SectionCard } from '../components/SectionCard';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { toIsoDate } from '../../shared/utils/date';
import {
  expenseSchema,
  getValidationMessage,
  incomeSchema,
} from '../../application/validation/schemas';
import { useUiStore } from '../stores/useUiStore';

const toDimensionProgress = (xp: number): number => {
  const nextLevelWindow = 240;
  return clamp(((xp % nextLevelWindow) / nextLevelWindow) * 100, 0, 100);
};

const riskLabel: Record<'low' | 'medium' | 'high', string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
};

const recommendationPriorityLabel: Record<'high' | 'medium' | 'low', string> = {
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

const weeklyPlanStatusLabel: Record<
  'unplanned' | 'at_risk' | 'on_track' | 'achieved',
  string
> = {
  unplanned: 'Sin plan',
  at_risk: 'En riesgo',
  on_track: 'En curso',
  achieved: 'Logrado',
};

export const DashboardScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const profile = useAppStore((state) => state.profile);
  const habits = useAppStore((state) => state.habits);
  const habitStats = useAppStore((state) => state.habitStats);
  const financeSummary = useAppStore((state) => state.financeSummary);
  const insights = useAppStore((state) => state.insights);
  const achievements = useAppStore((state) => state.achievements);
  const missions = useAppStore((state) => state.missions);
  const telemetry = useAppStore((state) => state.telemetry);
  const weeklyPlanProgress = useAppStore((state) => state.weeklyPlanProgress);
  const recommendationsV2 = useAppStore((state) => state.recommendationsV2);
  const weeklySummary = useAppStore((state) => state.weeklySummary);
  const recentExpenses = useAppStore((state) => state.recentExpenses);
  const recentIncomes = useAppStore((state) => state.recentIncomes);
  const lessons = useAppStore((state) => state.lessons);
  const completeHabit = useAppStore((state) => state.completeHabit);
  const addIncome = useAppStore((state) => state.addIncome);
  const addExpense = useAppStore((state) => state.addExpense);
  const showToast = useUiStore((state) => state.showToast);

  const [selectedHabitId, setSelectedHabitId] = useState('');
  const [quickIncome, setQuickIncome] = useState('');
  const [quickExpense, setQuickExpense] = useState('');
  const [quickExpenseCategory, setQuickExpenseCategory] =
    useState<ExpenseCategory>('variable');
  const [quickExpenseSubCategory, setQuickExpenseSubCategory] =
    useState('Gasto rapido');
  const [isSubmittingQuickHabit, setIsSubmittingQuickHabit] = useState(false);
  const [isSubmittingQuickIncome, setIsSubmittingQuickIncome] = useState(false);
  const [isSubmittingQuickExpense, setIsSubmittingQuickExpense] = useState(false);

  const habitsCompleted = habitStats.todayCompleted;
  const habitsTotal = habitStats.activeHabitsCount;
  const habitsPending = Math.max(habitsTotal - habitsCompleted, 0);
  const weeklyHabitRate = clamp(habitStats.weeklyCompletionRate, 0, 100);
  const savingsGoal = profile?.monthlySavingsGoal ?? 0;
  const savingsGoalRate =
    savingsGoal <= 0 ? 0 : clamp((financeSummary.balance / savingsGoal) * 100, 0, 100);
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length;
  const todayIso = toIsoDate(new Date());
  const hasFinanceMovementToday =
    recentExpenses.some((item) => item.recordedAt === todayIso) ||
    recentIncomes.some((item) => item.recordedAt === todayIso);
  const completedLessonToday = lessons.some(
    (lesson) => lesson.completedAt === todayIso,
  );
  const nextAction:
    | { label: string; target: keyof MainTabParamList }
    | undefined = habitsPending > 0
    ? { label: 'Completar habitos de hoy', target: 'Habitos' }
    : !hasFinanceMovementToday
      ? { label: 'Registrar movimiento financiero', target: 'Finanzas' }
      : !completedLessonToday
        ? { label: 'Completar capsula educativa', target: 'Aprender' }
        : { label: 'Revisar progreso del dia', target: 'Progreso' };

  const financialStatus =
    financeSummary.savingsRate >= 20
      ? {
          label: 'Saludable',
          color: colors.success,
          helper: 'Mantienes una tasa de ahorro solida.',
        }
      : financeSummary.savingsRate >= 0
        ? {
            label: 'Atencion',
            color: colors.warning,
            helper: 'Ajusta gastos variables esta semana.',
          }
        : {
            label: 'Riesgo',
            color: colors.danger,
            helper: 'Tus gastos superan tus ingresos.',
          };

  const topInsight = insights[0];

  useEffect(() => {
    if (habits.length === 0) {
      setSelectedHabitId('');
      return;
    }
    if (!selectedHabitId || !habits.some((habit) => habit.id === selectedHabitId)) {
      setSelectedHabitId(habits[0].id);
    }
  }, [habits, selectedHabitId]);

  const onQuickCompleteHabit = async () => {
    if (!selectedHabitId) {
      showToast('Primero crea o selecciona un habito.', 'info');
      return;
    }

    setIsSubmittingQuickHabit(true);
    try {
      const completed = await completeHabit(selectedHabitId);
      if (completed) {
        showToast('Habito marcado desde Inicio.', 'success');
      } else {
        showToast('Ese habito ya estaba marcado hoy.', 'info');
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo marcar el habito.',
        'error',
      );
    } finally {
      setIsSubmittingQuickHabit(false);
    }
  };

  const onQuickAddIncome = async () => {
    const parsed = incomeSchema.safeParse({
      amount: quickIncome,
    });
    if (!parsed.success) {
      showToast(getValidationMessage(parsed.error), 'error');
      return;
    }

    setIsSubmittingQuickIncome(true);
    try {
      await addIncome(parsed.data.amount);
      setQuickIncome('');
      showToast('Ingreso rapido registrado.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo registrar ingreso.',
        'error',
      );
    } finally {
      setIsSubmittingQuickIncome(false);
    }
  };

  const onQuickAddExpense = async () => {
    const parsed = expenseSchema.safeParse({
      amount: quickExpense,
      category: quickExpenseCategory,
      subCategory: quickExpenseSubCategory,
    });
    if (!parsed.success) {
      showToast(getValidationMessage(parsed.error), 'error');
      return;
    }

    setIsSubmittingQuickExpense(true);
    try {
      await addExpense(
        parsed.data.amount,
        parsed.data.category,
        parsed.data.subCategory,
      );
      setQuickExpense('');
      showToast('Gasto rapido registrado.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo registrar gasto.',
        'error',
      );
    } finally {
      setIsSubmittingQuickExpense(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroAvatar}>
            <Text style={styles.heroAvatarText}>{(profile?.name || 'U').slice(0, 1).toUpperCase()}</Text>
          </View>
          <View style={styles.heroTextBlock}>
            <Text style={styles.heroTitle}>Hola, {profile?.name || 'usuario'}</Text>
            <Text style={styles.heroSubtitle}>{profile?.objective || 'Construye progreso diario.'}</Text>
          </View>
        </View>

        <View style={styles.heroStatsRow}>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>Nivel {profile?.level ?? 1}</Text>
            <Text style={styles.heroStatLabel}>{profile?.rank || 'novato'}</Text>
          </View>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{profile?.xp ?? 0} XP</Text>
            <Text style={styles.heroStatLabel}>Experiencia total</Text>
          </View>
          <View style={styles.heroStatItem}>
            <Text style={styles.heroStatValue}>{profile?.coins ?? 0}</Text>
            <Text style={styles.heroStatLabel}>Monedas</Text>
          </View>
        </View>
      </View>

      <SectionCard title="Misiones activas">
        {missions.length === 0 ? (
          <Text style={styles.missionHint}>Aun no hay misiones disponibles.</Text>
        ) : (
          missions.map((mission) => (
            <View key={mission.id} style={styles.missionRow}>
              <View style={styles.missionHeaderRow}>
                <Text style={styles.missionTitle}>{mission.title}</Text>
                <Text
                  style={[
                    styles.missionState,
                    mission.claimed
                      ? styles.missionClaimed
                      : mission.completed
                        ? styles.missionCompleted
                        : styles.missionPending,
                  ]}
                >
                  {mission.claimed ? 'Reclamada' : mission.completed ? 'Completa' : 'Activa'}
                </Text>
              </View>
              <Text style={styles.missionBody}>{mission.description}</Text>
              <Text style={styles.missionProgress}>Progreso: {mission.current}/{mission.target}</Text>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Progreso de habilidades">
        <ProgressBar
          label="Disciplina"
          value={toDimensionProgress(profile?.xpByDimension.discipline ?? 0)}
        />
        <ProgressBar
          label="Finanzas"
          value={toDimensionProgress(profile?.xpByDimension.finance ?? 0)}
        />
        <ProgressBar
          label="Aprendizaje"
          value={toDimensionProgress(profile?.xpByDimension.learning ?? 0)}
        />
      </SectionCard>

      <SectionCard title="Prioridad de hoy">
        <View style={styles.priorityRow}>
          <Text style={styles.priorityLabel}>Habitos completados</Text>
          <Text style={styles.priorityValue}>{habitsCompleted}/{habitsTotal}</Text>
        </View>
        <ProgressBar label="Progreso semanal" value={weeklyHabitRate} />
        <Text style={styles.priorityHint}>
          {habitsPending > 0
            ? `Te faltan ${habitsPending} habitos por completar hoy.`
            : 'Excelente, hoy completaste todos tus habitos.'}
        </Text>
      </SectionCard>

      <SectionCard title="Plan de hoy">
        <View style={styles.dailyTaskRow}>
          <Text style={styles.dailyTaskState}>{habitsPending > 0 ? '[ ]' : '[OK]'}</Text>
          <Text style={styles.dailyTaskText}>
            Habitos del dia ({habitsCompleted}/{habitsTotal})
          </Text>
        </View>
        <View style={styles.dailyTaskRow}>
          <Text style={styles.dailyTaskState}>{hasFinanceMovementToday ? '[OK]' : '[ ]'}</Text>
          <Text style={styles.dailyTaskText}>Movimiento financiero registrado hoy</Text>
        </View>
        <View style={styles.dailyTaskRow}>
          <Text style={styles.dailyTaskState}>{completedLessonToday ? '[OK]' : '[ ]'}</Text>
          <Text style={styles.dailyTaskText}>Capsula de aprendizaje completada hoy</Text>
        </View>
        {nextAction ? (
          <AppButton onPress={() => navigation.navigate(nextAction.target)}>
            {nextAction.label}
          </AppButton>
        ) : null}
      </SectionCard>

      <SectionCard title="Resumen semanal automatico">
        <Text style={styles.weeklyPeriod}>{weeklySummary.periodLabel}</Text>
        <View style={styles.weeklyGrid}>
          <View style={styles.weeklyMetricCard}>
            <Text style={styles.weeklyMetricValue}>{weeklySummary.activeDays}/7</Text>
            <Text style={styles.weeklyMetricLabel}>Dias activos</Text>
          </View>
          <View style={styles.weeklyMetricCard}>
            <Text style={styles.weeklyMetricValue}>
              {weeklySummary.habitCompletionRate.toFixed(0)}%
            </Text>
            <Text style={styles.weeklyMetricLabel}>Cumplimiento</Text>
          </View>
          <View style={styles.weeklyMetricCard}>
            <Text style={styles.weeklyMetricValue}>
              {formatCurrency(weeklySummary.balance, profile?.currency ?? 'COP')}
            </Text>
            <Text style={styles.weeklyMetricLabel}>Balance semanal</Text>
          </View>
          <View style={styles.weeklyMetricCard}>
            <Text style={styles.weeklyMetricValue}>{weeklySummary.xpEarned}</Text>
            <Text style={styles.weeklyMetricLabel}>XP ganada</Text>
          </View>
        </View>
        <Text style={styles.weeklyHeadline}>{weeklySummary.headline}</Text>
        <Text style={styles.priorityHint}>{weeklySummary.recommendation}</Text>
      </SectionCard>

      <SectionCard title="Plan semanal (v1.2)">
        <Text style={styles.missionHint}>
          Semana: {weeklyPlanProgress.weekKey || '-'} | Estado:{' '}
          {weeklyPlanStatusLabel[weeklyPlanProgress.status]}
        </Text>
        <ProgressBar
          label={`Habitos ${weeklyPlanProgress.completedHabits}/${weeklyPlanProgress.habitTarget}`}
          value={Math.max(0, weeklyPlanProgress.habitProgressRate)}
        />
        <ProgressBar
          label={`Ahorro ${formatCurrency(
            weeklyPlanProgress.currentSavings,
            profile?.currency ?? 'COP',
          )} / ${formatCurrency(weeklyPlanProgress.savingsTarget, profile?.currency ?? 'COP')}`}
          value={Math.max(0, weeklyPlanProgress.savingsProgressRate)}
        />
        <AppButton onPress={() => navigation.navigate('Progreso')} variant="secondary">
          Ajustar plan semanal
        </AppButton>
      </SectionCard>

      <SectionCard title="Recomendaciones v2">
        {recommendationsV2.length === 0 ? (
          <Text style={styles.missionHint}>
            Sin recomendaciones por ahora. Mantener constancia ya es una buena señal.
          </Text>
        ) : (
          recommendationsV2.map((recommendation) => (
            <View key={recommendation.id} style={styles.recommendationRow}>
              <View style={styles.recommendationHeader}>
                <Text style={styles.recommendationTitle}>{recommendation.title}</Text>
                <Text
                  style={[
                    styles.recommendationPriority,
                    recommendation.priority === 'high'
                      ? styles.recommendationPriorityHigh
                      : recommendation.priority === 'medium'
                        ? styles.recommendationPriorityMedium
                        : styles.recommendationPriorityLow,
                  ]}
                >
                  {recommendationPriorityLabel[recommendation.priority]}
                </Text>
              </View>
              <Text style={styles.recommendationBody}>{recommendation.body}</Text>
              <Pressable
                style={styles.recommendationAction}
                onPress={() => {
                  if (recommendation.category === 'finance') {
                    navigation.navigate('Finanzas');
                    return;
                  }
                  if (recommendation.category === 'learning') {
                    navigation.navigate('Aprender');
                    return;
                  }
                  if (recommendation.category === 'weekly_plan') {
                    navigation.navigate('Progreso');
                    return;
                  }
                  navigation.navigate('Habitos');
                }}
              >
                <Text style={styles.recommendationActionText}>
                  {recommendation.actionLabel}
                </Text>
              </Pressable>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Registro rapido (v1.2)">
        <View style={styles.quickBlock}>
          <Text style={styles.quickTitle}>Habito rapido</Text>
          {habits.length === 0 ? (
            <Text style={styles.missionHint}>
              No tienes habitos activos. Crea uno para usar este atajo.
            </Text>
          ) : (
            <>
              <View style={styles.rowWrap}>
                {habits.slice(0, 6).map((habit) => (
                  <Pressable
                    key={habit.id}
                    style={[
                      styles.quickChip,
                      selectedHabitId === habit.id && styles.quickChipSelected,
                    ]}
                    onPress={() => setSelectedHabitId(habit.id)}
                  >
                    <Text
                      style={[
                        styles.quickChipText,
                        selectedHabitId === habit.id && styles.quickChipTextSelected,
                      ]}
                    >
                      {habit.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <AppButton onPress={onQuickCompleteHabit} loading={isSubmittingQuickHabit}>
                Marcar habito seleccionado
              </AppButton>
            </>
          )}
        </View>

        <View style={styles.quickBlock}>
          <Text style={styles.quickTitle}>Ingreso rapido</Text>
          <View style={styles.quickRow}>
            <AppInput
              placeholder="Monto"
              keyboardType="numeric"
              value={quickIncome}
              onChangeText={setQuickIncome}
              style={styles.quickInput}
            />
            <View style={styles.quickButton}>
              <AppButton onPress={onQuickAddIncome} loading={isSubmittingQuickIncome}>
                Guardar
              </AppButton>
            </View>
          </View>
        </View>

        <View style={styles.quickBlock}>
          <Text style={styles.quickTitle}>Gasto rapido</Text>
          <View style={styles.rowWrap}>
            {(['fixed', 'variable', 'services'] as ExpenseCategory[]).map((category) => (
              <Pressable
                key={`quick-${category}`}
                style={[
                  styles.quickChip,
                  quickExpenseCategory === category && styles.quickChipSelected,
                ]}
                onPress={() => setQuickExpenseCategory(category)}
              >
                <Text
                  style={[
                    styles.quickChipText,
                    quickExpenseCategory === category && styles.quickChipTextSelected,
                  ]}
                >
                  {category}
                </Text>
              </Pressable>
            ))}
          </View>
          <AppInput
            placeholder="Subcategoria"
            value={quickExpenseSubCategory}
            onChangeText={setQuickExpenseSubCategory}
          />
          <View style={styles.quickRow}>
            <AppInput
              placeholder="Monto"
              keyboardType="numeric"
              value={quickExpense}
              onChangeText={setQuickExpense}
              style={styles.quickInput}
            />
            <View style={styles.quickButton}>
              <AppButton onPress={onQuickAddExpense} loading={isSubmittingQuickExpense}>
                Guardar
              </AppButton>
            </View>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Panel financiero rapido">
        <View style={styles.moneyRow}>
          <View style={styles.moneyCard}>
            <Text style={styles.moneyLabel}>Balance mensual</Text>
            <Text style={styles.moneyValue}>
              {formatCurrency(financeSummary.balance, profile?.currency ?? 'COP')}
            </Text>
          </View>
          <View style={styles.moneyCard}>
            <Text style={styles.moneyLabel}>Tasa de ahorro</Text>
            <Text style={styles.moneyValue}>{financeSummary.savingsRate.toFixed(1)}%</Text>
          </View>
        </View>

        {savingsGoal > 0 ? (
          <>
            <ProgressBar label="Meta de ahorro mensual" value={savingsGoalRate} />
            <Text style={styles.priorityHint}>
              {formatCurrency(financeSummary.balance, profile?.currency ?? 'COP')} /{' '}
              {formatCurrency(savingsGoal, profile?.currency ?? 'COP')}
            </Text>
          </>
        ) : (
          <Text style={styles.priorityHint}>
            Define tu meta de ahorro mensual desde Perfil para activar esta barra.
          </Text>
        )}

        <View style={styles.healthPill}>
          <Text style={styles.healthLabel}>Estado financiero</Text>
          <Text style={[styles.healthValue, { color: financialStatus.color }]}>{financialStatus.label}</Text>
        </View>
        <Text style={styles.priorityHint}>{financialStatus.helper}</Text>
      </SectionCard>

      <SectionCard title="Telemetria de balance">
        <Text style={styles.missionHint}>
          Misiones completadas: {telemetry.missionCompletionRate.toFixed(0)}%
        </Text>
        <Text style={styles.missionHint}>
          Cumplimiento habitos: {telemetry.weeklyHabitRate.toFixed(0)}%
        </Text>
        <Text style={styles.missionHint}>
          Riesgo de abandono: {riskLabel[telemetry.engagementRisk]}
        </Text>
      </SectionCard>

      <SectionCard title="Acciones rapidas">
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Habitos')}>
            <Text style={styles.actionTitle}>Registrar habito</Text>
            <Text style={styles.actionDescription}>Marca o crea habitos de hoy.</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Finanzas')}>
            <Text style={styles.actionTitle}>Registrar gasto</Text>
            <Text style={styles.actionDescription}>Actualiza ingresos y gastos rapido.</Text>
          </Pressable>
        </View>
        <View style={styles.actionsRow}>
          <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Aprender')}>
            <Text style={styles.actionTitle}>Aprender 5 min</Text>
            <Text style={styles.actionDescription}>Completa una capsula financiera.</Text>
          </Pressable>
          <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Progreso')}>
            <Text style={styles.actionTitle}>Revisar progreso</Text>
            <Text style={styles.actionDescription}>Abre timeline, logros y rendimiento.</Text>
          </Pressable>
        </View>
      </SectionCard>

      <SectionCard title="Logros destacados">
        <Text style={styles.missionHint}>
          {unlockedAchievements}/{achievements.length} desbloqueados
        </Text>
        {achievements.slice(0, 3).map((achievement) => (
          <View key={achievement.id} style={styles.achievementRow}>
            <Text style={achievement.unlocked ? styles.dotOn : styles.dotOff}>
              {achievement.unlocked ? '[OK]' : '[ ]'}
            </Text>
            <View style={styles.achievementTextBlock}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDesc}>{achievement.description}</Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Insight del dia">
        {topInsight ? (
          <>
            <Text style={styles.insightTitle}>{topInsight.title}</Text>
            <Text style={styles.insightBody}>{topInsight.body}</Text>
          </>
        ) : (
          <Text style={styles.insightBody}>
            Aun no hay insights, registra actividad hoy para ver recomendaciones.
          </Text>
        )}
      </SectionCard>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroCard: {
    marginTop: spacing.xl,
    backgroundColor: colors.primary,
    borderRadius: radius.lg,
    padding: spacing.md,
    gap: spacing.md,
  },
  heroTopRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
  },
  heroAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroAvatarText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 20,
  },
  heroTextBlock: {
    flex: 1,
    gap: 2,
  },
  heroTitle: {
    color: '#ffffff',
    fontSize: 22,
    fontWeight: '800',
  },
  heroSubtitle: {
    color: '#d5f3ee',
    fontSize: 12,
  },
  heroStatsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  heroStatItem: {
    flex: 1,
    borderRadius: radius.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.14)',
    padding: spacing.sm,
    gap: 2,
  },
  heroStatValue: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 13,
  },
  heroStatLabel: {
    color: '#d5f3ee',
    fontSize: 11,
  },
  missionRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: 4,
  },
  missionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  missionTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  missionBody: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  missionProgress: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '600',
  },
  missionState: {
    fontSize: 11,
    fontWeight: '700',
  },
  missionCompleted: {
    color: colors.success,
  },
  missionPending: {
    color: colors.warning,
  },
  missionClaimed: {
    color: colors.info,
  },
  missionHint: {
    color: colors.mutedText,
    fontSize: 12,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priorityLabel: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
  priorityValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  priorityHint: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  dailyTaskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  dailyTaskState: {
    color: colors.text,
    fontSize: 12,
    width: 36,
    fontWeight: '700',
  },
  dailyTaskText: {
    flex: 1,
    color: colors.mutedText,
    fontSize: 12,
  },
  weeklyPeriod: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '600',
  },
  weeklyGrid: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  weeklyMetricCard: {
    flexGrow: 1,
    minWidth: 120,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    backgroundColor: '#f9fcfb',
    gap: 2,
  },
  weeklyMetricValue: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  weeklyMetricLabel: {
    color: colors.mutedText,
    fontSize: 11,
  },
  weeklyHeadline: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 13,
  },
  recommendationRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: 4,
  },
  recommendationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  recommendationTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
    flex: 1,
  },
  recommendationPriority: {
    fontSize: 11,
    fontWeight: '800',
  },
  recommendationPriorityHigh: {
    color: colors.danger,
  },
  recommendationPriorityMedium: {
    color: colors.warning,
  },
  recommendationPriorityLow: {
    color: colors.success,
  },
  recommendationBody: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  recommendationAction: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
  },
  recommendationActionText: {
    color: colors.text,
    fontSize: 11,
    fontWeight: '700',
  },
  quickBlock: {
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  quickTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  rowWrap: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  quickChip: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingVertical: 6,
    paddingHorizontal: 10,
    backgroundColor: colors.surface,
  },
  quickChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  quickChipText: {
    color: colors.mutedText,
    fontSize: 12,
    fontWeight: '600',
  },
  quickChipTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  quickRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-end',
  },
  quickInput: {
    flex: 1,
    minWidth: 120,
  },
  quickButton: {
    width: 120,
  },
  moneyRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  moneyCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    padding: spacing.sm,
    gap: 2,
    backgroundColor: '#f9fcfb',
  },
  moneyLabel: {
    color: colors.mutedText,
    fontSize: 11,
  },
  moneyValue: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  healthPill: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    backgroundColor: colors.surface,
  },
  healthLabel: {
    color: colors.mutedText,
    fontWeight: '600',
    fontSize: 12,
  },
  healthValue: {
    fontWeight: '800',
    fontSize: 13,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  actionCard: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    padding: spacing.sm,
    gap: 4,
  },
  actionTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  actionDescription: {
    color: colors.mutedText,
    fontSize: 11,
    lineHeight: 16,
  },
  achievementRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'flex-start',
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  dotOn: {
    color: colors.success,
    fontWeight: '700',
    width: 36,
    fontSize: 12,
    lineHeight: 20,
  },
  dotOff: {
    color: colors.mutedText,
    fontWeight: '700',
    width: 36,
    fontSize: 12,
    lineHeight: 20,
  },
  achievementTextBlock: {
    flex: 1,
  },
  achievementTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  achievementDesc: {
    color: colors.mutedText,
    fontSize: 12,
  },
  insightTitle: {
    color: colors.text,
    fontWeight: '800',
    fontSize: 14,
  },
  insightBody: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
});
