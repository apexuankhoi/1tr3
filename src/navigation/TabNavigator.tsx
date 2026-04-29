import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialIcons } from "@expo/vector-icons";
import { Platform } from "react-native";
import HomeScreen from "../screens/HomeScreen";
import TasksScreen from "../screens/TasksScreen";
import ShopScreen from "../screens/ShopScreen";
import LibraryScreen from "../screens/LibraryScreen";
import RankingScreen from "../screens/RankingScreen";
import ModeratorDashboard from "../screens/ModeratorDashboard";
import QRScannerScreen from "../screens/QRScannerScreen";
import ProfileScreen from "../screens/ProfileScreen";
import { useGameStore } from "../store/useGameStore";

const Tab = createBottomTabNavigator();

export default function TabNavigator() {
  const userRole = useGameStore((state) => state.userRole);
  /** Cùng subscribe `language` để đổi ngôn ngữ thì thanh tab re-render (chỉ `t` thì ref không đổi → nhãn bị kẹt). */
  const language = useGameStore((state) => state.language);
  const t = useGameStore((state) => state.t);

  const renderTabs = () => {
    if (userRole === 'admin') {
      return (
        <>
          <Tab.Screen name="AdminDashboard" component={require("../screens/AdminDashboard").default} options={{ tabBarLabel: t('profile.admin') }} />
          <Tab.Screen name="AdminTasks" component={require("../screens/AdminTasksScreen").default} options={{ tabBarLabel: t('tabs.tasks') }} />
          <Tab.Screen name="AdminLibrary" component={require("../screens/AdminLibraryScreen").default} options={{ tabBarLabel: t('tabs.library') }} />
          <Tab.Screen name="AdminMap" component={require("../screens/MapScreen").default} options={{ tabBarLabel: t('tabs.map') }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tabs.profile') }} />
        </>
      );
    } else if (userRole === 'moderator') {
      return (
        <>
          <Tab.Screen name="ModDashboard" component={ModeratorDashboard} options={{ tabBarLabel: t('profile.verify') }} />
          <Tab.Screen name="QR" component={QRScannerScreen} options={{ tabBarLabel: t('tabs.qr') }} />
          <Tab.Screen name="Ranking" component={RankingScreen} options={{ tabBarLabel: t('tabs.ranking') }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tabs.profile') }} />
        </>
      );
    } else {
      return (
        <>
          <Tab.Screen name="Home" component={HomeScreen} options={{ tabBarLabel: t('tabs.home') }} />
          <Tab.Screen name="Tasks" component={TasksScreen} options={{ tabBarLabel: t('tabs.tasks') }} />
          <Tab.Screen name="Shop" component={ShopScreen} options={{ tabBarLabel: t('tabs.shop') }} />
          <Tab.Screen name="Library" component={LibraryScreen} options={{ tabBarLabel: t('tabs.library') }} />
          <Tab.Screen name="Profile" component={ProfileScreen} options={{ tabBarLabel: t('tabs.profile') }} />
        </>
      );
    }
  };

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: true,
        tabBarStyle: {
          backgroundColor: "white",
          borderTopWidth: 2,
          borderTopColor: "#f5f5f4",
          height: Platform.OS === "ios" ? 90 : 70,
          paddingBottom: Platform.OS === "ios" ? 30 : 12,
          paddingTop: 12,
          borderTopLeftRadius: 40,
          borderTopRightRadius: 40,
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          shadowColor: "#2d5a27",
          shadowOffset: { width: 0, height: -10 },
          shadowOpacity: 0.12,
          shadowRadius: 40,
          elevation: 20,
        },
        tabBarActiveTintColor: "#154212",
        tabBarInactiveTintColor: "#a8a29e",
        tabBarLabelStyle: {
          fontFamily: "Nunito_700Bold",
          fontSize: 10,
          textTransform: "uppercase",
          letterSpacing: 1,
        },
        tabBarIcon: ({ color }) => {
          let iconName: any;
          if (route.name === "Home" || route.name === "ModDashboard" || route.name === "AdminDashboard") {
            iconName = "forest";
          } else if (route.name === "Tasks" || route.name === "Map" || route.name === "Users") {
            iconName = "checklist";
          } else if (route.name === "Shop" || route.name === "QR" || route.name === "Inventory") {
            iconName = "redeem";
          } else if (route.name === "Library" || route.name === "Reports") {
            iconName = "newspaper";
          } else if (route.name === "Ranking") {
            iconName = "leaderboard";
          } else if (route.name === "Profile") {
            iconName = "account-circle";
          } else {
            iconName = "circle";
          }
          return <MaterialIcons name={iconName} size={28} color={color} />;
        },
      })}
    >
      {renderTabs()}
    </Tab.Navigator>
  );
}
