import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../application/stores/useAppStore';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radius, spacing } from '../../shared/theme/tokens';
import { EmptyState } from '../components/EmptyState';
import { useUiStore } from '../stores/useUiStore';

export const LearnScreen = () => {
  const lessons = useAppStore((state) => state.lessons);
  const completeLesson = useAppStore((state) => state.completeLesson);
  const showToast = useUiStore((state) => state.showToast);

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Educacion financiera</Text>
        <Text style={styles.subtitle}>Capsulas cortas de 1-2 minutos</Text>
      </View>

      {lessons.length === 0 ? (
        <EmptyState
          title="No hay lecciones disponibles"
          body="Vuelve a abrir la app para recargar el catalogo educativo."
        />
      ) : (
        lessons.map((lesson) => (
          <View key={lesson.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <Text style={styles.cardTitle}>{lesson.title}</Text>
              <Text style={styles.badge}>
                {lesson.completed ? 'Completada' : `${lesson.estimatedMinutes} min`}
              </Text>
            </View>
            <Text style={styles.summary}>{lesson.summary}</Text>
            <Text style={styles.content}>{lesson.content}</Text>
            <Pressable
              style={[styles.button, lesson.completed && styles.buttonDisabled]}
              disabled={lesson.completed}
              onPress={() => {
                void (async () => {
                  const wasCompleted = await completeLesson(lesson.id);
                  if (wasCompleted) {
                    showToast('Leccion completada (+15 XP).', 'success');
                  } else {
                    showToast('Esta leccion ya estaba completada.', 'info');
                  }
                })();
              }}
            >
              <Text style={styles.buttonText}>
                {lesson.completed ? 'Ya aprendida' : 'Marcar aprendida (+15 XP)'}
              </Text>
            </Pressable>
          </View>
        ))
      )}
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
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 16,
  },
  badge: {
    color: colors.primary,
    fontSize: 12,
    fontWeight: '600',
  },
  summary: {
    color: colors.text,
    fontWeight: '600',
  },
  content: {
    color: colors.mutedText,
    lineHeight: 19,
  },
  button: {
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonDisabled: {
    borderColor: colors.border,
  },
  buttonText: {
    color: colors.primary,
    fontWeight: '700',
  },
});
