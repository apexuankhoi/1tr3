import React, { useState } from "react";
import { View, Text, TouchableOpacity, Image, Dimensions, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useGameStore } from "../store/useGameStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { taskService } from "../services/api";
import * as haptics from "expo-haptics";
import FeedbackPopup from "../components/FeedbackPopup";

const { width } = Dimensions.get("window");

export default function CameraScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const t = useGameStore(s => s.t);
  const [loading, setLoading] = useState(false);
  const [popup, setPopup] = useState({ visible: false, type: "success" as "success" | "error", title: "", message: "" });

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await taskService.submitTask(1, 4, "https://example.com/evidence.jpg");
      haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
      setPopup({
        visible: true,
        type: "success",
        title: t('tasks.status_approved'),
        message: t('common.success')
      });
    } catch (error) {
      haptics.notificationAsync(haptics.NotificationFeedbackType.Error);
      setPopup({
        visible: true,
        type: "error",
        title: t('common.error'),
        message: t('common.error')
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={st.root}>
      {/* Background Simulation */}
      <Image 
        source={{ uri: "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800" }}
        style={st.bgImg}
      />

      {/* Overlays */}
      <View style={[st.overlayTop, { height: 160 }]} />
      <View style={[st.overlayBottom, { height: 200 }]} />

      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 20 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.closeBtn}>
          <MaterialCommunityIcons name="close" size={30} color="white" />
        </TouchableOpacity>
        
        <View style={st.headerTitleWrap}>
          <Text style={st.headerTitle}>{t('tasks.submit')}</Text>
        </View>
        
        <View style={{ width: 48, height: 48 }} />
      </View>

      {/* Viewfinder */}
      <View style={st.viewfinderWrap}>
        <View style={[st.viewfinderBox, { width: width * 0.8, height: width * 0.8 }]}>
          {/* Corners */}
          <View style={[st.corner, st.topLeft]} />
          <View style={[st.corner, st.topRight]} />
          <View style={[st.corner, st.bottomLeft]} />
          <View style={[st.corner, st.bottomRight]} />
          
          {/* Dashed guide */}
          <View style={st.dashedGuide} />
        </View>

        {/* Instructional Text */}
        <View style={st.instructionWrap}>
          <MaterialCommunityIcons name="line-scan" size={24} color="#bcf0ae" />
          <Text style={st.instructionText}>{t('tasks.submit')}</Text>
        </View>
      </View>

      {/* Bottom Controls */}
      <View style={[st.bottomControls, { paddingBottom: insets.bottom + 40 }]}>
        <TouchableOpacity style={st.retakeBtn}>
          <Text style={st.retakeBtnText}>{t('common.cancel')}</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          onPress={handleSubmit}
          disabled={loading}
          style={[st.submitBtn, loading && st.submitBtnDisabled]}
        >
          <MaterialCommunityIcons name="check-circle" size={24} color="white" />
          <Text style={st.submitBtnText}>
            {loading ? t('common.loading') : t('tasks.submit')}
          </Text>
        </TouchableOpacity>
      </View>

      <FeedbackPopup 
        visible={popup.visible}
        type={popup.type}
        title={popup.title}
        message={popup.message}
        onClose={() => {
          setPopup({ ...popup, visible: false });
          if (popup.type === "success") navigation.goBack();
        }}
      />
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#000" },
  bgImg: { position: "absolute", width: "100%", height: "100%", resizeMode: "cover" },
  overlayTop: { position: "absolute", top: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  overlayBottom: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.4)" },
  
  header: { position: "absolute", top: 0, left: 0, right: 0, paddingHorizontal: 24, flexDirection: "row", justifyContent: "space-between", alignItems: "center", zIndex: 20 },
  closeBtn: { width: 48, height: 48, alignItems: "center", justifyContent: "center", borderRadius: 24, backgroundColor: "rgba(0,0,0,0.4)", borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  headerTitleWrap: { backgroundColor: "rgba(0,0,0,0.4)", paddingHorizontal: 24, paddingVertical: 12, borderRadius: 24, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  headerTitle: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 14 },
  
  viewfinderWrap: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center", pointerEvents: "none" },
  viewfinderBox: { position: "relative" },
  corner: { position: "absolute", width: 48, height: 48, borderColor: "#4ade80" },
  topLeft: { top: 0, left: 0, borderTopWidth: 6, borderLeftWidth: 6, borderTopLeftRadius: 32 },
  topRight: { top: 0, right: 0, borderTopWidth: 6, borderRightWidth: 6, borderTopRightRadius: 32 },
  bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 6, borderLeftWidth: 6, borderBottomLeftRadius: 32 },
  bottomRight: { bottom: 0, right: 0, borderBottomWidth: 6, borderRightWidth: 6, borderBottomRightRadius: 32 },
  dashedGuide: { position: "absolute", top: 32, bottom: 32, left: 32, right: 32, borderWidth: 2, borderColor: "rgba(255,255,255,0.3)", borderRadius: 12, borderStyle: "dashed" },
  
  instructionWrap: { marginTop: 48, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, flexDirection: "row", alignItems: "center", gap: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.2)" },
  instructionText: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 16 },

  bottomControls: { position: "absolute", bottom: 0, left: 0, right: 0, paddingHorizontal: 24, flexDirection: "row", gap: 24, alignItems: "center" },
  retakeBtn: { flex: 1, height: 56, alignItems: "center", justifyContent: "center", borderRadius: 28, borderWidth: 2, borderColor: "#fff", backgroundColor: "rgba(0,0,0,0.2)" },
  retakeBtnText: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 16 },
  submitBtn: { flex: 2, height: 64, borderRadius: 32, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 12, backgroundColor: "#154212", shadowColor: "#000", shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 8 }, elevation: 8 },
  submitBtnDisabled: { backgroundColor: "#6b7280" },
  submitBtnText: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 16 },
});
