import React, { useEffect, useState } from "react";
import { 
  View, Text, ScrollView, TouchableOpacity, Image, Alert,
  StyleSheet, Platform, ActivityIndicator, StatusBar,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import api from "../services/api";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 5 },
});

export default function ModeratorDashboard() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);

  const fetchSubmissions = async () => {
    try {
      const data = await api.get("/admin/submissions");
      setSubmissions(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
  }, []);

  const handleApprove = async (id: number) => {
    setActionLoadingId(id);
    try {
      await api.post("/admin/approve", { submissionId: id });
      Alert.alert("Thành công", "Đã duyệt và cộng xu cho người dùng.");
      fetchSubmissions();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể phê duyệt.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoadingId(id);
    try {
      await api.post("/admin/reject", { submissionId: id });
      Alert.alert("Đã từ chối", "Yêu cầu đã bị hủy.");
      fetchSubmissions();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể từ chối.");
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleQRScan = () => {
    navigation.navigate("QRScanner" as never);
  };

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 20 }]}>
        <View style={{ flex: 1 }}>
          <Text style={st.headerTitle}>Bảng Kiểm Duyệt</Text>
          <Text style={st.headerSubtitle}>Phê duyệt minh chứng từ buôn làng</Text>
        </View>
        <TouchableOpacity onPress={handleQRScan} style={st.qrBtn}>
          <MaterialCommunityIcons name="qrcode-scan" size={20} color="#154212" />
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        {loading ? (
          <View style={st.loader}>
            <ActivityIndicator size="large" color="#154212" />
            <Text style={st.loaderText}>Đang tải dữ liệu...</Text>
          </View>
        ) : submissions.length === 0 ? (
          <View style={st.emptyState}>
            <View style={st.emptyIconWrap}>
              <MaterialCommunityIcons name="clipboard-check-outline" size={48} color="#9ca3af" />
            </View>
            <Text style={st.emptyTitle}>Tất cả đã hoàn tất!</Text>
            <Text style={st.emptySubtitle}>Không có minh chứng nào đang chờ duyệt lúc này.</Text>
          </View>
        ) : (
          submissions.map((sub, index) => {
            const evidenceParts = sub.image_url ? sub.image_url.split("|GPS:") : [""];
            const imageUrl = evidenceParts[0];
            const gpsData = evidenceParts.length > 1 ? evidenceParts[1].split("|ADDR:") : null;
            const coords = gpsData ? gpsData[0] : null;
            const address = gpsData && gpsData.length > 1 ? gpsData[1] : null;

            return (
              <Animated.View key={sub.id} entering={FadeInDown.delay(index * 100).duration(500)} style={st.card}>
                <View style={st.cardHeader}>
                  <View style={st.avatar}>
                    <MaterialCommunityIcons name="account" size={24} color="#154212" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={st.username}>{sub.username}</Text>
                    <Text style={st.timestamp}>Gửi lúc: {new Date(sub.submitted_at).toLocaleString('vi-VN')}</Text>
                  </View>
                </View>

                <View style={st.taskInfo}>
                  <Text style={st.taskTitle}>{sub.title}</Text>
                  <View style={st.rewardPill}>
                    <MaterialCommunityIcons name="star-four-points" size={14} color="#fbbf24" />
                    <Text style={st.rewardText}>+{sub.reward} xu</Text>
                  </View>
                </View>

                {!!address ? (
                  <View style={st.gpsBox}>
                    <MaterialCommunityIcons name="map-marker-radius" size={16} color="#7c3aed" />
                    <Text style={st.gpsText} numberOfLines={2}>Địa chỉ: {address}</Text>
                  </View>
                ) : !!coords ? (
                  <View style={st.gpsBox}>
                    <MaterialCommunityIcons name="map-marker-radius" size={16} color="#7c3aed" />
                    <Text style={st.gpsText}>Tọa độ: {coords}</Text>
                  </View>
                ) : null}

                {/* AI Verification Badge */}
                {sub.ai_verified !== null && sub.ai_verified !== undefined && (
                  <View style={[st.aiBadge, { backgroundColor: sub.ai_verified ? '#f0fdf4' : '#fef2f2', borderColor: sub.ai_verified ? '#bbf7d0' : '#fecaca' }]}>
                    <MaterialCommunityIcons 
                      name={sub.ai_verified ? "robot-happy-outline" : "robot-angry-outline"} 
                      size={18} 
                      color={sub.ai_verified ? "#16a34a" : "#dc2626"} 
                    />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={[st.aiTitle, { color: sub.ai_verified ? '#16a34a' : '#dc2626' }]}>
                        {sub.ai_verified ? '✅ AI Xác minh' : '⚠️ AI Cảnh báo'}
                      </Text>
                      <Text style={st.aiReason} numberOfLines={2}>{sub.ai_reason || 'Không có chi tiết'}</Text>
                    </View>
                    <View style={[st.aiScore, { backgroundColor: sub.ai_verified ? '#dcfce7' : '#fee2e2' }]}>
                      <Text style={[st.aiScoreText, { color: sub.ai_verified ? '#16a34a' : '#dc2626' }]}>
                        {sub.ai_confidence ?? 0}%
                      </Text>
                    </View>
                  </View>
                )}

                {/* AI Rejected Banner */}
                {sub.status === 'ai_rejected' && (
                  <View style={st.aiRejectedBanner}>
                    <MaterialCommunityIcons name="alert-circle" size={16} color="#dc2626" />
                    <Text style={st.aiRejectedText}>AI đã tự động từ chối. Moderator có thể duyệt lại.</Text>
                  </View>
                )}

                <View style={st.imgWrap}>
                  <Image source={{ uri: imageUrl || "https://via.placeholder.com/400" }} style={st.img} resizeMode="cover" />
                </View>

                <View style={st.actions}>
                  <TouchableOpacity 
                    onPress={() => handleReject(sub.id)}
                    disabled={actionLoadingId === sub.id}
                    style={st.rejectBtn}
                  >
                    <Text style={st.rejectText}>Từ chối</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    onPress={() => handleApprove(sub.id)}
                    disabled={actionLoadingId === sub.id}
                    style={st.approveBtn}
                  >
                    {actionLoadingId === sub.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="check-circle-outline" size={20} color="#fff" />
                        <Text style={st.approveText}>Duyệt & Tặng xu</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </Animated.View>
            );
          })
        )}
        <View style={{ height: 40 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fbfbf9" },
  header: { 
    flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingBottom: 20, 
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", ...SHADOW 
  },
  headerTitle: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#111827" },
  headerSubtitle: { fontSize: 13, fontFamily: "Nunito_600SemiBold", color: "#6b7280", marginTop: 4 },
  qrBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" },
  
  content: { padding: 24 },
  loader: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  loaderText: { marginTop: 12, fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#9ca3af" },

  emptyState: { alignItems: "center", justifyContent: "center", paddingVertical: 80 },
  emptyIconWrap: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#f3f4f6", alignItems: "center", justifyContent: "center", marginBottom: 20 },
  emptyTitle: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#374151", marginBottom: 8 },
  emptySubtitle: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#9ca3af", textAlign: "center", paddingHorizontal: 20 },

  card: { backgroundColor: "#fff", borderRadius: 28, padding: 20, marginBottom: 24, borderWidth: 1, borderColor: "#f3f4f6", ...SHADOW },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
  avatar: { width: 46, height: 46, borderRadius: 23, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center", marginRight: 14 },
  username: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#111827", marginBottom: 2 },
  timestamp: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#9ca3af" },

  taskInfo: { marginBottom: 14 },
  taskTitle: { fontSize: 16, fontFamily: "Nunito_700Bold", color: "#154212", marginBottom: 8 },
  rewardPill: { alignSelf: "flex-start", flexDirection: "row", alignItems: "center", backgroundColor: "#fffbeb", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, gap: 6 },
  rewardText: { fontSize: 13, fontFamily: "Nunito_800ExtraBold", color: "#b45309" },

  gpsBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#f5f3ff", padding: 12, borderRadius: 12, marginBottom: 16, gap: 8 },
  gpsText: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#6d28d9", flex: 1 },

  imgWrap: { width: "100%", height: 200, borderRadius: 20, overflow: "hidden", marginBottom: 20, backgroundColor: "#f3f4f6" },
  img: { width: "100%", height: "100%" },

  actions: { flexDirection: "row", gap: 12 },
  rejectBtn: { flex: 1, paddingVertical: 14, borderRadius: 16, alignItems: "center", justifyContent: "center", borderWidth: 1.5, borderColor: "#fee2e2", backgroundColor: "#fff5f5" },
  rejectText: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#ef4444" },
  approveBtn: { flex: 2, flexDirection: "row", paddingVertical: 14, borderRadius: 16, alignItems: "center", justifyContent: "center", backgroundColor: "#154212", gap: 8 },
  approveText: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#fff" },

  // AI Verification Styles
  aiBadge: { flexDirection: "row", alignItems: "center", borderRadius: 14, padding: 12, marginBottom: 12, borderWidth: 1 },
  aiTitle: { fontSize: 13, fontFamily: "Nunito_800ExtraBold" },
  aiReason: { fontSize: 11, fontFamily: "Nunito_600SemiBold", color: "#6b7280", marginTop: 2 },
  aiScore: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 10 },
  aiScoreText: { fontSize: 14, fontFamily: "Nunito_800ExtraBold" },
  aiRejectedBanner: { flexDirection: "row", alignItems: "center", backgroundColor: "#fef2f2", borderRadius: 10, padding: 10, marginBottom: 12, gap: 8, borderWidth: 1, borderColor: "#fecaca" },
  aiRejectedText: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#dc2626", flex: 1 },
});
