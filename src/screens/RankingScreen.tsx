import React, { useState, useEffect } from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, ActivityIndicator, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import PodiumItem from "../components/PodiumItem";
import RankingItem from "../components/RankingItem";
import { communityService } from "../services/api";
import { useGameStore } from "../store/useGameStore";

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  
  const mockRanking = [
    { id: 1, full_name: "Nguyễn Văn A", coins: 1200, avatar_url: null, rank: 1, score: 1200 },
    { id: 2, full_name: "K'sor H'Bia", coins: 900, avatar_url: null, rank: 2, score: 900 },
    { id: 3, full_name: "Y'Phúc Niê", coins: 750, avatar_url: null, rank: 3, score: 750 },
    { id: 4, full_name: "H'Lâm Đắk", coins: 620, avatar_url: null, rank: 4, score: 620 },
    { id: 5, full_name: "Ama H'rin", coins: 580, avatar_url: null, rank: 5, score: 580 },
  ];

  const podiumData = [mockRanking[1], mockRanking[0], mockRanking[2]];
  const others = mockRanking.slice(3);

  return (
    <View style={st.root}>
      <View style={[st.header, { paddingTop: insets.top + 20 }]}>
        <Text style={st.headerTitle}>Bảng vàng buôn làng</Text>
        <Text style={st.headerSub}>Thi đua rẫy xanh - Tích xu đổi quà</Text>
      </View>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={st.content} 
        showsVerticalScrollIndicator={false}
      >
        <View style={st.podiumWrap}>
          <View style={{ flex: 1 }}><PodiumItem {...podiumData[0]} /></View>
          <View style={{ flex: 1.2, marginHorizontal: 10 }}><PodiumItem {...podiumData[1]} isFirst /></View>
          <View style={{ flex: 1 }}><PodiumItem {...podiumData[2]} /></View>
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
