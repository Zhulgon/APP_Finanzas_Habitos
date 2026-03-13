import { useAppStore } from '../../application/stores/useAppStore';
import { AuthScreen } from '../../presentation/screens/AuthScreen';
import { OnboardingScreen } from '../../presentation/screens/OnboardingScreen';
import { MainTabs } from './MainTabs';

export const RootNavigator = () => {
  const authSession = useAppStore((state) => state.authSession);
  const profile = useAppStore((state) => state.profile);
  if (!authSession) {
    return <AuthScreen />;
  }
  const hasOnboarded = Boolean(profile?.name.trim());
  return hasOnboarded ? <MainTabs /> : <OnboardingScreen />;
};
