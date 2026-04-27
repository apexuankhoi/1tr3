import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, Image, TouchableOpacity, StyleSheet, Platform, StatusBar, ActivityIndicator, RefreshControl } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGameStore } from "../store/useGameStore";
import { communityService } from "../services/api";

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 5 },
});

export default function CommunityScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useGameStore();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [data, setData] = useState<{ projects: any[], farmers: any[], feed: any[] }>({
    projects: [],
    farmers: [],
    feed: []
  });

  const fetchData = async () => {
    try {
      const res = await communityService.getCommunityData();
      setData(res);
    } catch (err) {
      console.error("Lỗi lấy dữ liệu cộng đồng:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  if (loading && !refreshing) {
    return (
      <View style={[st.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#154212" />
      </View>
    );
  }

  const formatTime = (timeStr: string) => {
    const date = new Date(timeStr);
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `${mins} phút trước`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} giờ trước`;
    return date.toLocaleDateString('vi-VN');
  };

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      <View style={[st.header, { paddingTop: insets.top + 20 }]}>
        <Text style={st.headerTitle}>{t('tabs.community')}</Text>
        <Text style={st.headerSub}>{t('ranking.sub')}</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={st.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        {/* Project Cards */}
        {data.projects.map((project: any) => (
          <View key={project.id} style={st.card}>
            <View style={st.cardHeader}>
              <View style={st.iconWrap}>
                <MaterialCommunityIcons name={project.icon || "account-group"} size={24} color="#154212" />
              </View>
              <Text style={st.cardTitle}>{project.title}</Text>
            </View>
            <Text style={st.cardDesc}>{project.description}</Text>
            
            <View style={st.progressWrap}>
              <Text style={st.progressLabel}>Tiến độ dự án</Text>
              <View style={st.progressBarBg}>
                <View style={[st.progressBarFill, { width: `${Math.min(100, (project.current_value / project.target_value) * 100)}%` }]} />
              </View>
              <View style={st.progressTextRow}>
                <Text style={st.progressVal}>{project.current_value.toLocaleString()} {project.unit}</Text>
                <Text style={st.progressTarget}>{project.target_value.toLocaleString()} {project.unit}</Text>
              </View>
            </View>
          </View>
        ))}

        {/* Featured Farmers */}
        <View style={st.sectionHeader}>
          <Text style={st.sectionTitle}>{t('ranking.tab_user')}</Text>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.horizList} contentContainerStyle={{ paddingHorizontal: 24, gap: 16 }}>
          {data.farmers.map((farmer: any) => (
            <TouchableOpacity key={farmer.id} activeOpacity={0.8} style={st.farmerCard}>
              <View style={st.farmerAvatarWrap}>
                <Image 
                  source={farmer.imageUri ? { uri: farmer.imageUri } : require("../../assets/avatar_premium.png")}
                  style={st.farmerAvatar} 
                />
              </View>
              <Text style={st.farmerName} numberOfLines={1}>{farmer.name}</Text>
              <View style={st.rankBadge}>
                <MaterialCommunityIcons name="star-circle" size={14} color="#fbbf24" />
                <Text style={st.rankText}>Level {farmer.level}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* Feed */}
        <Text style={[st.sectionTitle, { paddingHorizontal: 24, marginBottom: 16 }]}>Hoạt động mới nhất</Text>
        
        <View style={st.feedCard}>
          {data.feed.length > 0 ? data.feed.map((item, idx) => (
            <View key={item.id} style={[st.feedItem, idx !== data.feed.length - 1 && st.feedBorder]}>
              <View style={st.feedIcon}>
                <MaterialCommunityIcons name="bell-ring" size={20} color="#154212" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={st.feedText}><Text style={st.feedUser}>{item.user}</Text> vừa hoàn thành: {item.action}</Text>
                <Text style={st.feedTime}>{formatTime(item.time)}</Text>
              </View>
            </View>
          )) : (
            <View style={{ padding: 40, alignItems: 'center' }}>
              <Text style={{ color: '#94a3b8', fontFamily: 'Nunito_600SemiBold' }}>Chưa có hoạt động nào.</Text>
            </View>
          )}
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
