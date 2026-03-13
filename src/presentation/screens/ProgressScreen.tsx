import { format } from 'date-fns';
import { StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../application/stores/useAppStore';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { ProgressBar } from '../components/ProgressBar';
import { colors, radius, spacing } from '../../shared/theme/tokens';
import type { RewardHistorySource } from '../../domain/entities/Profile';
import { formatCurrency } from '../../shared/utils/formatters';

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

export const ProgressScreen = () => {
  const profile = useAppStore((state) => state.profile);
  const missions = useAppStore((state) => state.missions);
  const achievements = useAppStore((state) => state.achievements);
  const telemetry = useAppStore((state) => state.telemetry);
  const weeklySummary = useAppStore((state) => state.weeklySummary);

  const completedMissions = missions.filter((mission) => mission.completed).length;
  const claimedMissions = missions.filter((mission) => mission.claimed).length;
  const unlockedAchievements = achievements.filter(
    (achievement) => achievement.unlocked,
  ).length;
  const rewardHistory = profile?.rewardHistory.slice(0, 14) ?? [];

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
