import { useEffect, useState } from 'react';
import { Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../application/stores/useAppStore';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, radius, spacing } from '../../shared/theme/tokens';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { SectionCard } from '../components/SectionCard';
import {
  getValidationMessage,
  profileSchema,
  reminderTimeSchema,
} from '../../application/validation/schemas';
import { useUiStore } from '../stores/useUiStore';
import {
  disableHabitReminder,
  getHabitReminderStatus,
  scheduleDailyHabitReminder,
  type HabitReminderStatus,
} from '../../application/services/reminders';
import {
  clearAppEvents,
  listRecentAppEvents,
  type AppEvent,
} from '../../application/services/observability';

const avatarColors = ['#0f766e', '#2563eb', '#b45309', '#be123c'];
const avatarShopCatalog: Array<{ id: string; cost: number }> = [
  { id: 'seedling', cost: 0 },
  { id: 'book', cost: 15 },
  { id: 'coin', cost: 20 },
  { id: 'bolt', cost: 30 },
];

const triggerBackupDownloadOnWeb = (serializedBackup: string) => {
  const documentRef = (globalThis as { document?: any }).document;
  const urlApi = (globalThis as { URL?: any }).URL;
  const BlobCtor = (globalThis as { Blob?: any }).Blob;

  if (!documentRef?.createElement || !urlApi?.createObjectURL || !BlobCtor) {
    throw new Error('No se pudo descargar el archivo en este navegador.');
  }

  const dateStamp = new Date().toISOString().slice(0, 10);
  const fileName = `progreso-habitos-finanzas-${dateStamp}.json`;
  const blob = new BlobCtor([serializedBackup], { type: 'application/json' });
  const url = urlApi.createObjectURL(blob);
  const link = documentRef.createElement('a');
  link.href = url;
  link.download = fileName;
  documentRef.body?.appendChild(link);
  link.click();
  if (link.parentNode) {
    link.parentNode.removeChild(link);
  }
  urlApi.revokeObjectURL?.(url);
};

const readBackupFileFromWeb = async (): Promise<string | null> => {
  const documentRef = (globalThis as { document?: any }).document;

  if (!documentRef?.createElement) {
    throw new Error('No se pudo abrir el selector de archivos.');
  }

  return new Promise((resolve, reject) => {
    const input = documentRef.createElement('input');
    input.type = 'file';
    input.accept = '.json,application/json';
    input.style.display = 'none';

    const cleanup = () => {
      if (input.parentNode) {
        input.parentNode.removeChild(input);
      }
    };

    input.onchange = async () => {
      const file = input.files?.[0];
      cleanup();
      if (!file) {
        resolve(null);
        return;
      }

      try {
        const fileContent = await file.text();
        resolve(fileContent);
      } catch (error) {
        reject(error);
      }
    };

    input.oncancel = () => {
      cleanup();
      resolve(null);
    };

    documentRef.body?.appendChild(input);
    input.click();
  });
};

export const ProfileScreen = () => {
  const authSession = useAppStore((state) => state.authSession);
  const syncSummary = useAppStore((state) => state.syncSummary);
  const flushCloudSync = useAppStore((state) => state.flushCloudSync);
  const signOut = useAppStore((state) => state.signOut);
  const profile = useAppStore((state) => state.profile);
  const achievements = useAppStore((state) => state.achievements);
  const updateProfile = useAppStore((state) => state.updateProfile);
  const buyAvatarItem = useAppStore((state) => state.buyAvatarItem);
  const updateAvatar = useAppStore((state) => state.updateAvatar);
  const useStreakFreeze = useAppStore((state) => state.useStreakFreeze);
  const exportBackup = useAppStore((state) => state.exportBackup);
  const importBackup = useAppStore((state) => state.importBackup);
  const showToast = useUiStore((state) => state.showToast);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [income, setIncome] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [currency, setCurrency] = useState('COP');
  const [avatarColor, setAvatarColor] = useState('#0f766e');
  const [avatarItem, setAvatarItem] = useState('seedling');
  const [hour, setHour] = useState('20');
  const [minute, setMinute] = useState('00');
  const [isSaving, setIsSaving] = useState(false);
  const [isScheduling, setIsScheduling] = useState(false);
  const [isBackupLoading, setIsBackupLoading] = useState(false);
  const [appEvents, setAppEvents] = useState<AppEvent[]>([]);
  const [reminderStatus, setReminderStatus] = useState<HabitReminderStatus>({
    supported: Platform.OS !== 'web',
    enabled: false,
    message:
      Platform.OS === 'web'
        ? 'Recordatorios nativos no disponibles en web.'
        : 'Consultando estado de recordatorios...',
  });

  useEffect(() => {
    if (!profile) {
      return;
    }
    setName(profile.name);
    setObjective(profile.objective);
    setIncome(String(profile.monthlyIncome || ''));
    setSavingsGoal(String(profile.monthlySavingsGoal || ''));
    setCurrency(profile.currency);
    setAvatarColor(profile.avatarColor);
    setAvatarItem(profile.avatarItem);
  }, [profile]);

  useEffect(() => {
    void (async () => {
      const status = await getHabitReminderStatus();
      setReminderStatus(status);
    })();
    setAppEvents(listRecentAppEvents(12));
  }, []);

  const refreshAppEvents = () => {
    setAppEvents(listRecentAppEvents(12));
  };

  const onSave = async () => {
    const result = profileSchema.safeParse({
      name,
      objective,
      monthlyIncome: income,
      monthlySavingsGoal: savingsGoal,
      currency,
      avatarColor,
      avatarItem,
    });

    if (!result.success) {
      showToast(getValidationMessage(result.error), 'error');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile({
        name: result.data.name,
        objective: result.data.objective,
        monthlyIncome: result.data.monthlyIncome,
        monthlySavingsGoal: result.data.monthlySavingsGoal,
        currency: result.data.currency,
        avatarColor: result.data.avatarColor,
        avatarItem: result.data.avatarItem,
      });
      showToast('Perfil actualizado.', 'success');
      refreshAppEvents();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo guardar.',
        'error',
      );
    } finally {
      setIsSaving(false);
    }
  };

  const onScheduleReminder = async () => {
    const result = reminderTimeSchema.safeParse({
      hour,
      minute,
    });

    if (!result.success) {
      showToast(getValidationMessage(result.error), 'error');
      return;
    }

    setIsScheduling(true);
    try {
      const response = await scheduleDailyHabitReminder(
        result.data.hour,
        result.data.minute,
      );
      showToast(response.message, response.ok ? 'success' : 'error');
      const status = await getHabitReminderStatus();
      setReminderStatus(status);
      refreshAppEvents();
    } finally {
      setIsScheduling(false);
    }
  };

  const onDisableReminder = async () => {
    setIsScheduling(true);
    try {
      const response = await disableHabitReminder();
      showToast(response.message, response.ok ? 'info' : 'error');
      const status = await getHabitReminderStatus();
      setReminderStatus(status);
      refreshAppEvents();
    } finally {
      setIsScheduling(false);
    }
  };

  const onUseStreakFreeze = async () => {
    const result = await useStreakFreeze();
    showToast(result.message, result.ok ? 'success' : 'error');
    refreshAppEvents();
  };

  const onSelectAvatarItem = async (itemId: string, cost: number) => {
    const alreadyOwned = profile?.ownedAvatarItems.includes(itemId) ?? false;
    if (!alreadyOwned && cost > 0) {
      const purchased = await buyAvatarItem(itemId, cost);
      if (!purchased) {
        showToast('No tienes monedas suficientes para comprar este item.', 'error');
        return;
      }
      showToast(`Item ${itemId} comprado.`, 'success');
    }

    try {
      await updateAvatar(avatarColor, itemId);
      setAvatarItem(itemId);
      showToast(`Item ${itemId} equipado.`, 'success');
      refreshAppEvents();
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo equipar el item.',
        'error',
      );
    }
  };

  const onSaveProgress = async () => {
    setIsBackupLoading(true);
    try {
      const serializedBackup = await exportBackup();

      if (Platform.OS === 'web') {
        triggerBackupDownloadOnWeb(serializedBackup);
        showToast('Progreso guardado en un archivo.', 'success');
        refreshAppEvents();
      } else {
        showToast('Progreso guardado localmente.', 'success');
        refreshAppEvents();
      }
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo guardar progreso.',
        'error',
      );
    } finally {
      setIsBackupLoading(false);
    }
  };

  const onRestoreProgress = async () => {
    if (Platform.OS !== 'web') {
      showToast('Restaurar archivo solo esta habilitado en web.', 'info');
      return;
    }

    setIsBackupLoading(true);
    try {
      const serializedBackup = await readBackupFileFromWeb();
      if (!serializedBackup) {
        showToast('No seleccionaste ningun archivo.', 'info');
        return;
      }

      await importBackup(serializedBackup);
      showToast('Progreso restaurado correctamente.', 'success');
      refreshAppEvents();
    } catch (error) {
      showToast(
        error instanceof Error
          ? error.message
          : 'No se pudo restaurar el progreso.',
        'error',
      );
    } finally {
      setIsBackupLoading(false);
    }
  };

  const onFlushSync = async () => {
    const result = await flushCloudSync();
    showToast(result.message, result.ok ? 'success' : 'info');
    refreshAppEvents();
  };

  const onSignOut = async () => {
    await signOut();
    showToast('Sesion cerrada.', 'info');
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Perfil y progreso</Text>
        <Text style={styles.subtitle}>
          Nivel {profile?.level ?? 1} - XP {profile?.xp ?? 0}
        </Text>
      </View>

      <SectionCard>
        <View style={styles.avatarCard}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{avatarItem.slice(0, 2).toUpperCase()}</Text>
          </View>
          <Text style={styles.avatarLabel}>Avatar mini personalizable</Text>
          <Text style={styles.avatarMeta}>
            Monedas: {profile?.coins ?? 0} | Comodines racha: {profile?.streakFreezes ?? 0}
          </Text>
        </View>
      </SectionCard>

      <SectionCard title="Datos personales">
        <AppInput
          label="Nombre"
          placeholder="Tu nombre"
          value={name}
          onChangeText={setName}
        />
        <AppInput
          label="Objetivo"
          placeholder="Ej: ahorrar e invertir"
          value={objective}
          onChangeText={setObjective}
        />
        <AppInput
          label="Ingreso mensual"
          placeholder="0"
          keyboardType="numeric"
          value={income}
          onChangeText={setIncome}
        />
        <AppInput
          label="Meta de ahorro mensual"
          placeholder="0"
          keyboardType="numeric"
          value={savingsGoal}
          onChangeText={setSavingsGoal}
        />
        <AppInput
          label="Moneda"
          placeholder="COP"
          value={currency}
          onChangeText={setCurrency}
          autoCapitalize="characters"
        />
      </SectionCard>

      <SectionCard title="Personalizacion">
        <View style={styles.block}>
          <Text style={styles.blockTitle}>Color del avatar</Text>
          <View style={styles.row}>
            {avatarColors.map((color) => (
              <Pressable
                key={color}
                style={[
                  styles.colorDot,
                  { backgroundColor: color },
                  avatarColor === color && styles.colorDotSelected,
                ]}
                onPress={() => setAvatarColor(color)}
              />
            ))}
          </View>
        </View>

        <View style={styles.block}>
          <Text style={styles.blockTitle}>Tienda de items (cosmeticos)</Text>
          <View style={styles.row}>
            {avatarShopCatalog.map((item) => (
              <Pressable
                key={item.id}
                style={[
                  styles.itemChip,
                  avatarItem === item.id && styles.itemChipSelected,
                ]}
                onPress={() => void onSelectAvatarItem(item.id, item.cost)}
              >
                <Text
                  style={[
                    styles.itemChipText,
                    avatarItem === item.id && styles.itemChipTextSelected,
                  ]}
                >
                  {item.id}
                </Text>
                <Text
                  style={[
                    styles.itemPrice,
                    avatarItem === item.id
                      ? styles.itemPriceEquipped
                      : profile?.ownedAvatarItems.includes(item.id)
                        ? styles.itemPriceOwned
                        : styles.itemPriceLocked,
                  ]}
                >
                  {avatarItem === item.id
                    ? 'Equipado'
                    : profile?.ownedAvatarItems.includes(item.id)
                      ? 'Disponible'
                      : `${item.cost} monedas`}
                </Text>
              </Pressable>
            ))}
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Recordatorio diario">
        <View
          style={[
            styles.statusRow,
            !reminderStatus.supported && styles.statusRowNeutral,
            reminderStatus.supported &&
              !reminderStatus.enabled &&
              styles.statusRowWarning,
          ]}
        >
          <View
            style={[
              styles.statusDot,
              !reminderStatus.supported && styles.statusDotMuted,
              reminderStatus.supported &&
                !reminderStatus.enabled &&
                styles.statusDotWarning,
            ]}
          />
          <View style={styles.statusTextBlock}>
            <Text style={styles.statusTitle}>
              {reminderStatus.supported
                ? reminderStatus.enabled
                  ? 'Recordatorio activo'
                  : 'Recordatorio inactivo'
                : 'Recordatorio no disponible'}
            </Text>
            <Text style={styles.statusBody}>{reminderStatus.message}</Text>
          </View>
        </View>
        <View style={styles.row}>
          <AppInput
            label="Hora"
            placeholder="20"
            keyboardType="number-pad"
            value={hour}
            onChangeText={setHour}
            style={styles.timeInput}
          />
          <AppInput
            label="Minuto"
            placeholder="00"
            keyboardType="number-pad"
            value={minute}
            onChangeText={setMinute}
            style={styles.timeInput}
          />
        </View>
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppButton
              onPress={onScheduleReminder}
              loading={isScheduling}
              disabled={!reminderStatus.supported}
            >
              Activar recordatorio
            </AppButton>
          </View>
          <View style={styles.flex}>
            <AppButton
              onPress={onDisableReminder}
              variant="secondary"
              disabled={isScheduling || !reminderStatus.supported}
            >
              Desactivar
            </AppButton>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Logros y progreso">
        {achievements.map((achievement) => (
          <View key={achievement.id} style={styles.achievementRow}>
            <Text
              style={[
                styles.achievementDot,
                achievement.unlocked ? styles.achievementOn : styles.achievementOff,
              ]}
            >
              {achievement.unlocked ? '[OK]' : '[ ]'}
            </Text>
            <View style={styles.achievementText}>
              <Text style={styles.achievementTitle}>{achievement.title}</Text>
              <Text style={styles.achievementDescription}>
                {achievement.description}
              </Text>
            </View>
          </View>
        ))}
      </SectionCard>

      <SectionCard title="Guardado de progreso">
        <View style={styles.statusRow}>
          <View style={styles.statusDot} />
          <View style={styles.statusTextBlock}>
            <Text style={styles.statusTitle}>Guardado automatico activo</Text>
            <Text style={styles.statusBody}>
              Cada cambio queda guardado en este navegador. Usa un archivo solo para mover tu
              progreso a otro equipo.
            </Text>
          </View>
        </View>
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppButton onPress={onSaveProgress} loading={isBackupLoading}>
              Guardar progreso
            </AppButton>
          </View>
          <View style={styles.flex}>
            <AppButton
              onPress={onRestoreProgress}
              variant="secondary"
              disabled={isBackupLoading}
            >
              Restaurar progreso
            </AppButton>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Sesion y sincronizacion">
        <Text style={styles.statusBody}>
          Sesion: {authSession ? `${authSession.email} (${authSession.provider})` : 'sin sesion'}
        </Text>
        <Text style={styles.statusBody}>
          Cola sync: pendientes {syncSummary.pending}, sincronizados {syncSummary.synced}, fallidos{' '}
          {syncSummary.failed}
        </Text>
        <Text style={styles.statusBody}>
          Estado: {syncSummary.lastStatus}
          {syncSummary.lastSyncedAt
            ? ` | Ultima sync: ${syncSummary.lastSyncedAt.slice(0, 19).replace('T', ' ')}`
            : ''}
        </Text>
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppButton onPress={onFlushSync} variant="secondary">
              Sincronizar ahora
            </AppButton>
          </View>
          <View style={styles.flex}>
            <AppButton onPress={onSignOut} variant="secondary">
              Cerrar sesion
            </AppButton>
          </View>
        </View>
      </SectionCard>

      <SectionCard title="Actividad del sistema">
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppButton onPress={refreshAppEvents} variant="secondary">
              Recargar actividad
            </AppButton>
          </View>
          <View style={styles.flex}>
            <AppButton
              onPress={() => {
                clearAppEvents();
                refreshAppEvents();
                showToast('Actividad limpiada.', 'info');
              }}
              variant="secondary"
            >
              Limpiar
            </AppButton>
          </View>
        </View>
        {appEvents.length === 0 ? (
          <Text style={styles.statusBody}>
            Aun no hay eventos registrados.
          </Text>
        ) : (
          appEvents.map((event) => (
            <View key={event.id} style={styles.achievementRow}>
              <Text
                style={[
                  styles.achievementDot,
                  event.level === 'error'
                    ? styles.achievementError
                    : event.level === 'warn'
                      ? styles.achievementWarn
                      : styles.achievementOn,
                ]}
              >
                {event.level === 'error' ? '[!]' : event.level === 'warn' ? '[~]' : '[OK]'}
              </Text>
              <View style={styles.achievementText}>
                <Text style={styles.achievementTitle}>{event.name}</Text>
                <Text style={styles.achievementDescription}>
                  {event.createdAt.slice(0, 19).replace('T', ' ')}
                </Text>
              </View>
            </View>
          ))
        )}
      </SectionCard>

      <SectionCard title="Soporte de racha">
        <Text style={styles.statusBody}>
          Si tuviste un dia dificil, puedes usar un comodin para proteger tu racha.
        </Text>
        <AppButton onPress={onUseStreakFreeze} variant="secondary">
          Usar comodin de racha
        </AppButton>
      </SectionCard>

      <AppButton onPress={onSave} loading={isSaving}>
        Guardar perfil
      </AppButton>
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
  avatarCard: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatar: {
    width: 76,
    height: 76,
    borderRadius: 38,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 20,
    fontWeight: '800',
  },
  avatarLabel: {
    color: colors.mutedText,
    fontSize: 12,
  },
  avatarMeta: {
    color: colors.text,
    fontSize: 12,
    fontWeight: '700',
  },
  block: {
    gap: spacing.sm,
  },
  blockTitle: {
    color: colors.text,
    fontWeight: '700',
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  flex: {
    flex: 1,
  },
  colorDot: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  colorDotSelected: {
    borderColor: '#111',
  },
  itemChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.sm,
    paddingVertical: 7,
    paddingHorizontal: 12,
    backgroundColor: colors.surface,
  },
  itemChipSelected: {
    borderColor: colors.primary,
    backgroundColor: colors.primarySoft,
  },
  itemChipText: {
    color: colors.mutedText,
  },
  itemChipTextSelected: {
    color: colors.text,
    fontWeight: '700',
  },
  itemPrice: {
    color: colors.mutedText,
    fontSize: 11,
    marginTop: 2,
  },
  itemPriceEquipped: {
    color: colors.primary,
    fontWeight: '700',
  },
  itemPriceOwned: {
    color: colors.success,
    fontWeight: '700',
  },
  itemPriceLocked: {
    color: colors.warning,
  },
  timeInput: {
    minWidth: 90,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    borderRadius: radius.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#f5fbf8',
    padding: spacing.sm,
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginTop: 4,
    backgroundColor: colors.success,
  },
  statusDotWarning: {
    backgroundColor: colors.warning,
  },
  statusDotMuted: {
    backgroundColor: colors.mutedText,
  },
  statusRowWarning: {
    backgroundColor: '#fff9f2',
  },
  statusRowNeutral: {
    backgroundColor: '#f4f7f6',
  },
  statusTextBlock: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  statusBody: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  achievementRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    paddingTop: spacing.sm,
  },
  achievementDot: {
    fontSize: 12,
    lineHeight: 20,
    width: 36,
  },
  achievementOn: {
    color: colors.success,
  },
  achievementOff: {
    color: colors.mutedText,
  },
  achievementWarn: {
    color: colors.warning,
  },
  achievementError: {
    color: colors.danger,
  },
  achievementText: {
    flex: 1,
  },
  achievementTitle: {
    color: colors.text,
    fontWeight: '700',
    fontSize: 13,
  },
  achievementDescription: {
    color: colors.mutedText,
    fontSize: 12,
  },
});
