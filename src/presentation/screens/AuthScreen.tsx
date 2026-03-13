import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useAppStore } from '../../application/stores/useAppStore';
import { AppButton } from '../components/AppButton';
import { AppInput } from '../components/AppInput';
import { ScreenContainer } from '../components/ScreenContainer';
import { SectionCard } from '../components/SectionCard';
import { colors, spacing } from '../../shared/theme/tokens';
import { useUiStore } from '../stores/useUiStore';

export const AuthScreen = () => {
  const requestAuthCode = useAppStore((state) => state.requestAuthCode);
  const verifyAuthCode = useAppStore((state) => state.verifyAuthCode);
  const signInAsGuest = useAppStore((state) => state.signInAsGuest);
  const isAuthLoading = useAppStore((state) => state.isAuthLoading);
  const authPendingEmail = useAppStore((state) => state.authPendingEmail);
  const showToast = useUiStore((state) => state.showToast);

  const [email, setEmail] = useState(authPendingEmail);
  const [code, setCode] = useState('');

  const onRequestCode = async () => {
    const result = await requestAuthCode(email);
    showToast(
      result.ok
        ? `${result.message}${result.devCode ? ` Codigo local: ${result.devCode}` : ''}`
        : result.message,
      result.ok ? 'success' : 'error',
    );
  };

  const onVerifyCode = async () => {
    const result = await verifyAuthCode(email, code);
    showToast(result.message, result.ok ? 'success' : 'error');
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Inicia sesion</Text>
        <Text style={styles.subtitle}>
          Base comercial v1.3: autenticacion por correo y sesion local persistente.
        </Text>
      </View>

      <SectionCard title="Acceso por correo">
        <AppInput
          label="Correo"
          placeholder="tu-correo@dominio.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          value={email}
          onChangeText={setEmail}
          hint="En esta version prototipo mostramos codigo local para validar flujo."
        />
        <View style={styles.row}>
          <View style={styles.flex}>
            <AppButton onPress={() => void onRequestCode()} loading={isAuthLoading}>
              Enviar codigo
            </AppButton>
          </View>
        </View>
        <AppInput
          label="Codigo de 6 digitos"
          placeholder="123456"
          keyboardType="number-pad"
          value={code}
          onChangeText={setCode}
        />
        <AppButton onPress={() => void onVerifyCode()} loading={isAuthLoading}>
          Verificar y entrar
        </AppButton>
      </SectionCard>

      <SectionCard title="Modo invitado">
        <Text style={styles.guestBody}>
          Puedes continuar como invitado para probar la app sin correo.
        </Text>
        <AppButton
          onPress={() => {
            void (async () => {
              await signInAsGuest();
              showToast('Sesion de invitado iniciada.', 'info');
            })();
          }}
          variant="secondary"
          loading={isAuthLoading}
        >
          Continuar como invitado
        </AppButton>
      </SectionCard>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    gap: 4,
  },
  title: {
    color: colors.text,
    fontSize: 28,
    fontWeight: '900',
  },
  subtitle: {
    color: colors.mutedText,
    fontSize: 13,
    lineHeight: 19,
  },
  guestBody: {
    color: colors.mutedText,
    fontSize: 12,
    lineHeight: 18,
  },
  row: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  flex: {
    flex: 1,
  },
});

