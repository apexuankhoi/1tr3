import React from "react";
import { View, Text, Image, TouchableOpacity, Dimensions, StyleSheet } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";

interface AudioStoryCardProps {
  title: string;
  author: string;
  duration: string;
  imageUri: string;
}

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.75;

export default function AudioStoryCard({ title, author, duration, imageUri }: AudioStoryCardProps) {
  return (
    <TouchableOpacity activeOpacity={0.9} style={st.card}>
      <Image source={{ uri: imageUri }} style={st.img} />
      <View style={st.overlay} />
      
      {/* Play Button Overlay */}
      <View style={st.playCenter}>
        <View style={st.playBtn}>
          <MaterialCommunityIcons name="play" size={36} color="white" />
        </View>
      </View>

      <View style={st.contentWrap}>
        <View style={st.metaPill}>
          <Text style={st.metaText}>{author} • {duration}</Text>
        </View>
        <Text style={st.title} numberOfLines={2}>{title}</Text>
      </View>
    </TouchableOpacity>
  );
}

const st = StyleSheet.create({
  card: { width: CARD_WIDTH, marginRight: 24, borderRadius: 24, overflow: "hidden", aspectRatio: 4/5, backgroundColor: "#fff", elevation: 5, shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 10, shadowOffset: { width: 0, height: 5 } },
  img: { width: "100%", height: "100%", resizeMode: "cover" },
  overlay: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.3)" },
  
  playCenter: { position: "absolute", top: 0, bottom: 0, left: 0, right: 0, alignItems: "center", justifyContent: "center" },
  playBtn: { width: 64, height: 64, borderRadius: 32, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.4)" },

  contentWrap: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 24 },
  metaPill: { backgroundColor: "rgba(0,0,0,0.5)", alignSelf: "flex-start", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, marginBottom: 12 },
  metaText: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 11 },
  title: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 20, lineHeight: 28 },
});
