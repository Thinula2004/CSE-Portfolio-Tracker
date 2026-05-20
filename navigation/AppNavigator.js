import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Ionicons } from '@expo/vector-icons';

import DashboardScreen from '../screens/DashboardView';
import CompanyScreen from '../screens/CompanyScreen';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  return (
    <Tab.Navigator
    initialRouteName='Dashboard'
      screenOptions={{
        tabBarShowLabel: false,
        tabBarStyle: {
          height: 70,
          paddingTop: 13
        }
      }}
    >
      <Tab.Screen
        name="Charts"
        component={DashboardScreen}
        options={{
          title: 'Charts',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="bar-chart-outline"
              size={25}
              color={color}
            />
          )
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="home"
              size={30}
              color={color}
            />
          )
        }}
      />
      <Tab.Screen
        name="Company"
        component={CompanyScreen}
        options={{
          title: 'Company',
          tabBarIcon: ({ color }) => (
            <Ionicons
              name="business-outline"
              size={25}
              color={color}
            />
          )
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen
          name="Main"
          component={BottomTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Companies"
          component={CompanyScreen}
          options={{
            title: 'Companies'
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}