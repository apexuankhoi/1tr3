import React from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet } from "react-native";
import QRCode from "react-native-qrcode-svg";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameStore } from "../store/useGameStore";

interface QRModalProps {
  visible: boolean;
  qrCode: string;
  itemName: string;
  onClose: () => void;
}

export default function QRModal({ visible, qrCode, itemName, onClose }: QRModalProps) {
  const t = useGameStore(s => s.t);
  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={st.overlay}>
        <View style={st.card}>
          <View style={st.pill} />
          
          <Text style={st.title}>{t('qr.title')}</Text>
          <Text style={st.subtitle}>
            {t('qr.receive_gift')} <Text style={st.highlight}>{itemName}</Text>
          </Text>

          <View style={st.qrBox}>
            <QRCode value={qrCode || t('qr.empty_placeholder')} size={200} color="#154212" />
          </View>

          <View style={st.infoBox}>
            <MaterialCommunityIcons name="information-outline" size={20} color="#6f5a53" />
            <Text style={st.infoText}>
              {t('qr.usage_limit')}
            </Text>
          </View>

          <TouchableOpacity onPress={onClose} activeOpacity={0.85} style={st.btn}>
            <Text style={st.btnText}>{t('qr.complete')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: {
    flex: 1, backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "flex-end", // Slide from bottom
  },
  card: {
    backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32,
    padding: 30, alignItems: "center", paddingBottom: 50,
  },
  pill: { width: 50, height: 5, backgroundColor: "#e5e7eb", borderRadius: 3, marginBottom: 20 },
  title: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#111827", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#6b7280", textAlign: "center", marginBottom: 24 },
  highlight: { color: "#154212", fontFamily: "Nunito_800ExtraBold" },
  qrBox: {
    padding: 24, backgroundColor: "#fff", borderRadius: 24,
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 15, shadowOffset: { width: 0, height: 8 },
    elevation: 6, marginBottom: 30, borderWidth: 1, borderColor: "#f3f4f6",
  },
  infoBox: {
    flexDirection: "row", alignItems: "center", backgroundColor: "#fef3c7",
    padding: 16, borderRadius: 16, marginBottom: 30, width: "100%", gap: 10,
  },
  infoText: { flex: 1, fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#92400e" },
  btn: { width: "100%", backgroundColor: "#154212", paddingVertical: 16, borderRadius: 20, alignItems: "center" },
  btnText: { color: "#fff", fontSize: 16, fontFamily: "Nunito_800ExtraBold" },
});
