import React from "react";
import { View, Text, ScrollView, StyleSheet, Image, TouchableOpacity, Dimensions, StatusBar } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { useNavigation } from "@react-navigation/native";
import { useGameStore } from "../store/useGameStore";

const { width } = Dimensions.get("window");

const RANKING_DATA = [
  { id: 1, coins: 1200, level: 15, avatar: "https://i.pravatar.cc/150?u=a", rank: 1 },
  { id: 2, coins: 900, level: 12, avatar: "https://i.pravatar.cc/150?u=b", rank: 2 },
  { id: 3, coins: 750, level: 10, avatar: "https://i.pravatar.cc/150?u=c", rank: 3 },
  { id: 4, coins: 600, level: 8, avatar: "https://i.pravatar.cc/150?u=d", rank: 4 },
  { id: 5, coins: 500, level: 7, avatar: "https://i.pravatar.cc/150?u=e", rank: 5 },
];

const DEMO_NAME_KEYS = [
  "ranking.demo_name_1",
  "ranking.demo_name_2",
  "ranking.demo_name_3",
  "ranking.demo_name_4",
  "ranking.demo_name_5",
] as const;

export default function RankingScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const t = useGameStore(s => s.t);

  const demoName = (id: number) => t(DEMO_NAME_KEYS[id - 1] ?? DEMO_NAME_KEYS[0]);

  const top3 = RANKING_DATA.slice(0, 3);
  const others = RANKING_DATA.slice(3);

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" />
      <LinearGradient colors={['#154212', '#2d5a27']} style={[st.header, { paddingTop: insets.top + 10 }]}>
        <View style={st.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={32} color="#fff" />
          </TouchableOpacity>
          <Text style={st.headerTitle}>{t('ranking.title_village')}</Text>
          <View style={{ width: 40 }} />
        </View>

        {/* Podium Section */}
        <View style={st.podiumContainer}>
          {/* Rank 2 */}
          <Animated.View entering={FadeInUp.delay(300)} style={[st.podiumItem, st.rank2]}>
            <View style={st.avatarContainer}>
              <Image source={{ uri: top3[1].avatar }} style={st.avatar} />
              <View style={[st.rankBadge, { backgroundColor: '#cbd5e1' }]}>
                <Text style={st.rankBadgeText}>2</Text>
              </View>
            </View>
            <Text style={st.podiumName} numberOfLines={1}>{demoName(top3[1].id)}</Text>
            <Text style={st.podiumCoins}>{top3[1].coins} {t('common.coin_unit')}</Text>
            <View style={[st.podiumBase, { height: 60, backgroundColor: 'rgba(255,255,255,0.1)' }]} />
          </Animated.View>

          {/* Rank 1 */}
          <Animated.View entering={FadeInUp.delay(100)} style={[st.podiumItem, st.rank1]}>
            <MaterialCommunityIcons name="crown" size={30} color="#fcd34d" style={st.crown} />
            <View style={[st.avatarContainer, st.avatarLarge]}>
              <Image source={{ uri: top3[0].avatar }} style={st.avatar} />
              <View style={[st.rankBadge, { backgroundColor: '#fcd34d', width: 28, height: 28 }]}>
                <Text style={[st.rankBadgeText, { color: '#92400e' }]}>1</Text>
              </View>
            </View>
            <Text style={[st.podiumName, st.podiumNameLarge]} numberOfLines={1}>{demoName(top3[0].id)}</Text>
            <Text style={[st.podiumCoins, st.podiumCoinsLarge]}>{top3[0].coins} {t('common.coin_unit')}</Text>
            <View style={[st.podiumBase, { height: 90, backgroundColor: 'rgba(255,255,255,0.2)' }]} />
          </Animated.View>

          {/* Rank 3 */}
          <Animated.View entering={FadeInUp.delay(500)} style={[st.podiumItem, st.rank3]}>
            <View style={st.avatarContainer}>
              <Image source={{ uri: top3[2].avatar }} style={st.avatar} />
              <View style={[st.rankBadge, { backgroundColor: '#fb923c' }]}>
                <Text style={st.rankBadgeText}>3</Text>
              </View>
            </View>
            <Text style={st.podiumName} numberOfLines={1}>{demoName(top3[2].id)}</Text>
            <Text style={st.podiumCoins}>{top3[2].coins} {t('common.coin_unit')}</Text>
            <View style={[st.podiumBase, { height: 45, backgroundColor: 'rgba(255,255,255,0.05)' }]} />
          </Animated.View>
        </View>
      </LinearGradient>

      <ScrollView style={st.list} contentContainerStyle={{ paddingBottom: 40 }} showsVerticalScrollIndicator={false}>
        <View style={st.listInner}>
          <Text style={st.sectionTitle}>{t('ranking.list_title')}</Text>
          {others.map((item, index) => (
            <Animated.View 
              key={item.id} 
              entering={FadeInDown.delay(700 + index * 100)} 
              style={st.rankRow}
            >
              <Text style={st.rowRank}>{item.rank}</Text>
              <Image source={{ uri: item.avatar }} style={st.rowAvatar} />
              <View style={st.rowInfo}>
                <Text style={st.rowName}>{demoName(item.id)}</Text>
                <Text style={st.rowLevel}>{t('ranking.level_label', { level: item.level })}</Text>
              </View>
              <View style={st.rowCoinsWrap}>
                <MaterialCommunityIcons name="star-circle" size={18} color="#f59e0b" />
                <Text style={st.rowCoins}>{item.coins} {t('common.coin_unit')}</Text>
              </View>
            </Animated.View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: { paddingBottom: 20, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10 },
  backBtn: { padding: 8 },
  headerTitle: { fontSize: 22, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  
  podiumContainer: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'center', marginTop: 30, paddingHorizontal: 20, paddingBottom: 10 },
  podiumItem: { alignItems: 'center', flex: 1 },
  rank1: {},
  rank2: {},
  rank3: {},
  avatarContainer: { width: 60, height: 60, borderRadius: 30, borderWidth: 3, borderColor: 'rgba(255,255,255,0.3)', backgroundColor: '#fff', padding: 2, marginBottom: 8, position: 'relative' },
  avatarLarge: { width: 84, height: 84, borderRadius: 42, borderColor: '#fcd34d' },
  avatar: { width: '100%', height: '100%', borderRadius: 100 },
  rankBadge: { position: 'absolute', bottom: -5, alignSelf: 'center', width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#fff' },
  rankBadgeText: { fontSize: 10, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  
  crown: { marginBottom: -5, zIndex: 10 },
  podiumName: { fontSize: 13, fontFamily: "Nunito_700Bold", color: "#fff", marginBottom: 2 },
  podiumNameLarge: { fontSize: 16, fontFamily: "Nunito_800ExtraBold" },
  podiumCoins: { fontSize: 12, fontFamily: "Nunito_800ExtraBold", color: "#fcd34d" },
  podiumCoinsLarge: { fontSize: 15 },
  podiumBase: { width: '90%', borderTopLeftRadius: 15, borderTopRightRadius: 15, marginTop: 10 },

  list: { flex: 1, marginTop: -20 },
  listInner: { backgroundColor: '#fff', marginHorizontal: 20, borderRadius: 30, padding: 20, minHeight: 400, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  sectionTitle: { fontSize: 18, fontFamily: "Nunito_800ExtraBold", color: "#1e293b", marginBottom: 20 },
  
  rankRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 15, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  rowRank: { width: 30, fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#64748b" },
  rowAvatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12 },
  rowInfo: { flex: 1 },
  rowName: { fontSize: 15, fontFamily: "Nunito_700Bold", color: "#1e293b" },
  rowLevel: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#64748b" },
  rowCoinsWrap: { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#fff7ed', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 15 },
  rowCoins: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#ea580c" },
});
