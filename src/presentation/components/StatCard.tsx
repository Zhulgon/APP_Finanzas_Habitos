import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../shared/theme/tokens';

interface Props {
  label: string;
  value: string;
  helper?: string;
}

export const StatCard = ({ label, value, helper }: Props) => {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={styles.value}>{value}</Text>
      {helper ? <Text style={styles.helper}>{helper}</Text> : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.xs,
  },
  label: {
    color: colors.mutedText,
    fontSize: 13,
  },
  value: {
    color: colors.text,
    fontSize: 24,
    fontWeight: '700',
  },
  helper: {
    color: colors.mutedText,
    fontSize: 12,
  },
});
