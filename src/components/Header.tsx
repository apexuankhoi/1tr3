import React from "react";
import { View, Text, StyleSheet, Platform, TouchableOpacity, Image } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameStore } from "../store/useGameStore";

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  android: { elevation: 3 },
});

export default function Header() {
  const insets = useSafeAreaInsets();
  const { coins, t } = useGameStore();

  return (
    <View style={[st.container, { paddingTop: insets.top }]}>
      <View style={st.inner}>
        <Text style={st.title}>{t('home.garden_title')}</Text>

        <View style={st.right}>
          <View style={st.coinBox}>
            <MaterialCommunityIcons name="star-four-points" size={16} color="#fbbf24" />
            <Text style={st.coinText}>{coins.toLocaleString()}</Text>
          </View>

          <TouchableOpacity activeOpacity={0.8} style={st.avatarWrap}>
            <Image 
              source={{ uri: "https://images.unsplash.com/photo-1599307734111-d138f6d66934?w=100" }} 
              style={st.avatar} 
            />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  container: { backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f3f4f6", ...SHADOW, zIndex: 40 },
  inner: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", height: 64, paddingHorizontal: 24 },
  title: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#154212" },
  right: { flexDirection: "row", alignItems: "center", gap: 12 },
  coinBox: { flexDirection: "row", alignItems: "center", gap: 6, backgroundColor: "#f0fdf4", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, borderWidth: 1, borderColor: "#dcfce7" },
  coinText: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#154212" },
  avatarWrap: { width: 40, height: 40, borderRadius: 20, borderWidth: 2, borderColor: "#4ade80", overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },
});
