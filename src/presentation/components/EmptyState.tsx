import { StyleSheet, Text, View } from 'react-native';
import { colors, radius, spacing } from '../../shared/theme/tokens';

interface Props {
  title: string;
  body: string;
}

export const EmptyState = ({ title, body }: Props) => {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.body}>{body}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    color: colors.text,
    fontWeight: '700',
  },
  body: {
    color: colors.mutedText,
    lineHeight: 18,
  },
});
