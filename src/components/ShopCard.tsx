import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

export default function ShopCard({ title, price, description, imageUri, onBuy }: any) {
  return (
    <View style={st.card}>
      <View style={st.imgWrap}>
        <Image source={{ uri: imageUri }} style={st.img} />
        <View style={st.pricePill}>
          <MaterialCommunityIcons name="star-four-points" size={14} color="#fbbf24" />
          <Text style={st.priceText}>{price}</Text>
        </View>
      </View>
      <View style={st.body}>
        <Text style={st.title}>{title}</Text>
        <Text style={st.desc} numberOfLines={2}>{description}</Text>
        <TouchableOpacity style={st.btn} onPress={onBuy} activeOpacity={0.85}>
          <MaterialCommunityIcons name="cart" size={20} color="#fff" />
          <Text style={st.btnText}>Đổi thưởng ngay</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 24, overflow: "hidden", marginBottom: 24, elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 }, borderWidth: 1, borderColor: "#f3f4f6" },
  imgWrap: { height: 180, width: "100%", position: "relative" },
  img: { width: "100%", height: "100%", resizeMode: "cover" },
  pricePill: { position: "absolute", top: 16, right: 16, backgroundColor: "rgba(0,0,0,0.6)", flexDirection: "row", alignItems: "center", gap: 6, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
  priceText: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 13 },
  body: { padding: 20 },
  title: { fontSize: 18, fontFamily: "Nunito_800ExtraBold", color: "#111827", marginBottom: 8 },
  desc: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#6b7280", lineHeight: 20, marginBottom: 20 },
  btn: { backgroundColor: "#154212", flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, paddingVertical: 14, borderRadius: 20 },
  btnText: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 16 },
});
