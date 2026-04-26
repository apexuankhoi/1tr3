import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface PodiumItemProps {
  rank: number;
  name: string;
  points: string;
  imageUri: string;
  isFirst?: boolean;
}

export default function PodiumItem({ rank, name, points, imageUri, isFirst }: PodiumItemProps) {
  const rankColor = rank === 1 ? "#fbbf24" : rank === 2 ? "#9ca3af" : "#b45309";
  const rankTextColor = rank === 1 ? "#fff" : "#fff";

  return (
    <View style={[st.container, isFirst ? st.containerFirst : st.containerOther]}>
      {/* Rank Badge */}
      <View style={[st.badgeWrap, isFirst ? st.badgeFirst : st.badgeOther, { backgroundColor: rankColor, borderColor: isFirst ? "#154212" : "#fff" }]}>
        {isFirst ? (
          <MaterialCommunityIcons name="crown" size={28} color={rankTextColor} />
        ) : (
          <Text style={[st.badgeText, { color: rankTextColor }]}>{rank}</Text>
        )}
      </View>

      {/* Avatar */}
      <View style={[st.avatarWrap, isFirst ? st.avatarFirst : st.avatarOther, { borderColor: rankColor }]}>
        <Image source={{ uri: imageUri }} style={st.avatar} />
      </View>

      <Text style={[st.name, isFirst ? st.nameFirst : st.nameOther]} numberOfLines={1}>{name}</Text>
      
      <View style={st.scoreBox}>
        <Text style={[st.points, isFirst ? st.pointsFirst : st.pointsOther]}>{points}</Text>
        <Text style={[st.label, isFirst ? st.labelFirst : st.labelOther]}>điểm</Text>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { alignItems: "center", borderRadius: 24, padding: 16, position: "relative" },
  containerFirst: { backgroundColor: "#154212", paddingBottom: 30, marginTop: -30, zIndex: 10, elevation: 10, shadowColor: "#154212", shadowOpacity: 0.3, shadowRadius: 15, shadowOffset: { width: 0, height: 8 } },
  containerOther: { backgroundColor: "#fff", paddingBottom: 24, borderWidth: 1, borderColor: "#f3f4f6", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  
  badgeWrap: { position: "absolute", alignItems: "center", justifyContent: "center", borderRadius: 30, borderWidth: 4 },
  badgeFirst: { width: 60, height: 60, top: -30 },
  badgeOther: { width: 44, height: 44, top: -22 },
  badgeText: { fontSize: 16, fontFamily: "Nunito_800ExtraBold" },

  avatarWrap: { borderRadius: 50, overflow: "hidden", borderWidth: 4, marginBottom: 12 },
  avatarFirst: { width: 84, height: 84, marginTop: 24 },
  avatarOther: { width: 64, height: 64, marginTop: 16 },
  avatar: { width: "100%", height: "100%" },

  name: { fontFamily: "Nunito_800ExtraBold", textAlign: "center", marginBottom: 4 },
  nameFirst: { color: "#fff", fontSize: 16 },
  nameOther: { color: "#374151", fontSize: 13 },

  scoreBox: { alignItems: "center" },
  points: { fontFamily: "Nunito_800ExtraBold" },
  pointsFirst: { color: "#fbbf24", fontSize: 24 },
  pointsOther: { color: "#154212", fontSize: 18 },

  label: { fontFamily: "Nunito_600SemiBold", fontSize: 10 },
  labelFirst: { color: "rgba(255,255,255,0.7)" },
  labelOther: { color: "#9ca3af" },
});
