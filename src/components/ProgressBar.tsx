import React, { useEffect, useRef } from "react";
import { View, Text, Animated, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ProgressBarProps {
  label: string;
  progress: number;
  color?: string;
}

export default function ProgressBar({ label, progress, color = "#154212" }: ProgressBarProps) {
  const animatedWidth = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(animatedWidth, {
      toValue: progress,
      duration: 1000,
      useNativeDriver: false,
    }).start();
  }, [progress]);

  const widthStyle = animatedWidth.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={st.container}>
      <View style={st.topRow}>
        <View style={st.labelWrap}>
          <MaterialCommunityIcons name="trending-up" size={16} color={color} />
          <Text style={st.label}>{label}</Text>
        </View>
        <Text style={[st.pct, { color }]}>{Math.round(progress * 100)}%</Text>
      </View>
      
      <View style={st.barBg}>
        <Animated.View style={[st.barFill, { backgroundColor: color, width: widthStyle }]} />
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { width: "100%", marginBottom: 24 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 },
  labelWrap: { flexDirection: "row", alignItems: "center", gap: 6 },
  label: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#111827" },
  pct: { fontSize: 14, fontFamily: "Nunito_800ExtraBold" },
  barBg: { height: 10, width: "100%", backgroundColor: "#f3f4f6", borderRadius: 5, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 5 },
});
