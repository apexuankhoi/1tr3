import React, { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import api from "../services/api";
import * as haptics from "expo-haptics";
import { useNavigation } from "@react-navigation/native";
import { useGameStore } from "../store/useGameStore";

export default function QRScannerScreen() {
  const navigation = useNavigation();
  const t = useGameStore(s => s.t);
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);

  if (!permission) {
    return <View style={st.container} />;
  }

  if (!permission.granted) {
    return (
      <View style={[st.container, st.center]}>
        <Text style={st.permissionText}>{t('qr.permission_title')}</Text>
        <TouchableOpacity onPress={requestPermission} style={st.permissionBtn}>
          <Text style={st.permissionBtnText}>{t('qr.permission_cta')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ type, data }: any) => {
    if (scanned) return;
    setScanned(true);
    haptics.impactAsync(haptics.ImpactFeedbackStyle.Medium);

    const { userId } = useGameStore.getState();
    try {
      const res = await api.post("moderator/collect", { qrCode: data, moderatorId: userId });
      haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
      Alert.alert(t('common.success'), res.data.message || t('shop.buy_success'), [
        { text: t('common.close'), onPress: () => setScanned(false) }
      ]);
    } catch (error: any) {
      haptics.notificationAsync(haptics.NotificationFeedbackType.Error);
      Alert.alert(t('common.error'), error.response?.data?.message || t('common.error'), [
        { text: t('common.close'), onPress: () => setScanned(false) }
      ]);
    }
  };

  return (
    <View style={st.container}>
      <CameraView 
        style={StyleSheet.absoluteFillObject}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
      />
      
      <View style={st.overlay}>
        <View style={st.scanFrame} />
        <Text style={st.helperText}>
          {t('qr.scan_helper')}
        </Text>
      </View>

      <TouchableOpacity onPress={() => navigation.goBack()} style={st.closeBtn}>
        <MaterialCommunityIcons name="close" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
}

const st = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#000" },
  center: { alignItems: "center", justifyContent: "center", paddingHorizontal: 40 },
  permissionText: { color: "#fff", fontSize: 16, fontFamily: "Nunito_600SemiBold", textAlign: "center", marginBottom: 24 },
  permissionBtn: { backgroundColor: "#154212", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30 },
  permissionBtnText: { color: "#fff", fontSize: 16, fontFamily: "Nunito_800ExtraBold" },
  
  overlay: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "rgba(0,0,0,0.4)" },
  scanFrame: { width: 250, height: 250, borderWidth: 2, borderColor: "#4ade80", borderRadius: 24, backgroundColor: "transparent" },
  helperText: { color: "#fff", fontFamily: "Nunito_600SemiBold", marginTop: 32, textAlign: "center", paddingHorizontal: 40 },
  
  closeBtn: { position: "absolute", top: Platform.OS === 'ios' ? 50 : 30, left: 24, width: 44, height: 44, backgroundColor: "rgba(0,0,0,0.6)", borderRadius: 22, alignItems: "center", justifyContent: "center" }
});
