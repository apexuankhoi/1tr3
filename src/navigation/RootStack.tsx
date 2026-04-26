import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TabNavigator from "./TabNavigator";
import ReportScreen from "../screens/ReportScreen";
import CameraScreen from "../screens/CameraScreen";
import QuizScreen from "../screens/QuizScreen";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import { useGameStore } from "../store/useGameStore";

const Stack = createNativeStackNavigator();

export default function RootStack() {
  const userName = useGameStore((state) => state.userName);

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {userName === "" ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
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
        </>
      )}
    </Stack.Navigator>
  );
}
