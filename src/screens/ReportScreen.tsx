import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, TouchableOpacity, Image,
  StyleSheet, Platform, ActivityIndicator, Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import * as ImagePicker from "expo-image-picker";
import * as Location from "expo-location";
import { taskService, uploadImage } from "../services/api";
import { useGameStore } from "../store/useGameStore";
import FeedbackPopup from "../components/FeedbackPopup";

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 5 } },
  android: { elevation: 4 },
});

export default function ReportScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { userId, t } = useGameStore();

  const taskId: number = route?.params?.taskId ?? 1;
  const needsGps: boolean = !!route?.params?.needsGps;
  const taskTitle: string = route?.params?.taskTitle ?? t('report.title');
  const taskDesc: string = route?.params?.taskDesc ?? t('report.default_desc');
  const taskReward: number = route?.params?.taskReward ?? 60;
  const taskGroup: string = route?.params?.taskGroup ?? "action";

  const isReport = taskGroup === "report";
  const gradientColors: [string, string] = isReport ? ["#dc2626", "#ef4444"] : ["#0f9b58", "#1dba6e"];
  const accent = isReport ? "#dc2626" : "#0f9b58";

  const [photo, setPhoto] = useState<string | null>(null);
  const [location, setLocation] = useState<{ lat: number; lng: number; address?: string } | null>(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [popup, setPopup] = useState({ visible: false, type: "success" as "success" | "error", title: "", message: "" });

  useEffect(() => {
    if (needsGps) fetchGPS();
  }, []);

  const fetchGPS = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert(t('common.error'), t('profile.privacy'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      
      // Reverse Geocode to get Address Name
      const geo = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });
      
      let addressName = t('report.unknown_loc');
      if (geo.length > 0) {
        const g = geo[0];
        addressName = [g.streetNumber, g.street, g.subregion, g.region].filter(Boolean).join(", ");
      }

      setLocation({ 
        lat: loc.coords.latitude, 
        lng: loc.coords.longitude,
        address: addressName
      });
    } catch (err) {
      console.error(err);
      Alert.alert(t('report.gps_error'), t('report.gps_error_desc'));
    } finally {
      setGpsLoading(false);
    }
  };

  const pickPhoto = async (fromCamera: boolean) => {
    const { status } = fromCamera
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== "granted") {
      Alert.alert(t('report.perm_req'), fromCamera ? t('report.perm_camera') : t('report.perm_library'));
      return;
    }

    const result = fromCamera
      ? await ImagePicker.launchCameraAsync({ quality: 0.8, allowsEditing: true })
      : await ImagePicker.launchImageLibraryAsync({ quality: 0.8, allowsEditing: true });

    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  const handleSubmit = async () => {
    if (!photo) {
      Alert.alert(t('report.missing_photo'), t('report.missing_photo_desc'));
      return;
    }
    if (needsGps && !location) {
      Alert.alert(t('report.missing_gps'), t('report.missing_gps_desc'));
      return;
    }

    setSubmitting(true);
    try {
      // 1. Upload to Cloudinary
      const cloudUrl = await uploadImage(photo);

      // 2. Submit with Cloudinary URL + Address
      const evidence = location
        ? `${cloudUrl}|GPS:${location.lat.toFixed(5)},${location.lng.toFixed(5)}|ADDR:${location.address}`
        : cloudUrl;
        
      await taskService.submitTask(userId || 1, taskId, evidence);
      setPopup({
        visible: true, type: "success",
        title: t('common.success'),
        message: isReport ? "Tọa độ đã được ghi nhận lên bản đồ!" : t('tasks.status_approved'),
      });
    } catch (err: any) {
      console.error("Upload error:", err);
      setPopup({
        visible: true, type: "error",
        title: t('common.error'),
        message: err.response?.data?.message || t('common.error'),
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={st.root}>
      {/* Header */}
      <LinearGradient colors={gradientColors} style={[st.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={st.headerLabel}>{isReport ? t('tasks.filter_report') : t('tasks.filter_action')}</Text>
          <Text style={st.headerTitle} numberOfLines={1}>{taskTitle}</Text>
        </View>
        <View style={st.rewardBadge}>
          <Text style={st.rewardText}>+{taskReward} ⭐</Text>
        </View>
      </LinearGradient>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>

        {/* Task description card */}
        <View style={[st.card, { marginBottom: 20 }]}>
          <View style={[st.cardIcon, { backgroundColor: accent + "18" }]}>
            <MaterialCommunityIcons name={isReport ? "map-marker-alert" : "camera-outline"} size={26} color={accent} />
          </View>
          <Text style={st.cardTitle}>{t('tasks.submit')}</Text>
          <Text style={st.cardDesc}>{taskDesc}</Text>
          {needsGps && (
            <View style={st.gpsBanner}>
              <MaterialCommunityIcons name="map-marker" size={16} color="#7c3aed" />
              <Text style={st.gpsBannerText}>{t('home.map')} GPS</Text>
            </View>
          )}
        </View>

        {/* GPS Section */}
        {needsGps && (
          <View style={[st.card, { marginBottom: 20 }]}>
            <Text style={st.sectionTitle}>📍 {t('report.gps_coords')}</Text>
            {location ? (
              <View style={st.gpsResult}>
                <MaterialCommunityIcons name="map-marker-check" size={24} color="#10b981" />
                <View style={{ marginLeft: 12, flex: 1 }}>
                  <Text style={st.gpsCoord} numberOfLines={2}>{location.address}</Text>
                </View>
                <TouchableOpacity onPress={fetchGPS} style={st.gpsRefresh}>
                  <MaterialCommunityIcons name="refresh" size={18} color="#6b7280" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity onPress={fetchGPS} disabled={gpsLoading} style={[st.gpsBtn, { borderColor: accent }]}>
                {gpsLoading
                  ? <ActivityIndicator size="small" color={accent} />
                  : <MaterialCommunityIcons name="map-marker-radius" size={20} color={accent} />}
                <Text style={[st.gpsBtnText, { color: accent }]}>
                  {gpsLoading ? t('report.gps_fetching') : t('report.gps_get')}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {/* Photo Section */}
        <View style={[st.card, { marginBottom: 20 }]}>
          <Text style={st.sectionTitle}>📸 {t('report.photo_evidence')}</Text>

          {photo ? (
            <View style={st.photoPreviewWrap}>
              <Image source={{ uri: photo }} style={st.photoPreview} resizeMode="cover" />
              <TouchableOpacity style={st.removePhoto} onPress={() => setPhoto(null)}>
                <MaterialCommunityIcons name="close-circle" size={28} color="#ef4444" />
              </TouchableOpacity>
              <TouchableOpacity style={[st.retakeBtn, { backgroundColor: accent }]} onPress={() => pickPhoto(true)}>
                <MaterialCommunityIcons name="camera-retake" size={16} color="#fff" />
                <Text style={st.retakeBtnText}>{t('report.retake')}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={st.photoActions}>
              <TouchableOpacity style={[st.photoBtn, { borderColor: accent }]} onPress={() => pickPhoto(true)}>
                <LinearGradient colors={gradientColors} style={st.photoBtnGrad}>
                  <MaterialCommunityIcons name="camera" size={28} color="#fff" />
                </LinearGradient>
                <Text style={[st.photoBtnLabel, { color: accent }]}>{t('profile.verify')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[st.photoBtn, { borderColor: "#9ca3af" }]} onPress={() => pickPhoto(false)}>
                <View style={[st.photoBtnGrad, { backgroundColor: "#f3f4f6" }]}>
                  <MaterialCommunityIcons name="image-multiple" size={28} color="#6b7280" />
                </View>
                <Text style={[st.photoBtnLabel, { color: "#6b7280" }]}>{t('library.title')}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Tips */}
        <View style={st.tipsCard}>
          <Text style={st.tipsTitle}>💡 {t('report.tips_title')}</Text>
          {(t('report.tips') as string[]).map((tip, i) => (
            <View key={i} style={st.tipRow}>
              <View style={st.tipDot} />
              <Text style={st.tipText}>{tip}</Text>
            </View>
          ))}
        </View>

        {/* Submit */}
        <TouchableOpacity
          onPress={handleSubmit}
          disabled={submitting || !photo || (needsGps && !location)}
          activeOpacity={0.85}
          style={[st.submitBtn, (submitting || !photo || (needsGps && !location)) && st.submitDisabled]}
        >
          {submitting
            ? <ActivityIndicator size="small" color="#fff" />
            : <LinearGradient colors={gradientColors} style={st.submitGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                <MaterialCommunityIcons name="send" size={20} color="#fff" />
                <Text style={st.submitText}>{isReport ? "Ghi nhận tọa độ" : t('tasks.submit')}</Text>
              </LinearGradient>}
        </TouchableOpacity>

        <View style={{ height: 40 }} />
      </ScrollView>

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
  root: { flex: 1, backgroundColor: "#f7f8fa" },

  header: { paddingBottom: 20, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerLabel: { fontSize: 11, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Nunito_800ExtraBold", color: "#fff", marginTop: 2 },
  rewardBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  rewardText: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#fff" },

  content: { padding: 20, paddingTop: 24 },

  card: { backgroundColor: "#fff", borderRadius: 20, padding: 18, ...SHADOW },
  cardIcon: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 12 },
  cardTitle: { fontSize: 15, fontFamily: "Nunito_800ExtraBold", color: "#111827", marginBottom: 6 },
  cardDesc: { fontSize: 13, fontFamily: "Nunito_600SemiBold", color: "#6b7280", lineHeight: 20 },

  gpsBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#f5f3ff", padding: 10, borderRadius: 10, marginTop: 12, gap: 8 },
  gpsBannerText: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#7c3aed" },

  sectionTitle: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#111827", marginBottom: 14 },

  gpsResult: { flexDirection: "row", alignItems: "center", backgroundColor: "#f0fdf4", padding: 14, borderRadius: 14 },
  gpsCoord: { fontSize: 13, fontFamily: "Nunito_600SemiBold", color: "#065f46" },
  gpsRefresh: { marginLeft: "auto" as any, padding: 6 },
  gpsBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderRadius: 14, paddingVertical: 14, gap: 8 },
  gpsBtnText: { fontSize: 14, fontFamily: "Nunito_700Bold" },

  photoActions: { flexDirection: "row", gap: 14 },
  photoBtn: { flex: 1, alignItems: "center", borderWidth: 1.5, borderRadius: 16, paddingVertical: 20, borderStyle: "dashed" },
  photoBtnGrad: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", marginBottom: 10 },
  photoBtnLabel: { fontSize: 13, fontFamily: "Nunito_700Bold" },

  photoPreviewWrap: { borderRadius: 16, overflow: "hidden", position: "relative" },
  photoPreview: { width: "100%", height: 220, borderRadius: 16 },
  removePhoto: { position: "absolute", top: 10, right: 10, backgroundColor: "#fff", borderRadius: 14 },
  retakeBtn: { position: "absolute", bottom: 12, right: 12, flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  retakeBtnText: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#fff" },

  tipsCard: { backgroundColor: "#fffbeb", borderRadius: 16, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: "#fde68a" },
  tipsTitle: { fontSize: 13, fontFamily: "Nunito_800ExtraBold", color: "#92400e", marginBottom: 10 },
  tipRow: { flexDirection: "row", alignItems: "center", marginBottom: 6, gap: 8 },
  tipDot: { width: 5, height: 5, borderRadius: 3, backgroundColor: "#f59e0b" },
  tipText: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#78350f" },

  submitBtn: { borderRadius: 18, overflow: "hidden", marginBottom: 8 },
  submitDisabled: { opacity: 0.45 },
  submitGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 10 },
  submitText: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
});
