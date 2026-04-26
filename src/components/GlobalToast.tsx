import React, { useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { MaterialCommunityIcons } from "@expo/vector-icons";
import Animated, { 
  FadeInDown, 
  FadeOutUp, 
  useSharedValue, 
  useAnimatedStyle, 
  withSequence, 
  withTiming,
  withSpring 
} from "react-native-reanimated";
import { useGameStore } from '../store/useGameStore';

export const GlobalToast = () => {
  const toast = useGameStore((state) => state.toast);
  const translateX = useSharedValue(0);

  useEffect(() => {
    if (toast?.type === 'error') {
      // Hiệu ứng rung lắc (Shake Animation)
      translateX.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    }
  }, [toast]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: translateX.value }]
  }));

  if (!toast) return null;

  return (
    <Animated.View 
      entering={FadeInDown.springify()} 
      exiting={FadeOutUp}
      style={styles.toastWrapper}
    >
      <Animated.View 
        style={[
          styles.toastContainer,
          {
            backgroundColor: toast.type === 'error' ? '#fee2e2' : '#f0fdf4',
            borderColor: toast.type === 'error' ? '#fecaca' : '#dcfce7',
          },
          animatedStyle
        ]}
      >
        <MaterialCommunityIcons 
          name={toast.type === 'error' ? "alert-circle" : "check-circle"} 
          size={24} 
          color={toast.type === 'error' ? "#ef4444" : "#22c55e"} 
        />
        <Text style={[
          styles.toastText,
          { color: toast.type === 'error' ? '#991b1b' : '#166534' }
        ]}>
          {toast.message}
        </Text>
      </Animated.View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  toastWrapper: {
    position: 'absolute',
    bottom: 50,
    left: 20,
    right: 20,
    zIndex: 9999,
  },
  toastContainer: {
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  toastText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: '700',
    flex: 1,
    fontFamily: 'Be Vietnam Pro',
  },
});
