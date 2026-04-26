import React from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameStore } from "../store/useGameStore";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from 'react-native-qrcode-svg';
import { shopService } from "../services/api";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const { userId, fullName, userName, coins, avatarUrl, redemptions, fetchRedemptions } = useGameStore();
  const [selectedQR, setSelectedQR] = React.useState<string | null>(null);

  React.useEffect(() => {
    fetchRedemptions();
  }, []);

  const stats = [
    { label: "Nhiệm vụ", value: "0", icon: "clipboard-check-outline", color: "#154212" },
    { label: "Hái quả", value: "0", icon: "fruit-cherries", color: "#b57a3e" },
    { label: "Xu", value: coins.toLocaleString(), icon: "leaf", color: "#2d5a27" },
    { label: "Quà đổi", value: "0", icon: "gift-outline", color: "#d4af37" },
  ];

  const settings = [
    { title: "Thông tin cá nhân", icon: "account-edit-outline" },
    { title: "Đổi mật khẩu", icon: "lock-reset" },
  ];

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header gradient */}
        <LinearGradient
          colors={["#154212", "#2d5a27"]}
          style={[st.headerGradient, { paddingTop: insets.top + 24 }]}
        >
          <View style={st.avatarWrap}>
            <Image
              source={
                avatarUrl
                  ? { uri: avatarUrl }
                  : require("../../assets/avatar_premium.png")
              }
              style={st.avatarImg}
            />
            <TouchableOpacity style={st.cameraBtn}>
              <MaterialCommunityIcons name="camera-outline" size={18} color="#154212" />
            </TouchableOpacity>
          </View>

          <Text style={st.name}>{fullName || "Nông dân Xanh"}</Text>
          <Text style={st.username}>@{userName || "123456"}</Text>

          <View style={st.verifiedBadge}>
            <MaterialCommunityIcons name="check-decagram" size={16} color="#fcd34d" />
            <Text style={st.verifiedText}>Người dùng xác thực</Text>
          </View>
        </LinearGradient>

        {/* Stats Card — floating -mt */}
        <View style={st.statsWrap}>
          <Animated.View entering={FadeInDown.duration(600)} style={st.statsCard}>
            {stats.map((stat, i) => (
              <View key={i} style={st.statItem}>
                <View style={[st.statIcon, { backgroundColor: `${stat.color}18` }]}>
                  <MaterialCommunityIcons name={stat.icon as any} size={22} color={stat.color} />
                </View>
                <Text style={st.statValue}>{stat.value}</Text>
                <Text style={st.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </Animated.View>
        </View>

        {/* Inspirational Card */}
        <View style={st.section}>
          <LinearGradient
            colors={["#154212", "#0f3a0d"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={st.inspoCard}
          >
            <View style={st.inspoIcon}>
              <MaterialCommunityIcons name="heart-pulse" size={28} color="white" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={st.inspoTitle}>Gieo mầm hạnh phúc</Text>
              <Text style={st.inspoSub}>
                "Cho đi là còn mãi, mỗi hành động nhỏ của bạn đều làm thế giới tươi đẹp hơn."
              </Text>
            </View>
          </LinearGradient>
        </View>

        {/* My Rewards Section */}
        {redemptions.length > 0 && (
          <View style={st.section}>
            <Text style={st.sectionLabel}>PHẦN THƯỞNG CỦA TÔI</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12 }}>
              {redemptions.map((red, i) => (
                <TouchableOpacity 
                  key={i} 
                  style={st.rewardCard} 
                  onPress={() => setSelectedQR(red.qr_code)}
                  activeOpacity={0.8}
                >
                  <View style={st.rewardStatus}>
                    <Text style={[st.statusTxt, red.status === 'collected' && { color: '#10b981' }]}>
                      {red.status === 'collected' ? 'Đã nhận' : 'Chưa nhận'}
                    </Text>
                  </View>
                  <Image source={{ uri: red.image_url }} style={st.rewardImg} />
                  <Text style={st.rewardName} numberOfLines={1}>{red.name}</Text>
                  <View style={st.qrMini}>
                    <QRCode value={red.qr_code} size={40} />
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Settings */}
        <View style={st.section}>
          <Text style={st.sectionLabel}>CÀI ĐẶT</Text>
          <View style={st.settingsCard}>
            {settings.map((item, i) => (
              <TouchableOpacity
                key={i}
                activeOpacity={0.7}
                style={[st.settingRow, i < settings.length - 1 && st.settingBorder]}
              >
                <View style={st.settingIconWrap}>
                  <MaterialCommunityIcons name={item.icon as any} size={20} color="#154212" />
                </View>
                <Text style={st.settingTitle}>{item.title}</Text>
                <MaterialCommunityIcons name="chevron-right" size={22} color="#d1d5db" />
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Logout */}
        <TouchableOpacity
          style={st.logoutBtn}
          activeOpacity={0.8}
          onPress={() => useGameStore.setState({ userId: 0, userName: "" })}
        >
          <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
          <Text style={st.logoutText}>Đăng xuất</Text>
        </TouchableOpacity>

        {/* QR Modal */}
        {selectedQR && (
          <View style={st.qrModal}>
            <View style={st.qrContent}>
              <Text style={st.qrModalTitle}>Mã QR Đổi Quà</Text>
              <Text style={st.qrModalSub}>Vui lòng đưa mã này cho Moderator để nhận quà tại Buôn Làng.</Text>
              <View style={st.qrLarge}>
                <QRCode value={selectedQR} size={200} />
              </View>
              <Text style={st.qrCodeRaw}>{selectedQR}</Text>
              <TouchableOpacity onPress={() => setSelectedQR(null)} style={st.closeQrBtn}>
                <Text style={st.closeQrTxt}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fbfbf9" },

  headerGradient: {
    paddingBottom: 80,
    paddingHorizontal: 32,
    alignItems: "center",
    borderBottomLeftRadius: 48,
    borderBottomRightRadius: 48,
  },

  avatarWrap: { position: "relative", marginBottom: 20 },
  avatarImg: {
    width: 110, height: 110, borderRadius: 55,
    borderWidth: 3, borderColor: "rgba(255,255,255,0.35)",
    backgroundColor: "rgba(255,255,255,0.1)",
  },
  cameraBtn: {
    position: "absolute", bottom: 0, right: 0,
    backgroundColor: "#fff", width: 36, height: 36, borderRadius: 18,
    alignItems: "center", justifyContent: "center",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
      android: { elevation: 4 },
    }),
  },

  name: { color: "#fff", fontSize: 26, fontFamily: "Nunito_800ExtraBold", marginBottom: 4 },
  username: { color: "rgba(255,255,255,0.65)", fontSize: 14, fontFamily: "Nunito_600SemiBold" },

  verifiedBadge: {
    marginTop: 14, flexDirection: "row", alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)", paddingHorizontal: 16, paddingVertical: 7,
    borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  verifiedText: { color: "#fff", fontSize: 13, fontFamily: "Nunito_700Bold", marginLeft: 6 },

  statsWrap: { paddingHorizontal: 20, marginTop: -44 },
  statsCard: {
    backgroundColor: "#fff", borderRadius: 28, padding: 20,
    flexDirection: "row", justifyContent: "space-between",
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 20, shadowOffset: { width: 0, height: 8 } },
      android: { elevation: 6 },
    }),
  },
  statItem: { alignItems: "center", flex: 1 },
  statIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center", marginBottom: 8 },
  statValue: { fontSize: 18, fontFamily: "Nunito_800ExtraBold", color: "#1a1a1a" },
  statLabel: { fontSize: 10, color: "#9ca3af", fontFamily: "Nunito_600SemiBold", textAlign: "center", marginTop: 2 },

  section: { paddingHorizontal: 20, marginTop: 24 },
  sectionLabel: { fontSize: 11, color: "#9ca3af", fontFamily: "Nunito_700Bold", letterSpacing: 2, marginLeft: 4, marginBottom: 12 },

  inspoCard: { borderRadius: 28, padding: 24, flexDirection: "row", alignItems: "center" },
  inspoIcon: {
    width: 56, height: 56, backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 18, alignItems: "center", justifyContent: "center", marginRight: 16,
    borderWidth: 1, borderColor: "rgba(255,255,255,0.1)",
  },
  inspoTitle: { color: "#fff", fontSize: 16, fontFamily: "Nunito_800ExtraBold", marginBottom: 6 },
  inspoSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontFamily: "Nunito_600SemiBold", lineHeight: 19 },

  settingsCard: {
    backgroundColor: "#fff", borderRadius: 24, paddingHorizontal: 4,
    ...Platform.select({
      ios: { shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
      android: { elevation: 2 },
    }),
  },
  settingRow: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 16 },
  settingBorder: { borderBottomWidth: 1, borderBottomColor: "#f5f5f4" },
  settingIconWrap: {
    width: 38, height: 38, borderRadius: 12, backgroundColor: "#f0fdf4",
    alignItems: "center", justifyContent: "center", marginRight: 14,
  },
  settingTitle: { flex: 1, fontSize: 15, fontFamily: "Nunito_700Bold", color: "#374151" },

  logoutBtn: {
    marginHorizontal: 20, marginTop: 24, height: 58, borderRadius: 18,
    borderWidth: 1.5, borderColor: "#fee2e2", alignItems: "center", justifyContent: "center",
    flexDirection: "row", backgroundColor: "#fff5f5",
  },
  logoutText: { marginLeft: 10, fontSize: 15, fontFamily: "Nunito_700Bold", color: "#ef4444" },

  rewardCard: { backgroundColor: '#fff', width: 140, borderRadius: 20, padding: 12, borderWidth: 1, borderColor: '#f1f5f9' },
  rewardStatus: { position: 'absolute', top: 8, right: 8, zIndex: 1, backgroundColor: '#f8fafc', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  statusTxt: { fontSize: 8, fontFamily: 'Nunito_800ExtraBold', color: '#f59e0b', textTransform: 'uppercase' },
  rewardImg: { width: '100%', height: 80, borderRadius: 12, marginBottom: 8 },
  rewardName: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#1e293b' },
  qrMini: { alignSelf: 'center', marginTop: 8, padding: 4, backgroundColor: '#fff', borderRadius: 6, borderWidth: 1, borderColor: '#f1f5f9' },

  qrModal: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 999 },
  qrContent: { backgroundColor: '#fff', width: '85%', borderRadius: 32, padding: 24, alignItems: 'center' },
  qrModalTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: '#154212', marginBottom: 8 },
  qrModalSub: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#64748b', textAlign: 'center', marginBottom: 24 },
  qrLarge: { padding: 20, backgroundColor: '#fff', borderRadius: 24, borderWidth: 1, borderColor: '#f1f5f9', elevation: 4 },
  qrCodeRaw: { fontSize: 10, fontFamily: 'Courier', color: '#94a3b8', marginTop: 16 },
  closeQrBtn: { marginTop: 32, backgroundColor: '#154212', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 24 },
  closeQrTxt: { color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 16 },
});
