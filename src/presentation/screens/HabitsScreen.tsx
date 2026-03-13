import { useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../application/stores/useAppStore';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radius, spacing } from '../../shared/theme/tokens';
import type { HabitCategory, HabitFrequency } from '../../domain/entities/Habit';
import {
  createHabitSchema,
  getValidationMessage,
} from '../../application/validation/schemas';
import { useUiStore } from '../stores/useUiStore';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { SectionCard } from '../components/SectionCard';
import { EmptyState } from '../components/EmptyState';

const frequencies: HabitFrequency[] = ['daily', 'weekly'];
const categories: HabitCategory[] = ['health', 'productivity', 'finance'];

export const HabitsScreen = () => {
  const habits = useAppStore((state) => state.habits);
  const createHabit = useAppStore((state) => state.createHabit);
  const updateHabit = useAppStore((state) => state.updateHabit);
  const archiveHabit = useAppStore((state) => state.archiveHabit);
  const completeHabit = useAppStore((state) => state.completeHabit);
  const showToast = useUiStore((state) => state.showToast);

  const [name, setName] = useState('');
  const [frequency, setFrequency] = useState<HabitFrequency>('daily');
  const [category, setCategory] = useState<HabitCategory>('health');
  const [isSaving, setIsSaving] = useState(false);

  const [editingHabitId, setEditingHabitId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editFrequency, setEditFrequency] = useState<HabitFrequency>('daily');
  const [editCategory, setEditCategory] = useState<HabitCategory>('health');
  const [isUpdating, setIsUpdating] = useState(false);

  const activeCount = useMemo(() => habits.length, [habits.length]);

  const onCreateHabit = async () => {
    const result = createHabitSchema.safeParse({
      name,
      frequency,
      category,
    });

    if (!result.success) {
      showToast(getValidationMessage(result.error), 'error');
      return;
    }

    setIsSaving(true);
    try {
      await createHabit(
        result.data.name,
        result.data.frequency,
        result.data.category,
      );
      setName('');
      showToast('Habito agregado con exito.', 'success');
    } catch (error) {
      showToast(error instanceof Error ? error.message : 'No se pudo crear.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const onStartEditHabit = (habitId: string) => {
    const target = habits.find((habit) => habit.id === habitId);
    if (!target) {
      showToast('No se encontro el habito a editar.', 'error');
      return;
    }

    setEditingHabitId(target.id);
    setEditName(target.name);
    setEditFrequency(target.frequency);
    setEditCategory(target.category);
  };

  const onCancelEditHabit = () => {
    setEditingHabitId(null);
    setEditName('');
    setEditFrequency('daily');
    setEditCategory('health');
  };

  const onUpdateHabit = async () => {
    if (!editingHabitId) {
      return;
    }

    const result = createHabitSchema.safeParse({
      name: editName,
      frequency: editFrequency,
      category: editCategory,
    });

    if (!result.success) {
      showToast(getValidationMessage(result.error), 'error');
      return;
    }

    setIsUpdating(true);
    try {
      const wasUpdated = await updateHabit(
        editingHabitId,
        result.data.name,
        result.data.frequency,
        result.data.category,
      );
      if (!wasUpdated) {
        showToast('No se pudo actualizar el habito.', 'error');
        return;
      }
      showToast('Habito actualizado.', 'success');
      onCancelEditHabit();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo actualizar.',
        'error',
      );
    } finally {
      setIsUpdating(false);
    }
  };

  const onCompleteHabit = async (habitId: string) => {
    const wasCompleted = await completeHabit(habitId);
    if (wasCompleted) {
      showToast('Excelente, habito completado.', 'success');
      return;
    }
    showToast('Ya habias marcado este habito hoy.', 'info');
  };

  const onArchiveHabit = async (habitId: string) => {
    const wasArchived = await archiveHabit(habitId);
    showToast(
      wasArchived ? 'Habito archivado.' : 'No se pudo archivar el habito.',
      wasArchived ? 'success' : 'error',
    );

    if (wasArchived && editingHabitId === habitId) {
      onCancelEditHabit();
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Habitos</Text>
        <Text style={styles.subtitle}>Activos: {activeCount}</Text>
      </View>

      <SectionCard title="Nuevo habito">
        <AppInput
          label="Nombre del habito"
          placeholder="Ej: Leer 10 paginas"
          value={name}
          onChangeText={setName}
        />
        <View style={styles.row}>
          {frequencies.map((item) => (
            <Pressable
              key={`create-${item}`}
              style={[styles.selector, frequency === item && styles.selectorSelected]}
              onPress={() => setFrequency(item)}
            >
              <Text
                style={[
                  styles.selectorText,
                  frequency === item && styles.selectorTextSelected,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          {categories.map((item) => (
            <Pressable
              key={`create-category-${item}`}
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
        <AppButton onPress={onCreateHabit} loading={isSaving}>
          Agregar habito
        </AppButton>
      </SectionCard>

      {editingHabitId ? (
        <SectionCard title="Editar habito">
          <AppInput
            label="Nombre del habito"
            placeholder="Ej: Leer 20 min"
            value={editName}
            onChangeText={setEditName}
          />
          <View style={styles.row}>
            {frequencies.map((item) => (
              <Pressable
                key={`edit-${item}`}
                style={[styles.selector, editFrequency === item && styles.selectorSelected]}
                onPress={() => setEditFrequency(item)}
              >
                <Text
                  style={[
                    styles.selectorText,
                    editFrequency === item && styles.selectorTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            {categories.map((item) => (
              <Pressable
                key={`edit-category-${item}`}
                style={[styles.selector, editCategory === item && styles.selectorSelected]}
                onPress={() => setEditCategory(item)}
              >
                <Text
                  style={[
                    styles.selectorText,
                    editCategory === item && styles.selectorTextSelected,
                  ]}
                >
                  {item}
                </Text>
              </Pressable>
            ))}
          </View>
          <View style={styles.row}>
            <View style={styles.flex}>
              <AppButton onPress={onUpdateHabit} loading={isUpdating}>
                Guardar cambios
              </AppButton>
            </View>
            <View style={styles.flex}>
              <AppButton onPress={onCancelEditHabit} variant="secondary" disabled={isUpdating}>
                Cancelar
              </AppButton>
            </View>
          </View>
        </SectionCard>
      ) : null}

      <View style={styles.list}>
        {habits.length === 0 ? (
          <EmptyState
            title="Todavia no tienes habitos"
            body="Crea al menos un habito para empezar a construir racha y ganar XP."
          />
        ) : (
          habits.map((habit) => (
            <View key={habit.id} style={styles.item}>
              <View style={styles.itemText}>
                <Text style={styles.itemName}>{habit.name}</Text>
                <Text style={styles.itemMeta}>
                  {habit.frequency} - {habit.category}
                </Text>
              </View>
              <View style={styles.itemActions}>
                <Pressable
                  style={styles.doneButton}
                  onPress={() => {
                    void onCompleteHabit(habit.id);
                  }}
                >
                  <Text style={styles.doneText}>Hecho</Text>
                </Pressable>
                <Pressable
                  style={styles.editButton}
                  onPress={() => onStartEditHabit(habit.id)}
                >
                  <Text style={styles.editText}>Editar</Text>
                </Pressable>
                <Pressable
                  style={styles.archiveButton}
                  onPress={() => {
                    void onArchiveHabit(habit.id);
                  }}
                >
                  <Text style={styles.archiveText}>Archivar</Text>
                </Pressable>
              </View>
            </View>
          ))
        )}
      </View>
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
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
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
    backgroundColor: colors.primarySoft,
    borderColor: colors.primary,
  },
  selectorText: {
    color: colors.mutedText,
    fontSize: 12,
  },
  selectorTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  list: {
    gap: spacing.sm,
  },
  item: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.sm,
  },
  itemText: {
    gap: 3,
  },
  itemName: {
    color: colors.text,
    fontWeight: '700',
  },
  itemMeta: {
    color: colors.mutedText,
    fontSize: 12,
  },
  itemActions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  doneButton: {
    borderWidth: 1,
    borderColor: colors.primary,
    borderRadius: radius.sm,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  doneText: {
    color: colors.primary,
    fontWeight: '700',
    fontSize: 12,
  },
  editButton: {
    borderWidth: 1,
    borderColor: colors.info,
    borderRadius: radius.sm,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  editText: {
    color: colors.info,
    fontWeight: '700',
    fontSize: 12,
  },
  archiveButton: {
    borderWidth: 1,
    borderColor: colors.borderStrong,
    borderRadius: radius.sm,
    paddingVertical: 7,
    paddingHorizontal: 12,
  },
  archiveText: {
    color: colors.mutedText,
    fontWeight: '700',
    fontSize: 12,
  },
});
