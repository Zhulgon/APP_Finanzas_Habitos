import { NavigationContainer } from '@react-navigation/native';
import { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../application/stores/useAppStore';
import { RootNavigator } from './navigation/RootNavigator';
import { LoadingScreen } from '../presentation/screens/LoadingScreen';
import { ToastHost } from '../presentation/components/ToastHost';
import { colors } from '../shared/theme/tokens';

export const AppRoot = () => {
  const bootstrap = useAppStore((state) => state.bootstrap);
  const isBootstrapping = useAppStore((state) => state.isBootstrapping);
  const error = useAppStore((state) => state.error);

  useEffect(() => {
    void bootstrap();
  }, [bootstrap]);

  if (isBootstrapping) {
    return <LoadingScreen />;
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Error de inicializacion</Text>
        <Text style={styles.errorBody}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <ToastHost />
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.background,
    padding: 24,
    gap: 8,
  },
  errorTitle: {
    fontSize: 18,
    color: colors.danger,
    fontWeight: '800',
  },
  errorBody: {
    fontSize: 13,
    color: colors.mutedText,
    textAlign: 'center',
  },
});
