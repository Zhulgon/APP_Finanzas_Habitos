import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { onboardingSchema, getValidationMessage } from '../../application/validation/schemas';
import { ScreenContainer } from '../components/ScreenContainer';
import { colors, spacing } from '../../shared/theme/tokens';
import { useAppStore } from '../../application/stores/useAppStore';
import { AppInput } from '../components/AppInput';
import { AppButton } from '../components/AppButton';
import { SectionCard } from '../components/SectionCard';
import { useUiStore } from '../stores/useUiStore';

export const OnboardingScreen = () => {
  const finishOnboarding = useAppStore((state) => state.finishOnboarding);
  const showToast = useUiStore((state) => state.showToast);
  const [name, setName] = useState('');
  const [objective, setObjective] = useState('');
  const [income, setIncome] = useState('');
  const [savingsGoal, setSavingsGoal] = useState('');
  const [currency, setCurrency] = useState('COP');
  const [habit1, setHabit1] = useState('');
  const [habit2, setHabit2] = useState('');
  const [habit3, setHabit3] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const submit = async () => {
    const result = onboardingSchema.safeParse({
      name,
      objective,
      monthlyIncome: income,
      monthlySavingsGoal: savingsGoal,
      currency,
      initialHabits: [habit1, habit2, habit3],
    });

    if (!result.success) {
      showToast(getValidationMessage(result.error), 'error');
      return;
    }

    setIsSaving(true);
    try {
      await finishOnboarding({
        name: result.data.name,
        objective: result.data.objective,
        monthlyIncome: result.data.monthlyIncome,
        monthlySavingsGoal: result.data.monthlySavingsGoal,
        currency: result.data.currency,
        initialHabits: [habit1, habit2, habit3],
      });
      showToast('Perfil inicial listo. Bienvenido.', 'success');
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : 'No se pudo guardar.',
        'error',
      );
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScreenContainer>
      <View style={styles.header}>
        <Text style={styles.title}>Tu sistema personal</Text>
        <Text style={styles.subtitle}>
          Define habitos y una base financiera simple para comenzar.
        </Text>
      </View>

      <AppInput
        label="Nombre"
        placeholder="Tu nombre"
        value={name}
        onChangeText={setName}
      />
      <AppInput
        label="Objetivo principal"
        placeholder="Ej: ahorrar para viajar"
        value={objective}
        onChangeText={setObjective}
      />
      <AppInput
        label="Ingreso mensual"
        placeholder="0"
        keyboardType="numeric"
        value={income}
        onChangeText={setIncome}
      />
      <AppInput
        label="Meta de ahorro mensual"
        placeholder="0"
        keyboardType="numeric"
        value={savingsGoal}
        onChangeText={setSavingsGoal}
      />
      <AppInput
        label="Moneda"
        placeholder="COP"
        autoCapitalize="characters"
        value={currency}
        onChangeText={setCurrency}
      />

      <SectionCard title="Tus 3 habitos iniciales">
        <AppInput
          placeholder="Habito 1"
          value={habit1}
          onChangeText={setHabit1}
        />
        <AppInput
          placeholder="Habito 2"
          value={habit2}
          onChangeText={setHabit2}
        />
        <AppInput
          placeholder="Habito 3"
          value={habit3}
          onChangeText={setHabit3}
        />
      </SectionCard>

      <AppButton onPress={submit} loading={isSaving}>
        Comenzar
      </AppButton>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  header: {
    marginTop: spacing.xl,
    gap: spacing.xs,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.text,
  },
  subtitle: {
    fontSize: 14,
    color: colors.mutedText,
  },
});
