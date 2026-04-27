import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, Platform } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameStore } from "../store/useGameStore";

interface FeedbackPopupProps {
  visible: boolean;
  type: "success" | "error";
  title: string;
  message: string;
  onClose: () => void;
}

export default function FeedbackPopup({ visible, type, title, message, onClose }: FeedbackPopupProps) {
  const isSuccess = type === "success";
  const t = useGameStore(s => s.t);
  
  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={st.overlay}>
        <View style={st.card}>
          <View style={[st.iconWrap, { backgroundColor: isSuccess ? "#dcfce7" : "#fee2e2" }]}>
            <MaterialCommunityIcons 
              name={isSuccess ? "check-decagram" : "alert-circle"} 
              size={48} 
              color={isSuccess ? "#10b981" : "#ef4444"} 
            />
          </View>
          
          <Text style={st.title}>{title}</Text>
          <Text style={st.message}>{message}</Text>
          
          <TouchableOpacity 
            onPress={onClose} 
            activeOpacity={0.85}
            style={[st.btn, { backgroundColor: isSuccess ? "#154212" : "#ef4444" }]}
          >
            <Text style={st.btnText}>{t('common.close')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", alignItems: "center", justifyContent: "center", paddingHorizontal: 24 },
  card: { width: "100%", backgroundColor: "#fff", borderRadius: 32, padding: 32, alignItems: "center", ...Platform.select({ ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20, shadowOffset: { width: 0, height: 10 } }, android: { elevation: 10 } }) },
  iconWrap: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 24 },
  title: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#111827", marginBottom: 8, textAlign: "center" },
  message: { fontSize: 16, fontFamily: "Nunito_600SemiBold", color: "#6b7280", textAlign: "center", marginBottom: 32, lineHeight: 24 },
  btn: { width: "100%", paddingVertical: 16, borderRadius: 24, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Nunito_800ExtraBold" },
});
