import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { DashboardScreen } from '../../presentation/screens/DashboardScreen';
import { FinanceScreen } from '../../presentation/screens/FinanceScreen';
import { HabitsScreen } from '../../presentation/screens/HabitsScreen';
import { LearnScreen } from '../../presentation/screens/LearnScreen';
import { ProfileScreen } from '../../presentation/screens/ProfileScreen';
import { colors } from '../../shared/theme/tokens';

export type MainTabParamList = {
  Inicio: undefined;
  Habitos: undefined;
  Finanzas: undefined;
  Aprender: undefined;
  Perfil: undefined;
};

const Tab = createBottomTabNavigator<MainTabParamList>();

export const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.mutedText,
        tabBarStyle: {
          borderTopColor: colors.border,
          backgroundColor: colors.surface,
          height: 60,
          paddingTop: 6,
          paddingBottom: 6,
        },
        tabBarLabelStyle: {
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen name="Inicio" component={DashboardScreen} />
      <Tab.Screen name="Habitos" component={HabitsScreen} />
      <Tab.Screen name="Finanzas" component={FinanceScreen} />
      <Tab.Screen name="Aprender" component={LearnScreen} />
      <Tab.Screen name="Perfil" component={ProfileScreen} />
    </Tab.Navigator>
  );
};
