import React from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Platform, StatusBar } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 5 },
});

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useGameStore();
  
  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={[st.header, { paddingTop: insets.top + 20 }]}>
        <Text style={st.headerTitle}>{t('tabs.ranking')}</Text>
        <Text style={st.headerSub}>{t('ranking.sub')}</Text>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        
        {/* Project Card */}
        <View style={st.card}>
          <View style={st.cardHeader}>
            <View style={st.iconWrap}>
              <MaterialCommunityIcons name="account-group" size={24} color="#154212" />
            </View>
            <Text style={st.cardTitle}>Dự án Làng Cà Phê</Text>
          </View>
          <Text style={st.cardDesc}>Mục tiêu: Trồng 10,000 cây cà phê hữu cơ trong mùa vụ năm nay.</Text>
          
          <View style={st.progressWrap}>
            <Text style={st.progressLabel}>Tiến độ dự án</Text>
            <View style={st.progressBarBg}>
              <View style={[st.progressBarFill, { width: "65%" }]} />
            </View>
            <View style={st.progressTextRow}>
              <Text style={st.progressVal}>6,500 cây</Text>
              <Text style={st.progressTarget}>10,000 cây</Text>
            </View>
          </View>
        </View>

        {/* Featured Farmers */}
        <View style={st.sectionHeader}>
          <Text style={st.sectionTitle}>{t('ranking.tab_user')}</Text>
          <TouchableOpacity>
            <Text style={st.seeAllBtn}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.horizList} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
          {[1, 2, 3].map((i) => (
            <TouchableOpacity key={i} activeOpacity={0.8} style={st.farmerCard}>
              <View style={st.farmerAvatarWrap}>
                <Image 
                  source={{ uri: "https://images.unsplash.com/photo-1599307734111-d138f6d66934?w=400" }}
                  style={st.farmerAvatar} 
                />
              </View>
              <Text style={st.farmerName}>Bác {i === 1 ? "Bảy" : i === 2 ? "Tám" : "Chín"}</Text>
              <View style={st.rankBadge}>
                <MaterialCommunityIcons name="star-circle" size={14} color="#fbbf24" />
                <Text style={st.rankText}>Thành viên Vàng</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feed */}
        <Text style={[st.sectionTitle, { paddingHorizontal: 24, marginBottom: 16 }]}>Hoạt động mới nhất</Text>
        
        <View style={st.feedCard}>
          {[
            { id: 1, user: "Anh Ba", action: "vừa hoàn thành ủ 50kg phân hữu cơ", time: "2 phút trước" },
            { id: 2, user: "Chị Tư", action: "vừa quyên góp 500 xu cho làng", time: "15 phút trước" },
            { id: 3, user: "Chú Sáu", action: "vừa trồng thêm 5 cây cà phê mới", time: "1 giờ trước" },
          ].map((item, idx) => (
            <View key={item.id} style={[st.feedItem, idx !== 2 && st.feedBorder]}>
              <View style={st.feedIcon}>
                <MaterialCommunityIcons name="bell-ring" size={20} color="#154212" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.feedText}>
                  <Text style={st.feedUser}>{item.user}</Text> {item.action}
                </Text>
                <Text style={st.feedTime}>{item.time}</Text>
              </View>
            </View>
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fbfbf9" },
  header: { paddingHorizontal: 24, paddingBottom: 20 },
  headerTitle: { fontSize: 28, fontFamily: "Nunito_800ExtraBold", color: "#111827", marginBottom: 6 },
  headerSub: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#6b7280" },
  
  content: { paddingTop: 10 },
  
  card: { backgroundColor: "#fff", marginHorizontal: 24, borderRadius: 28, padding: 24, marginBottom: 30, borderWidth: 1, borderColor: "#f3f4f6", ...SHADOW },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16, gap: 12 },
  iconWrap: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 18, fontFamily: "Nunito_800ExtraBold", color: "#154212" },
  cardDesc: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#6b7280", lineHeight: 22, marginBottom: 20 },
  
  progressWrap: { backgroundColor: "#fcfcfc", padding: 16, borderRadius: 20, borderWidth: 1, borderColor: "#f3f4f6" },
  progressLabel: { fontSize: 13, fontFamily: "Nunito_700Bold", color: "#374151", marginBottom: 10 },
  progressBarBg: { height: 8, backgroundColor: "#e5e7eb", borderRadius: 4, overflow: "hidden", marginBottom: 10 },
  progressBarFill: { height: "100%", backgroundColor: "#154212", borderRadius: 4 },
  progressTextRow: { flexDirection: "row", justifyContent: "space-between" },
  progressVal: { fontSize: 12, fontFamily: "Nunito_800ExtraBold", color: "#111827" },
  progressTarget: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#9ca3af" },

  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#111827" },
  seeAllBtn: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#154212" },

  horizList: { marginBottom: 30 },
  farmerCard: { backgroundColor: "#fff", width: 140, borderRadius: 24, padding: 16, alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6", ...SHADOW },
  farmerAvatarWrap: { width: 64, height: 64, borderRadius: 32, overflow: "hidden", marginBottom: 12, borderWidth: 2, borderColor: "#4ade80" },
  farmerAvatar: { width: "100%", height: "100%" },
  farmerName: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#111827", marginBottom: 6 },
  rankBadge: { flexDirection: "row", alignItems: "center", gap: 4 },
  rankText: { fontSize: 10, fontFamily: "Nunito_600SemiBold", color: "#6b7280" },

  feedCard: { backgroundColor: "#fff", marginHorizontal: 24, borderRadius: 28, overflow: "hidden", borderWidth: 1, borderColor: "#f3f4f6", ...SHADOW },
  feedItem: { flexDirection: "row", alignItems: "center", padding: 20, gap: 16 },
  feedBorder: { borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  feedIcon: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" },
  feedText: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#374151", lineHeight: 20 },
  feedUser: { fontFamily: "Nunito_800ExtraBold", color: "#111827" },
  feedTime: { fontSize: 11, fontFamily: "Nunito_600SemiBold", color: "#9ca3af", marginTop: 4 },
});
