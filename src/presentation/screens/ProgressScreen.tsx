import { format } from 'date-fns';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../application/stores/useAppStore';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { ProgressBar } from '../components/ProgressBar';
import { colors, radius, spacing } from '../../shared/theme/tokens';
import type { RewardHistorySource } from '../../domain/entities/Profile';
import { formatCurrency } from '../../shared/utils/formatters';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { useUiStore } from '../stores/useUiStore';
import {
  buildWeeklySummaryCsv,
  downloadWeeklySummaryCsv,
} from '../../application/services/weeklySummaryCsv';
import {
  buildWeeklySummaryShareText,
  copyTextToClipboard,
} from '../../application/services/weeklySummaryShare';
import {
  getValidationMessage,
  weeklyPlanTargetsSchema,
} from '../../application/validation/schemas';

const toDimensionProgress = (xp: number): number => {
  const nextLevelWindow = 240;
  return Math.max(0, Math.min(100, ((xp % nextLevelWindow) / nextLevelWindow) * 100));
};

const sourceLabel: Record<RewardHistorySource, string> = {
  event: 'Evento',
  mission: 'Mision',
  achievement: 'Logro',
  shop: 'Tienda',
  freeze: 'Comodin',
  system: 'Sistema',
};

const sourceColor: Record<RewardHistorySource, string> = {
  event: colors.info,
  mission: colors.success,
  achievement: colors.primary,
  shop: colors.warning,
  freeze: colors.warning,
  system: colors.mutedText,
};

const riskLabel: Record<'low' | 'medium' | 'high', string> = {
  low: 'Bajo',
  medium: 'Medio',
  high: 'Alto',
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

const weeklyTrendLabel: Record<'improving' | 'stable' | 'declining', string> = {
  improving: 'Mejorando',
  stable: 'Estable',
  declining: 'En retroceso',
};

const formatSigned = (value: number): string => {
  return `${value > 0 ? '+' : ''}${value.toFixed(0)}`;
};

export const ProgressScreen = () => {
  const profile = useAppStore((state) => state.profile);
  const missions = useAppStore((state) => state.missions);
  const achievements = useAppStore((state) => state.achievements);
  const telemetry = useAppStore((state) => state.telemetry);
  const weeklyPlanProgress = useAppStore((state) => state.weeklyPlanProgress);
  const weeklyComparison = useAppStore((state) => state.weeklyComparison);
  const weeklySummary = useAppStore((state) => state.weeklySummary);
  const setWeeklyHabitTarget = useAppStore((state) => state.setWeeklyHabitTarget);
  const setWeeklySavingsTarget = useAppStore((state) => state.setWeeklySavingsTarget);
  const showToast = useUiStore((state) => state.showToast);
  const [isExportingCsv, setIsExportingCsv] = useState(false);
  const [isCopyingSummary, setIsCopyingSummary] = useState(false);
  const [weeklyHabitTargetInput, setWeeklyHabitTargetInput] = useState('0');
  const [weeklySavingsTargetInput, setWeeklySavingsTargetInput] = useState('0');
  const [isSavingWeeklyPlan, setIsSavingWeeklyPlan] = useState(false);

  const completedMissions = missions.filter((mission) => mission.completed).length;
  const claimedMissions = missions.filter((mission) => mission.claimed).length;
  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length;
  const rewardHistory = profile?.rewardHistory.slice(0, 14) ?? [];

  useEffect(() => {
    setWeeklyHabitTargetInput(String(weeklyPlanProgress.habitTarget));
    setWeeklySavingsTargetInput(String(weeklyPlanProgress.savingsTarget));
  }, [weeklyPlanProgress.habitTarget, weeklyPlanProgress.savingsTarget]);

  const onExportWeeklyCsv = async () => {
    setIsExportingCsv(true);
    try {
      const csvContent = buildWeeklySummaryCsv(
        weeklySummary,
        profile?.currency ?? 'COP',
      );
      await downloadWeeklySummaryCsv(csvContent);
      showToast('Resumen semanal exportado en CSV.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo exportar el CSV.',
        'error',
      );
    } finally {
      setIsExportingCsv(false);
    }
  };

  const onCopyWeeklySummary = async () => {
    setIsCopyingSummary(true);
    try {
      const text = buildWeeklySummaryShareText(
        weeklySummary,
        profile?.currency ?? 'COP',
      );
      await copyTextToClipboard(text);
      showToast('Resumen semanal copiado.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo copiar el resumen.',
        'error',
      );
    } finally {
      setIsCopyingSummary(false);
    }
  };

  const onSaveWeeklyPlan = async () => {
    const result = weeklyPlanTargetsSchema.safeParse({
      habitTarget: weeklyHabitTargetInput,
      savingsTarget: weeklySavingsTargetInput,
    });

    if (!result.success) {
      showToast(getValidationMessage(result.error), 'error');
      return;
    }

    setIsSavingWeeklyPlan(true);
    try {
      await setWeeklyHabitTarget(result.data.habitTarget);
      await setWeeklySavingsTarget(result.data.savingsTarget);
      showToast('Plan semanal actualizado.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'No se pudo actualizar el plan semanal.',
        'error',
      );
    } finally {
      setIsSavingWeeklyPlan(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Progreso avanzado</Text>
        <Text style={styles.subtitle}>
          Rango {profile?.rank ?? 'novato'} - Nivel {profile?.level ?? 1}
        </Text>
      </View>

      <SectionCard title="Resumen de temporada">
        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{profile?.xp ?? 0}</Text>
            <Text style={styles.metricLabel}>XP total</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{profile?.coins ?? 0}</Text>
            <Text style={styles.metricLabel}>Monedas</Text>
          </View>
        </View>
        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{claimedMissions}/{missions.length}</Text>
            <Text style={styles.metricLabel}>Misiones reclamadas</Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{unlockedAchievements}/{achievements.length}</Text>
            <Text style={styles.metricLabel}>Logros desbloqueados</Text>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Progreso por dimension">
        <ProgressBar
          label={`Disciplina (${profile?.xpByDimension.discipline ?? 0} XP)`}
          value={toDimensionProgress(profile?.xpByDimension.discipline ?? 0)}
        />
        <ProgressBar
          label={`Finanzas (${profile?.xpByDimension.finance ?? 0} XP)`}
          value={toDimensionProgress(profile?.xpByDimension.finance ?? 0)}
        />
        <ProgressBar
          label={`Aprendizaje (${profile?.xpByDimension.learning ?? 0} XP)`}
          value={toDimensionProgress(profile?.xpByDimension.learning ?? 0)}
        />
      </SectionCard>

      <SectionCard title="Metricas de salud">
        <Text style={styles.metricLine}>
          Misiones completas: {completedMissions}/{missions.length}
        </Text>
        <Text style={styles.metricLine}>
          Tasa de completado: {telemetry.missionCompletionRate.toFixed(0)}%
        </Text>
        <Text style={styles.metricLine}>
          Cumplimiento habitos: {telemetry.weeklyHabitRate.toFixed(0)}%
        </Text>
        <Text style={styles.metricLine}>
          Riesgo de abandono: {riskLabel[telemetry.engagementRisk]}
        </Text>
      </SectionCard>

      <SectionCard title="Plan semanal (v1.2)">
        <Text style={styles.metricLine}>Semana: {weeklyPlanProgress.weekKey || '-'}</Text>
        <Text style={styles.metricLine}>
          Periodo: {weeklyPlanProgress.dateFrom || '-'} a {weeklyPlanProgress.dateTo || '-'}
        </Text>
        <Text style={styles.metricLine}>
          Estado: {weeklyPlanStatusLabel[weeklyPlanProgress.status]}
        </Text>
        <Text style={styles.metricLine}>
          Habitos: {weeklyPlanProgress.completedHabits}/{weeklyPlanProgress.habitTarget}
        </Text>
        <ProgressBar
          label="Avance de habitos"
          value={Math.max(0, weeklyPlanProgress.habitProgressRate)}
        />
        <Text style={styles.metricLine}>
          Ahorro semanal: {formatCurrency(weeklyPlanProgress.currentSavings, profile?.currency ?? 'COP')} /{' '}
          {formatCurrency(weeklyPlanProgress.savingsTarget, profile?.currency ?? 'COP')}
        </Text>
        <ProgressBar
          label="Avance de ahorro"
          value={Math.max(0, weeklyPlanProgress.savingsProgressRate)}
        />
        <View style={styles.row}>
          <AppInput
            label="Meta habitos"
            placeholder="0"
            keyboardType="number-pad"
            value={weeklyHabitTargetInput}
            onChangeText={setWeeklyHabitTargetInput}
            style={styles.planInput}
          />
          <AppInput
            label="Meta ahorro"
            placeholder="0"
            keyboardType="numeric"
            value={weeklySavingsTargetInput}
            onChangeText={setWeeklySavingsTargetInput}
            style={styles.planInput}
          />
        </View>
        <AppButton onPress={onSaveWeeklyPlan} loading={isSavingWeeklyPlan}>
          Guardar plan semanal
        </AppButton>
      </SectionCard>

      <SectionCard title="Comparativo semanal (v1.2)">
        <Text style={styles.metricLine}>Tendencia: {weeklyTrendLabel[weeklyComparison.trend]}</Text>
        <Text style={styles.summaryHeadline}>{weeklyComparison.headline}</Text>
        <Text style={styles.emptyText}>{weeklyComparison.recommendation}</Text>
        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {weeklyComparison.current.completedHabits}
            </Text>
            <Text style={styles.metricLabel}>Habitos semana actual</Text>
            <Text style={styles.deltaText}>
              Delta: {formatSigned(weeklyComparison.delta.completedHabits)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>
              {formatCurrency(
                weeklyComparison.current.balance,
                profile?.currency ?? 'COP',
              )}
            </Text>
            <Text style={styles.metricLabel}>Balance semana actual</Text>
            <Text style={styles.deltaText}>
              Delta: {formatSigned(weeklyComparison.delta.balance)}
            </Text>
          </View>
        </View>
        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{weeklyComparison.current.xpEarned}</Text>
            <Text style={styles.metricLabel}>XP semana actual</Text>
            <Text style={styles.deltaText}>
              Delta: {formatSigned(weeklyComparison.delta.xpEarned)}
            </Text>
          </View>
          <View style={styles.metricCard}>
            <Text style={styles.metricValue}>{weeklyComparison.current.coinsNet}</Text>
            <Text style={styles.metricLabel}>Monedas netas</Text>
            <Text style={styles.deltaText}>
              Delta: {formatSigned(weeklyComparison.delta.coinsNet)}
            </Text>
          </View>
        </View>
        <Text style={styles.emptyText}>
          Semana anterior: {weeklyComparison.previous.weekKey || '-'}
        </Text>
      </SectionCard>

      <SectionCard title="Resumen semanal">
        <Text style={styles.metricLine}>Periodo: {weeklySummary.periodLabel}</Text>
        <Text style={styles.metricLine}>
          Dias activos: {weeklySummary.activeDays}/7
        </Text>
        <Text style={styles.metricLine}>
          Habitos: {weeklySummary.habitCompletionRate.toFixed(0)}%
        </Text>
        <Text style={styles.metricLine}>
          Ingresos: {formatCurrency(weeklySummary.incomesTotal, profile?.currency ?? 'COP')}
        </Text>
        <Text style={styles.metricLine}>
          Gastos: {formatCurrency(weeklySummary.expensesTotal, profile?.currency ?? 'COP')}
        </Text>
        <Text style={styles.metricLine}>
          Balance: {formatCurrency(weeklySummary.balance, profile?.currency ?? 'COP')}
        </Text>
        <Text style={styles.metricLine}>
          XP ganada: {weeklySummary.xpEarned} | Monedas +{weeklySummary.coinsEarned} / -
          {weeklySummary.coinsSpent}
        </Text>
        <Text style={styles.summaryHeadline}>{weeklySummary.headline}</Text>
        <Text style={styles.emptyText}>{weeklySummary.recommendation}</Text>
        <AppButton
          onPress={onCopyWeeklySummary}
          variant="secondary"
          loading={isCopyingSummary}
        >
          Copiar resumen
        </AppButton>
        <AppButton onPress={onExportWeeklyCsv} loading={isExportingCsv}>
          Exportar resumen CSV
        </AppButton>
      </SectionCard>

      <SectionCard title="Timeline de recompensas">
        {rewardHistory.length === 0 ? (
          <Text style={styles.emptyText}>
            Aun no hay movimientos de recompensa. Completa habitos, misiones o logros.
          </Text>
        ) : (
          rewardHistory.map((entry) => (
            <View key={entry.id} style={styles.historyRow}>
              <View style={styles.historyTop}>
                <Text style={[styles.sourcePill, { color: sourceColor[entry.source] }]}>
                  {sourceLabel[entry.source]}
                </Text>
                <Text style={styles.historyDate}>
                  {format(new Date(entry.createdAt), 'dd/MM/yyyy HH:mm')}
                </Text>
              </View>
              <Text style={styles.historyReason}>{entry.reason}</Text>
              <Text style={styles.historyDelta}>
                {entry.xpDelta !== 0 ? `XP ${entry.xpDelta > 0 ? '+' : ''}${entry.xpDelta}` : 'XP 0'}
                {' | '}
                {`Monedas ${entry.coinsDelta > 0 ? '+' : ''}${entry.coinsDelta}`}
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
  grid: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metricCard: {
    flex: 1,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f9fcfb',
    padding: spacing.sm,
    gap: 2,
  },
  metricValue: {
    color: colors.text,
    fontSize: 18,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.mutedText,
    fontSize: 11,
  },
  metricLine: {
    color: colors.text,
    fontSize: 12,
    lineHeight: 20,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  planInput: {
    minWidth: 130,
    flex: 1,
  },
  emptyText: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  summaryHeadline: {
    color: colors.text,
    fontSize: 13,
    fontWeight: '800',
  },
  deltaText: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '700',
  },
  historyRow: {
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
    gap: 4,
  },
  historyTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  sourcePill: {
    fontSize: 11,
    fontWeight: '800',
  },
  historyDate: {
    fontSize: 11,
    color: colors.mutedText,
  },
  historyReason: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 12,
  },
  historyDelta: {
    color: colors.mutedText,
    fontSize: 12,
  },
});
