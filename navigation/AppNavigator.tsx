import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from "@react-navigation/native-stack";
import { Ionicons } from "@expo/vector-icons";

import DashboardScreen from "../screens/DashboardView";
import CompanyScreen from "../screens/CompanyScreen";
import TransactionsScreen from "../screens/TransactionsScreen";
import SettingsScreen from "../screens/SettingsScreen";
import { TouchableOpacity } from "react-native";
import StocksScreen from "../screens/StocksScreen";
import MarketPricesScreen from "../screens/MarketPricesScreen";

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function BottomTabs() {
  type NavigationProp = NativeStackNavigationProp<RootStackParamList, "Home">;

  const navigation = useNavigation<NavigationProp>();
  return (
    <Tab.Navigator
      initialRouteName="Dashboard"
      screenOptions={{
        tabBarShowLabel: false,
        headerTitleStyle: {
          fontSize: 20,
        },
        headerRight: () => (
          <TouchableOpacity
            onPress={() => navigation.navigate("Settings")}
            style={{ marginRight: 15 }}
          >
            <Ionicons name="settings-outline" size={25} />
          </TouchableOpacity>
        ),
        tabBarStyle: {
          height: 70,
          paddingTop: 13,
        },
      }}
    >
      <Tab.Screen
        name="Market"
        component={MarketPricesScreen}
        options={{
          title: "Market",
          tabBarIcon: ({ color }) => (
            <Ionicons name="analytics-outline" size={30} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <Ionicons name="home" size={30} color={color} />
          ),
        }}
      />
      <Tab.Screen
        name="Company"
        component={CompanyScreen}
        options={{
          title: "Companies",
          tabBarIcon: ({ color }) => (
            <Ionicons name="business-outline" size={25} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export type RootStackParamList = {
  Main: undefined;
  Transactions: undefined;
};

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={({ navigation }) => ({
          headerTitleStyle: {
            fontSize: 20,
          },
          headerRight: () => (
            <TouchableOpacity
              onPress={() => navigation.navigate("Settings")}
              style={{
                backgroundColor: "transparent",
                paddingLeft: 5,
              }}
            >
              <Ionicons name="settings-outline" size={25} />
            </TouchableOpacity>
          ),
        })}
      >
        <Stack.Screen
          name="Home"
          component={BottomTabs}
          options={{ headerShown: false }}
        />

        <Stack.Screen
          name="Transactions"
          component={TransactionsScreen}
          options={{
            title: "Transactions",
          }}
        />

        <Stack.Screen
          name="Stocks"
          component={StocksScreen}
          options={{
            title: "Stocks",
          }}
        />

        <Stack.Screen
          name="Settings"
          component={SettingsScreen}
          options={{
            title: "Settings",
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
