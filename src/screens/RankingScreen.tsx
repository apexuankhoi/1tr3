import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PodiumItem from "../components/PodiumItem";
import RankingItem from "../components/RankingItem";
import { communityService } from "../services/api";
import { useGameStore } from "../store/useGameStore";

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const { t } = useGameStore();
  const [activeTab, setActiveTab] = useState<"individual" | "village">("individual");
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchRankings();
  }, [activeTab]);

  const fetchRankings = async () => {
    try {
      const data = await communityService.getRankings(activeTab);
      setRankings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchRankings();
  };

  const top3 = (rankings || []).slice(0, 3).map((item, index) => {
    if (index === 0) return { ...item, rank: 1, isFirst: true };
    if (index === 1) return { ...item, rank: 2 };
    if (index === 2) return { ...item, rank: 3 };
    return item;
  });

  const podiumData = [top3[1], top3[0], top3[2]].filter(Boolean);
  const others = (rankings || []).slice(3).map((item, index) => ({ ...item, rank: index + 4 }));

  if (loading && !refreshing) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator size="large" color="#154212" /></View>;

  return (
    <View style={st.root}>
      <View style={[st.header, { paddingTop: insets.top + 20 }]}>
        <Text style={st.headerTitle}>{t('ranking.title')}</Text>
        <Text style={st.headerSub}>{t('ranking.sub')}</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={st.content} 
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        
        <View style={st.tabsWrap}>
          <TouchableOpacity 
            onPress={() => setActiveTab("individual")}
            activeOpacity={0.8}
            style={[st.tabBtn, activeTab === "individual" && st.tabActive]}
          >
            <Text style={[st.tabText, activeTab === "individual" && st.tabTextActive]}>{t('ranking.tab_user')}</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            onPress={() => setActiveTab("village")}
            activeOpacity={0.8}
            style={[st.tabBtn, activeTab === "village" && st.tabActive]}
          >
            <Text style={[st.tabText, activeTab === "village" && st.tabTextActive]}>{t('ranking.tab_village')}</Text>
          </TouchableOpacity>
        </View>

        <View style={st.podiumWrap}>
          {podiumData[0] && <View style={{ flex: 1 }}><PodiumItem {...podiumData[0]} /></View>}
          {podiumData[1] && <View style={{ flex: 1.2, marginHorizontal: 10 }}><PodiumItem {...podiumData[1]} /></View>}
          {podiumData[2] && <View style={{ flex: 1 }}><PodiumItem {...podiumData[2]} /></View>}
        </View>

        <View style={st.listWrap}>
          {others.map(item => (
            <RankingItem key={item.id} {...item} />
          ))}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fbfbf9" },
  header: { alignItems: "center", paddingHorizontal: 24, paddingBottom: 20 },
  headerTitle: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#154212", marginBottom: 4 },
  headerSub: { fontSize: 13, fontFamily: "Nunito_600SemiBold", color: "#6b7280" },
  
  content: { paddingHorizontal: 24, paddingTop: 10 },
  
  tabsWrap: { flexDirection: "row", backgroundColor: "#f3f4f6", borderRadius: 30, padding: 4, marginBottom: 40 },
  tabBtn: { flex: 1, paddingVertical: 12, borderRadius: 26, alignItems: "center" },
  tabActive: { backgroundColor: "#154212", elevation: 2, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 4, shadowOffset: { width: 0, height: 2 } },
  tabText: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#6b7280" },
  tabTextActive: { color: "#fff", fontFamily: "Nunito_800ExtraBold" },

  podiumWrap: { flexDirection: "row", alignItems: "flex-end", marginBottom: 30, paddingTop: 30 },
  listWrap: { marginTop: 10 },
});
