import type { PropsWithChildren } from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native';
import { colors, radius, spacing } from '../../shared/theme/tokens';

type ButtonVariant = 'primary' | 'secondary';

interface Props extends PropsWithChildren {
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
}

export const AppButton = ({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  loading = false,
}: Props) => {
  const isPrimary = variant === 'primary';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.base,
        isPrimary ? styles.primary : styles.secondary,
        isDisabled && styles.disabled,
      ]}
      disabled={isDisabled}
    >
      {loading ? (
        <ActivityIndicator color={isPrimary ? '#ffffff' : colors.primary} />
      ) : (
        <Text style={[styles.text, isPrimary ? styles.textPrimary : styles.textSecondary]}>
          {children}
        </Text>
      )}
    </Pressable>
  );
};

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.md,
    paddingVertical: spacing.sm + 2,
    alignItems: 'center',
    borderWidth: 1,
  },
  primary: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.surface,
    borderColor: colors.borderStrong,
  },
  disabled: {
    opacity: 0.65,
  },
  text: {
    fontWeight: '700',
    fontSize: 14,
  },
  textPrimary: {
    color: '#ffffff',
  },
  textSecondary: {
    color: colors.text,
  },
});
