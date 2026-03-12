import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../shared/theme/tokens';
import { useUiStore } from '../stores/useUiStore';

const toneColor = {
  success: '#166534',
  error: colors.danger,
  info: colors.primary,
};

export const ToastHost = () => {
  const toast = useUiStore((state) => state.toast);
  const hideToast = useUiStore((state) => state.hideToast);

  useEffect(() => {
    if (!toast) {
      return;
    }
    const timeout = setTimeout(() => {
      hideToast();
    }, 2300);
    return () => clearTimeout(timeout);
  }, [toast, hideToast]);

  if (!toast) {
    return null;
  }

  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[styles.card, { borderColor: toneColor[toast.tone] }]}>
        <Text style={[styles.text, { color: toneColor[toast.tone] }]}>
          {toast.message}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    bottom: 20,
    zIndex: 50,
  },
  card: {
    backgroundColor: colors.surface,
    borderWidth: 1.5,
    borderRadius: radius.md,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  text: {
    fontWeight: '700',
    fontSize: 13,
  },
});
