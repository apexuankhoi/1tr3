import React from "react";
import { View, Text, Image, TouchableOpacity, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface VideoGuideCardProps {
  title: string;
  category: string;
  duration: string;
  description: string;
  imageUri: string;
  categoryColor: string;
}

export default function VideoGuideCard({ title, category, duration, description, imageUri, categoryColor }: VideoGuideCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.8} style={st.card}>
      <View style={st.imgWrap}>
        <Image source={{ uri: imageUri }} style={st.img} />
        <View style={st.overlay} />
        
        {/* Play Button */}
        <View style={st.playBtn}>
          <MaterialCommunityIcons name="play" size={24} color="white" />
        </View>

        {/* Duration */}
        <View style={st.durationWrap}>
          <Text style={st.durationText}>{duration}</Text>
        </View>
      </View>

      <View style={st.contentWrap}>
        <Text style={[st.category, { color: categoryColor }]}>{category}</Text>
        <Text style={st.title} numberOfLines={2}>{title}</Text>
        <Text style={st.desc} numberOfLines={2}>{description}</Text>
      </View>
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  card: { backgroundColor: "#fff", borderRadius: 24, overflow: "hidden", marginBottom: 24, borderWidth: 1, borderColor: "#f3f4f6", elevation: 2, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  imgWrap: { aspectRatio: 16/9, width: "100%", position: "relative" },
  img: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.15)" },
  
  playBtn: { position: "absolute", bottom: 16, right: 16, width: 44, height: 44, borderRadius: 22, backgroundColor: "#154212", alignItems: "center", justifyContent: "center", elevation: 5, shadowColor: "#154212", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  durationWrap: { position: "absolute", bottom: 16, left: 16, backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  durationText: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, color: "#fff" },

  contentWrap: { padding: 20 },
  category: { fontFamily: "Nunito_800ExtraBold", fontSize: 11, textTransform: "uppercase", letterSpacing: 1, marginBottom: 8 },
  title: { fontFamily: "Nunito_800ExtraBold", fontSize: 18, color: "#111827", marginBottom: 8, lineHeight: 26 },
  desc: { fontFamily: "Nunito_600SemiBold", fontSize: 14, color: "#6b7280", lineHeight: 22 },
});
