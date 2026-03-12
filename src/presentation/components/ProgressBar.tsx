import { StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../shared/theme/tokens';
import { clamp } from '../../shared/utils/formatters';

interface Props {
  label: string;
  value: number;
}

export const ProgressBar = ({ label, value }: Props) => {
  const safeValue = clamp(value, 0, 100);
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.label}>{safeValue.toFixed(0)}%</Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${safeValue}%` }]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  label: {
    fontSize: 12,
    color: colors.mutedText,
    fontWeight: '600',
  },
  track: {
    height: 10,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: colors.primary,
  },
});
