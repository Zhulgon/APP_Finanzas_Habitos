import { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../application/stores/useAppStore';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radius, spacing } from '../../shared/theme/tokens';
import { EmptyState } from '../components/EmptyState';
import { useUiStore } from '../stores/useUiStore';
import { xpForAction } from '../../application/services/gamification';
import { AppButton } from '../components/AppButton';
import { SectionCard } from '../components/SectionCard';
import { fetchUsdCopPulse, type FinancialPulse } from '../../application/services/financialPulse';

const pillarLabel: Record<string, string> = {
  mindset: 'Mentalidad',
  cashflow: 'Flujo de caja',
  budget: 'Presupuesto',
  safety: 'Proteccion',
  investing: 'Inversion',
  debt: 'Deuda',
};

export const LearnScreen = () => {
  const lessons = useAppStore((state) => state.lessons);
  const learningPath = useAppStore((state) => state.learningPath);
  const completeLesson = useAppStore((state) => state.completeLesson);
  const showToast = useUiStore((state) => state.showToast);
  const lessonXp = xpForAction('lesson_completed');
  const [pulse, setPulse] = useState<FinancialPulse | null>(null);
  const [isPulseLoading, setIsPulseLoading] = useState(false);

  const loadPulse = async () => {
    setIsPulseLoading(true);
    try {
      const nextPulse = await fetchUsdCopPulse();
      setPulse(nextPulse);
    } finally {
      setIsPulseLoading(false);
    }
  };

  useEffect(() => {
    void loadPulse();
  }, []);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Academia financiera diaria</Text>
        <Text style={styles.subtitle}>
          Una capsula por dia. Aprendes, aplicas y desbloqueas la siguiente.
        </Text>
      </View>

      <SectionCard title="Progreso de aprendizaje">
        <View style={styles.metricsRow}>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{learningPath.completedLessons}</Text>
            <Text style={styles.metricLabel}>Completadas</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{learningPath.totalLessons}</Text>
            <Text style={styles.metricLabel}>Totales</Text>
          </View>
          <View style={styles.metric}>
            <Text style={styles.metricValue}>{learningPath.availableToday}</Text>
            <Text style={styles.metricLabel}>Disponibles hoy</Text>
          </View>
        </View>
        {learningPath.nextUnlockDate ? (
          <Text style={styles.helperText}>
            Siguiente desbloqueo estimado: {learningPath.nextUnlockDate}
          </Text>
        ) : null}
      </SectionCard>

      <SectionCard title="Pulso financiero del dia">
        <Text style={styles.pulseRate}>
          USD/COP: {pulse ? pulse.usdCopRate.toLocaleString('es-CO') : '--'}
        </Text>
        <Text style={styles.helperText}>
          {pulse ? pulse.note : 'Cargando referencia educativa de mercado...'}
        </Text>
        <Text style={styles.smallLabel}>
          Fuente: {pulse?.source ?? '-'} | Actualizado:{' '}
          {pulse ? pulse.fetchedAt.slice(0, 16).replace('T', ' ') : '-'}
        </Text>
        <AppButton onPress={() => void loadPulse()} variant="secondary" loading={isPulseLoading}>
          Actualizar pulso
        </AppButton>
      </SectionCard>

      {lessons.length === 0 ? (
        <EmptyState
          title="No hay lecciones disponibles"
          body="Vuelve a abrir la app para recargar el catalogo educativo."
        />
      ) : (
        lessons.map((lesson) => (
          <View
            key={lesson.id}
            style={[
              styles.card,
              !lesson.availableToday && !lesson.completed && styles.cardLocked,
            ]}
          >
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>
                Dia {lesson.dayOrder ?? '-'}: {lesson.title}
              </Text>
              <Text style={styles.badge}>
                {lesson.completed
                  ? 'Completada'
                  : lesson.availableToday
                    ? `${lesson.estimatedMinutes} min`
                    : 'Bloqueada'}
              </Text>
            </View>
            <Text style={styles.pillarLabel}>
              Pilar: {pillarLabel[lesson.pillar ?? ''] ?? 'General'}
            </Text>
            <Text style={styles.summary}>{lesson.summary}</Text>
            <Text style={styles.content}>{lesson.content}</Text>
            <Text style={styles.smallLabel}>
              Inspirado en: {lesson.inspiredBy ?? 'educacion financiera practica'}
            </Text>
            {lesson.lockedReason ? (
              <Text style={styles.lockedReason}>{lesson.lockedReason}</Text>
            ) : null}
            <AppButton
              onPress={() => {
                void (async () => {
                  const wasCompleted = await completeLesson(lesson.id);
                  if (wasCompleted) {
                    showToast(`Leccion completada (+${lessonXp} XP base).`, 'success');
                    return;
                  }
                  showToast(
                    lesson.lockedReason ?? 'Esta leccion ya estaba completada.',
                    'info',
                  );
                })();
              }}
              disabled={lesson.completed || !lesson.availableToday}
              variant={lesson.completed ? 'secondary' : 'primary'}
            >
              {lesson.completed
                ? 'Ya aprendida'
                : lesson.availableToday
                  ? `Marcar aprendida (+${lessonXp} XP base)`
                  : 'Bloqueada por progreso diario'}
            </AppButton>
          </View>
        ))
      )}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 27,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
  },
  metricsRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  metric: {
    flex: 1,
    borderRadius: radius.sm,
    borderColor: colors.border,
    borderWidth: 1,
    padding: spacing.sm,
    backgroundColor: colors.primarySoft,
  },
  metricValue: {
    color: colors.text,
    fontSize: 19,
    fontWeight: '800',
  },
  metricLabel: {
    color: colors.mutedText,
    fontSize: 11,
    fontWeight: '600',
  },
  helperText: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  pulseRate: {
    color: colors.text,
    fontSize: 20,
    fontWeight: '800',
  },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardLocked: {
    opacity: 0.75,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
    flex: 1,
  },
  badge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  pillarLabel: {
    color: colors.info,
    fontWeight: '700',
    fontSize: 12,
  },
  summary: {
    color: colors.text,
    fontWeight: '700',
  },
  content: {
    color: colors.mutedText,
    lineHeight: 19,
  },
  lockedReason: {
    color: colors.warning,
    fontSize: 12,
    fontWeight: '600',
  },
  smallLabel: {
    color: colors.mutedText,
    fontSize: 11,
  },
});
