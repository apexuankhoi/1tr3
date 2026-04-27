import "./global.css";
import React, { useEffect } from "react";
import { View } from "react-native";
import { StatusBar } from "expo-status-bar";
import * as SplashScreen from "expo-splash-screen";
import { NavigationContainer } from "@react-navigation/native";
import RootStack from "./src/navigation/RootStack";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { GlobalToast } from "./src/components/GlobalToast";
import { useGameStore } from "./src/store/useGameStore";
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming 
} from "react-native-reanimated";
import {
  useFonts,
  Nunito_400Regular,
  Nunito_600SemiBold,
  Nunito_700Bold,
  Nunito_800ExtraBold,
} from "@expo-google-fonts/nunito";

void SplashScreen.preventAutoHideAsync();

export default function App() {
  const shakeTrigger = useGameStore((state) => state.shakeTrigger);
  const translateX = useSharedValue(0);

  const [fontsLoaded] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  useEffect(() => {
    if (shakeTrigger > 0) {
      translateX.value = withSequence(
        withTiming(-8, { duration: 40 }),
        withTiming(8, { duration: 40 }),
        withTiming(-8, { duration: 40 }),
        withTiming(8, { duration: 40 }),
        withTiming(-8, { duration: 40 }),
        withTiming(8, { duration: 40 }),
        withTiming(0, { duration: 40 })
      );
    }
  }, [shakeTrigger]);

  const animatedStyle = useAnimatedStyle(() => ({
    flex: 1,
    transform: [{ translateX: translateX.value }]
  }));

  if (!fontsLoaded) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', justifyContent: 'center', alignItems: 'center' }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, borderWidth: 3, borderColor: '#154212', borderTopColor: 'transparent' }} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: '#fff' }}>
        <NavigationContainer>
          <StatusBar style="dark" />
          <RootStack />
        </NavigationContainer>
      </View>
    </SafeAreaProvider>
  );
}
