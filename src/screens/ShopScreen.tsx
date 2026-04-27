import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
  Image, StatusBar, StyleSheet, Platform
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { shopService } from "../services/api";
import { useGameStore } from "../store/useGameStore";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRModal from "../components/QRModal";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import * as haptics from "expo-haptics";

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 5 },
});

export default function ShopScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { coins, seeds, userId, buyItem, t } = useGameStore();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [buyingId, setBuyingId] = useState<number | null>(null);

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [currentQr, setCurrentQr] = useState("");
  const [currentItemName, setCurrentItemName] = useState("");

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const data = await shopService.getShopItems();
      setItems(data);
    } catch {
      // Fallback
      setItems([
        { id: 1, name: t('shop.fallback_item_1_name'), price: 500, description: t('shop.fallback_item_1_desc'), image_url: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400" },
        { id: 2, name: t('shop.fallback_item_2_name'), price: 1200, description: t('shop.fallback_item_2_desc'), image_url: "https://images.unsplash.com/photo-1599307734111-d138f6d66934?w=400" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleBuy = async (item: any) => {
    if (coins < item.price) {
      Alert.alert(t('shop.not_enough_coins'), t('shop.not_enough_coins'));
      return;
    }

    Alert.alert(
      t('shop.buy'),
      t('shop.confirm_buy', { price: item.price, unit: t('common.coin_unit'), name: item.name }),
      [
        { text: t('common.cancel'), style: "cancel" },
        { 
          text: t('shop.buy'), 
          onPress: async () => {
            setBuyingId(item.id);
            try {
              const res = await buyItem(item.id, item.price);
              if (res) {
                haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
                setCurrentQr(res.qrCode);
                setCurrentItemName(item.name);
                setQrModalVisible(true);
              } else {
                Alert.alert(t('common.error'), t('common.error'));
              }
            } catch (err: any) {
              Alert.alert(t('common.error'), err?.response?.data?.message || t('common.error'));
            } finally {
              setBuyingId(null);
            }
          } 
        }
      ]
    );
  };

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 10 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#154212" />
        </TouchableOpacity>

        <View style={st.badges}>
          <View style={st.badge}>
            <MaterialCommunityIcons name="leaf" size={16} color="#4ade80" />
            <Text style={st.badgeText}>{seeds}</Text>
          </View>
          <View style={st.badge}>
            <MaterialCommunityIcons name="star-four-points" size={16} color="#fbbf24" />
            <Text style={[st.badgeText, { color: "#154212" }]}>{coins}</Text>
          </View>
        </View>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        <View style={st.titleBox}>
          <Text style={st.title}>{t('shop.title')}</Text>
          <Text style={st.subtitle}>{t('home.balance')}</Text>
        </View>

        {loading ? (
          <View style={st.loader}>
            <ActivityIndicator size="large" color="#154212" />
            <Text style={st.loaderText}>{t('common.loading')}</Text>
          </View>
        ) : (
          items.map((item, index) => (
            <Animated.View key={item.id} entering={FadeInDown.delay(index * 100).duration(500)}>
              <TouchableOpacity activeOpacity={0.9} onPress={() => handleBuy(item)} style={st.card}>
                <View style={st.cardImgWrap}>
                  <Image source={{ uri: item.image_url }} style={st.cardImg} resizeMode="cover" />
                  <LinearGradient colors={['transparent', 'rgba(0,0,0,0.7)']} style={st.cardImgGrad}>
                    <View style={st.pricePill}>
                      <MaterialCommunityIcons name="star-four-points" size={16} color="#fbbf24" />
                      <Text style={st.priceText}>{item.price} {t('common.coin_unit')}</Text>
                    </View>
                  </LinearGradient>
                </View>
                
                <View style={st.cardBody}>
                  <Text style={st.itemName}>{item.name}</Text>
                  <Text style={st.itemDesc}>{item.description}</Text>
                  
                  <TouchableOpacity 
                    onPress={() => handleBuy(item)}
                    disabled={buyingId === item.id}
                    style={st.buyBtn}
                  >
                    {buyingId === item.id ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <>
                        <MaterialCommunityIcons name="gift-outline" size={20} color="white" />
                        <Text style={st.buyBtnText}>{t('shop.buy')}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            </Animated.View>
          ))
        )}
        <View style={{ height: 40 }} />
      </ScrollView>

      <QRModal 
        visible={qrModalVisible}
        qrCode={currentQr}
        itemName={currentItemName}
        onClose={() => setQrModalVisible(false)}
      />
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fbfbf9" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 24, paddingBottom: 10 },
  backBtn: { width: 44, height: 44, backgroundColor: "#fff", borderRadius: 22, alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#f3f4f6", ...SHADOW },
  badges: { flexDirection: "row", gap: 10 },
  badge: { backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6", ...SHADOW },
  badgeText: { marginLeft: 6, fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#374151" },
  
  content: { padding: 24 },
  titleBox: { marginBottom: 24 },
  title: { fontSize: 28, fontFamily: "Nunito_800ExtraBold", color: "#111827", marginBottom: 6 },
  subtitle: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#6b7280", lineHeight: 20 },

  loader: { alignItems: "center", justifyContent: "center", paddingVertical: 60 },
  loaderText: { marginTop: 12, fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#9ca3af" },

  card: { backgroundColor: "#fff", borderRadius: 32, overflow: "hidden", marginBottom: 24, borderWidth: 1, borderColor: "#f3f4f6", ...SHADOW },
  cardImgWrap: { height: 180, width: "100%", position: "relative" },
  cardImg: { width: "100%", height: "100%" },
  cardImgGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", justifyContent: "flex-end", padding: 20 },
  pricePill: { flexDirection: "row", alignItems: "center", backgroundColor: "rgba(0,0,0,0.5)", alignSelf: "flex-start", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, gap: 6 },
  priceText: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 15 },

  cardBody: { padding: 24 },
  itemName: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#111827", marginBottom: 8 },
  itemDesc: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#6b7280", lineHeight: 22, marginBottom: 20 },
  
  buyBtn: { backgroundColor: "#154212", paddingVertical: 16, borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10 },
  buyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Nunito_800ExtraBold" },
});
