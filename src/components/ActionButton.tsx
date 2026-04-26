import React from "react";
import { TouchableOpacity, Text, StyleSheet, ViewStyle } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface ActionButtonProps {
  title: string;
  iconName?: string;
  onPress: () => void;
  style?: ViewStyle;
}

export default function ActionButton({ title, iconName, onPress, style }: ActionButtonProps) {
  return (
    <TouchableOpacity activeOpacity={0.85} onPress={onPress} style={[st.btn, style]}>
      {!!iconName && <MaterialCommunityIcons name={iconName as any} size={24} color="#fff" />}
      <Text style={st.text}>{title}</Text>
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  btn: {
    backgroundColor: "#154212",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    width: "100%",
    maxWidth: 300,
    elevation: 8,
    shadowColor: "#154212",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
  },
  text: {
    color: "#fff",
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 18,
  },
});
