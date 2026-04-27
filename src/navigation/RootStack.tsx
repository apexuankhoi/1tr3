import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import ReportScreen from "../screens/ReportScreen";
import CameraScreen from "../screens/CameraScreen";
import QuizScreen from "../screens/QuizScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import RegisterInfoScreen from "../screens/RegisterInfoScreen";
import { useGameStore } from "../store/useGameStore";

import { OnboardingOverlay } from "../components/OnboardingOverlay";

const Stack = createNativeStackNavigator();

export default function RootStack() {
  const { userName, fullName } = useGameStore();

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userName === "" || (userName !== "" && !fullName) ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="RegisterInfo" component={RegisterInfoScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={TabNavigator} />
          <Stack.Screen name="Report" component={ReportScreen} />
          <Stack.Screen name="Camera" component={CameraScreen} />
          <Stack.Screen name="Quiz" component={QuizScreen} />
          <Stack.Screen name="Map" component={require("../screens/MapScreen").default} />
          <Stack.Screen name="AdminTasks" component={require("../screens/AdminTasksScreen").default} />
          <Stack.Screen name="AdminLibrary" component={require("../screens/AdminLibraryScreen").default} />
          <Stack.Screen name="AdminShop" component={require("../screens/AdminShopScreen").default} />
          <Stack.Screen name="AdminDashboard" component={require("../screens/AdminDashboard").default} />
          <Stack.Screen name="AdminUsers" component={require("../screens/AdminUsersScreen").default} />
          <Stack.Screen name="ModDashboard" component={require("../screens/ModeratorDashboard").default} />
          <Stack.Screen name="QRScanner" component={require("../screens/QRScannerScreen").default} />
          <Stack.Screen name="Ranking" component={require("../screens/RankingScreen").default} />
          <Stack.Screen name="Library" component={require("../screens/LibraryScreen").default} />
        </>
      )}
    </Stack.Navigator>
  );
}
