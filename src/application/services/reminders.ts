import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

let handlerConfigured = false;
const REMINDER_STORAGE_KEY = 'app_habit_reminder_settings_v1';

export interface HabitReminderStatus {
  supported: boolean;
  enabled: boolean;
  hour?: number;
  minute?: number;
  message: string;
}

interface ReminderSettings {
  enabled: boolean;
  hour: number;
  minute: number;
  updatedAt: string;
}

const formatTime = (hour: number, minute: number): string => {
  return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
};

const isValidTime = (hour: number, minute: number): boolean => {
  return Number.isInteger(hour) && Number.isInteger(minute) && hour >= 0 && hour <= 23 && minute >= 0 && minute <= 59;
};

const readReminderSettings = (): ReminderSettings | null => {
  try {
    const raw = globalThis.localStorage?.getItem(REMINDER_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const parsed = JSON.parse(raw) as Partial<ReminderSettings>;
    if (!parsed.enabled || !isValidTime(parsed.hour ?? -1, parsed.minute ?? -1)) {
      return null;
    }
    return {
      enabled: true,
      hour: parsed.hour!,
      minute: parsed.minute!,
      updatedAt: parsed.updatedAt ?? new Date().toISOString(),
    };
  } catch {
    return null;
  }
};

const writeReminderSettings = (hour: number, minute: number): void => {
  try {
    const payload: ReminderSettings = {
      enabled: true,
      hour,
      minute,
      updatedAt: new Date().toISOString(),
    };
    globalThis.localStorage?.setItem(REMINDER_STORAGE_KEY, JSON.stringify(payload));
  } catch {
    // Ignora fallback de persistencia: el agendamiento ya quedo aplicado.
  }
};

const clearReminderSettings = (): void => {
  try {
    globalThis.localStorage?.removeItem(REMINDER_STORAGE_KEY);
  } catch {
    // Ignora fallback de persistencia.
  }
};

const ensureHandler = () => {
  if (handlerConfigured || Platform.OS === 'web') {
    return;
  }
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: false,
      shouldSetBadge: false,
      shouldShowBanner: true,
      shouldShowList: true,
    }),
  });
  handlerConfigured = true;
};

const ensurePermissions = async (): Promise<{
  granted: boolean;
  message?: string;
}> => {
  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted) {
    return { granted: true };
  }

  if (!permissions.canAskAgain) {
    return {
      granted: false,
      message: 'Debes habilitar notificaciones desde configuracion del dispositivo.',
    };
  }

  const requested = await Notifications.requestPermissionsAsync();
  if (requested.granted) {
    return { granted: true };
  }

  return {
    granted: false,
    message: 'Permiso de notificaciones denegado.',
  };
};

export const scheduleDailyHabitReminder = async (
  hour: number,
  minute: number,
): Promise<{ ok: boolean; message: string }> => {
  if (!isValidTime(hour, minute)) {
    return {
      ok: false,
      message: 'Hora invalida. Usa formato entre 00:00 y 23:59.',
    };
  }

  if (Platform.OS === 'web') {
    return {
      ok: false,
      message: 'Las notificaciones locales no estan disponibles en web.',
    };
  }

  ensureHandler();

  try {
    const permissionResult = await ensurePermissions();
    if (!permissionResult.granted) {
      return {
        ok: false,
        message: permissionResult.message ?? 'No fue posible activar notificaciones.',
      };
    }

    await Notifications.cancelAllScheduledNotificationsAsync();
    await Notifications.scheduleNotificationAsync({
      content: {
        title: 'Recordatorio de habitos',
        body: 'Registra tus habitos y revisa tu balance de hoy.',
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });

    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    if (scheduled.length === 0) {
      return {
        ok: false,
        message: 'No se pudo confirmar el recordatorio. Intenta nuevamente.',
      };
    }

    writeReminderSettings(hour, minute);
    return {
      ok: true,
      message: `Recordatorio activo a las ${formatTime(hour, minute)}.`,
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? `No se pudo activar el recordatorio: ${error.message}`
          : 'No se pudo activar el recordatorio.',
    };
  }
};

export const disableHabitReminder = async (): Promise<{ ok: boolean; message: string }> => {
  if (Platform.OS === 'web') {
    return {
      ok: false,
      message: 'Las notificaciones locales no estan disponibles en web.',
    };
  }

  try {
    await Notifications.cancelAllScheduledNotificationsAsync();
    clearReminderSettings();
    return {
      ok: true,
      message: 'Recordatorios desactivados.',
    };
  } catch (error) {
    return {
      ok: false,
      message:
        error instanceof Error
          ? `No se pudieron desactivar los recordatorios: ${error.message}`
          : 'No se pudieron desactivar los recordatorios.',
    };
  }
};

export const getHabitReminderStatus = async (): Promise<HabitReminderStatus> => {
  const settings = readReminderSettings();

  if (Platform.OS === 'web') {
    return {
      supported: false,
      enabled: false,
      message: settings
        ? `Recordatorios nativos no disponibles en web. Ultima hora configurada: ${formatTime(
            settings.hour,
            settings.minute,
          )}.`
        : 'Recordatorios nativos no disponibles en web.',
    };
  }

  try {
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    if (scheduled.length === 0) {
      clearReminderSettings();
      return {
        supported: true,
        enabled: false,
        message: 'No hay recordatorio activo.',
      };
    }

    if (settings) {
      return {
        supported: true,
        enabled: true,
        hour: settings.hour,
        minute: settings.minute,
        message: `Activo a las ${formatTime(settings.hour, settings.minute)}.`,
      };
    }

    return {
      supported: true,
      enabled: true,
      message: 'Recordatorio activo.',
    };
  } catch {
    return {
      supported: true,
      enabled: Boolean(settings),
      hour: settings?.hour,
      minute: settings?.minute,
      message: settings
        ? `Estado parcial. Ultima hora guardada: ${formatTime(settings.hour, settings.minute)}.`
        : 'No fue posible consultar el estado de recordatorios.',
    };
  }
};
