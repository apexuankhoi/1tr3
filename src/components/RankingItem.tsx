import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

interface RankingItemProps {
  rank: number;
  name: string;
  points: string;
  imageUri: string;
}

export default function RankingItem({ rank, name, points, imageUri }: RankingItemProps) {
  return (
    <View style={st.card}>
      <View style={st.leftRow}>
        <Text style={st.rank}>{rank}</Text>
        <View style={st.avatarWrap}>
          <Image source={{ uri: imageUri }} style={st.avatar} />
        </View>
        <Text style={st.name} numberOfLines={1}>{name}</Text>
      </View>
      
      <View style={st.rightRow}>
        <Text style={st.points}>{points}</Text>
        <Text style={st.label}>điểm</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  card: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", padding: 16, backgroundColor: "#fff", borderRadius: 20, marginBottom: 12, borderWidth: 1, borderColor: "#f3f4f6", elevation: 1, shadowColor: "#000", shadowOpacity: 0.04, shadowRadius: 6, shadowOffset: { width: 0, height: 3 } },
  leftRow: { flexDirection: "row", alignItems: "center", gap: 14, flex: 1 },
  rank: { fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#6b7280", width: 24, textAlign: "center" },
  avatarWrap: { width: 44, height: 44, borderRadius: 22, overflow: "hidden", backgroundColor: "#f3f4f6" },
  avatar: { width: "100%", height: "100%" },
  name: { fontFamily: "Nunito_700Bold", fontSize: 14, color: "#111827", flex: 1 },
  
  rightRow: { flexDirection: "row", alignItems: "baseline", gap: 4 },
  points: { fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#154212" },
  label: { fontFamily: "Nunito_600SemiBold", fontSize: 11, color: "#9ca3af" },
});
