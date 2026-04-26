import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function TaskCard({ title, reward, description, iconName, isPrimary, onPress }: any) {
  return (
    <View style={st.card}>
      <View style={st.iconWrap}>
        <MaterialCommunityIcons name={iconName as any} size={32} color="#154212" />
      </View>
      <Text style={st.title}>{title}</Text>
      <View style={st.rewardPill}>
        <MaterialCommunityIcons name="star-four-points" size={16} color="#fff" />
        <Text style={st.rewardText}>+{reward} xu</Text>
      </View>
      <Text style={st.desc}>{description}</Text>
      <TouchableOpacity 
        style={[st.btn, isPrimary ? st.btnPrimary : st.btnSecondary]} 
        onPress={onPress} 
        activeOpacity={0.85}
      >
        <Text style={[st.btnText, isPrimary ? st.btnTextPrimary : st.btnTextSecondary]}>
          Thực hiện
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 24, padding: 24, marginBottom: 24, alignItems: "center", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, borderWidth: 1, borderColor: "#f3f4f6" },
  iconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  title: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#111827", marginBottom: 12, textAlign: "center" },
  rewardPill: { backgroundColor: "#154212", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, marginBottom: 16 },
  rewardText: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 14 },
  desc: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#6b7280", textAlign: "center", lineHeight: 20, marginBottom: 24 },
  btn: { width: "100%", paddingVertical: 16, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  btnPrimary: { backgroundColor: "#154212" },
  btnSecondary: { backgroundColor: "#f3f4f6" },
  btnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 16 },
  btnTextPrimary: { color: "#fff" },
  btnTextSecondary: { color: "#154212" },
});
