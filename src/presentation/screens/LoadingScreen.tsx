import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { colors } from '../../shared/theme/tokens';

export const LoadingScreen = () => {
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.text}>Inicializando tu app personal...</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    gap: 12,
  },
  text: {
    color: colors.mutedText,
    fontSize: 14,
  },
});
