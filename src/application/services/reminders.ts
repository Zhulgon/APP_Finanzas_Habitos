import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

let handlerConfigured = false;

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

const ensurePermissions = async (): Promise<boolean> => {
  const permissions = await Notifications.getPermissionsAsync();
  if (permissions.granted) {
    return true;
  }
  const requested = await Notifications.requestPermissionsAsync();
  return requested.granted;
};

export const scheduleDailyHabitReminder = async (
  hour: number,
  minute: number,
): Promise<{ ok: boolean; message: string }> => {
  if (Platform.OS === 'web') {
    return {
      ok: false,
      message: 'Las notificaciones locales no estan disponibles en web.',
    };
  }

  ensureHandler();

  const granted = await ensurePermissions();
  if (!granted) {
    return {
      ok: false,
      message: 'Permiso de notificaciones denegado.',
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

  return {
    ok: true,
    message: `Recordatorio activo a las ${String(hour).padStart(2, '0')}:${String(
      minute,
    ).padStart(2, '0')}.`,
  };
};

export const disableHabitReminder = async (): Promise<{ ok: boolean; message: string }> => {
  if (Platform.OS === 'web') {
    return {
      ok: false,
      message: 'Las notificaciones locales no estan disponibles en web.',
    };
  }
  await Notifications.cancelAllScheduledNotificationsAsync();
  return {
    ok: true,
    message: 'Recordatorios desactivados.',
  };
};
