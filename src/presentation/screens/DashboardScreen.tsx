import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import type { MainTabParamList } from '../../app/navigation/MainTabs';
import { useAppStore } from '../../application/stores/useAppStore';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radius, spacing } from '../../shared/theme/tokens';
import { clamp, formatCurrency } from '../../shared/utils/formatters';
import { ProgressBar } from '../components/ProgressBar';
import { SectionCard } from '../components/SectionCard';

const toDimensionProgress = (xp: number): number => {
  const nextLevelWindow = 240;
  return clamp(((xp % nextLevelWindow) / nextLevelWindow) * 100, 0, 100);
};

export const DashboardScreen = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const profile = useAppStore((state) => state.profile);
  const habitStats = useAppStore((state) => state.habitStats);
  const financeSummary = useAppStore((state) => state.financeSummary);
  const insights = useAppStore((state) => state.insights);
  const achievements = useAppStore((state) => state.achievements);
  const missions = useAppStore((state) => state.missions);
  const telemetry = useAppStore((state) => state.telemetry);

  const habitsCompleted = habitStats.todayCompleted;
  const habitsTotal = habitStats.activeHabitsCount;
  const habitsPending = Math.max(habitsTotal - habitsCompleted, 0);
  const weeklyHabitRate = clamp(habitStats.weeklyCompletionRate, 0, 100);
  const savingsGoal = profile?.monthlySavingsGoal ?? 0;
  const savingsGoalRate =
    savingsGoal <= 0 ? 0 : clamp((financeSummary.balance / savingsGoal) * 100, 0, 100);
  const unlockedAchievements = achievements.filter((achievement) => achievement.unlocked).length;

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
          Riesgo de abandono: {telemetry.engagementRisk}
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
          <Pressable style={styles.actionCard} onPress={() => navigation.navigate('Perfil')}>
            <Text style={styles.actionTitle}>Editar perfil</Text>
            <Text style={styles.actionDescription}>Ajusta objetivo, avatar y recordatorios.</Text>
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
