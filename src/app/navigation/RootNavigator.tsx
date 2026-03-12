import { useAppStore } from '../../application/stores/useAppStore';
import { OnboardingScreen } from '../../presentation/screens/OnboardingScreen';
import { MainTabs } from './MainTabs';

export const RootNavigator = () => {
  const profile = useAppStore((state) => state.profile);
  const hasOnboarded = Boolean(profile?.name.trim());
  return hasOnboarded ? <MainTabs /> : <OnboardingScreen />;
};
