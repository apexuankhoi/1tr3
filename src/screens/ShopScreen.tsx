import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Alert,
  Image, StatusBar, StyleSheet, Platform, Modal, TextInput, KeyboardAvoidingView,
  Dimensions
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

const { width, height } = Dimensions.get("window");

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 5 },
});

type MainTab = 'garden' | 'rewards';
type GardenFilter = 'all' | 'seed' | 'pot_skin';

export default function ShopScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { coins, seeds, userId, buyItem, t, fullName, userName, inventory, fetchInventory } = useGameStore();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [activeMainTab, setActiveMainTab] = useState<MainTab>('garden');
  const [gardenFilter, setGardenFilter] = useState<GardenFilter>('all');
  
  const [buyingId, setBuyingId] = useState<number | null>(null);
  
  // Real Gift Modal
  const [shippingModalVisible, setShippingModalVisible] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [shippingInfo, setShippingInfo] = useState({
    name: fullName || "",
    phone: userName || "",
    address: "",
    notes: ""
  });

  const [qrModalVisible, setQrModalVisible] = useState(false);
  const [currentQr, setCurrentQr] = useState("");
  const [currentItemName, setCurrentItemName] = useState("");

  useEffect(() => {
    fetchItems();
    fetchInventory();
  }, []);

  const fetchItems = async () => {
    try {
      const data: any = await shopService.getShopItems();
      setItems(data || []);
    } catch {
      setItems([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredItems = items.filter(it => {
    if (activeMainTab === 'rewards') {
      return it.is_real === 1;
    } else {
      // Garden Tab
      if (it.is_real === 1) return false;
      if (gardenFilter === 'all') return true;
      return it.item_type === gardenFilter;
    }
  });

  const handleBuyPress = (item: any) => {
    if (coins < item.price) {
      Alert.alert(t('shop.not_enough_coins'), t('shop.not_enough_coins'));
      return;
    }
    setSelectedItem(item);
    if (item.is_real) {
      setShippingModalVisible(true);
    } else {
      confirmVirtualBuy(item);
    }
  };

  const confirmVirtualBuy = (item: any) => {
    Alert.alert(
      t('shop.buy'),
      t('shop.confirm_buy', { price: item.price, unit: t('common.coin_unit'), name: item.name }),
      [
        { text: t('common.cancel'), style: "cancel" },
        { text: t('shop.buy'), onPress: () => executeBuy(item) }
      ]
    );
  };

  const executeBuy = async (item: any, shippingData?: any) => {
    setBuyingId(item.id);
    try {
      const res = await buyItem(item.id, item.price, shippingData);
      if (res) {
        haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
        if (item.is_real) {
          Alert.alert("Thành công", "Yêu cầu đổi quà đã được gửi! Admin sẽ sớm liên hệ bạn.");
          setShippingModalVisible(false);
        } else if (item.item_type === 'seed') {
          Alert.alert("Thành công", `Bạn đã mua thành công hạt giống ${item.name}!`);
        } else {
          setCurrentQr(res.qrCode || "");
          setCurrentItemName(item.name);
          setQrModalVisible(true);
        }
        fetchItems(); // Refresh stock
        fetchInventory(); // Refresh owned items
      }
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('common.error'));
    } finally {
      setBuyingId(null);
    }
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

      {/* Main Tabs */}
      <View style={st.mainTabs}>
        <TouchableOpacity 
          onPress={() => setActiveMainTab('garden')} 
          style={[st.mainTab, activeMainTab === 'garden' && st.mainTabActive]}
        >
          <Text style={[st.mainTabText, activeMainTab === 'garden' && st.mainTabTextActive]}>Khu vườn</Text>
          {activeMainTab === 'garden' && <View style={st.activeIndicator} />}
        </TouchableOpacity>
        <TouchableOpacity 
          onPress={() => setActiveMainTab('rewards')} 
          style={[st.mainTab, activeMainTab === 'rewards' && st.mainTabActive]}
        >
          <Text style={[st.mainTabText, activeMainTab === 'rewards' && st.mainTabTextActive]}>Quà tặng</Text>
          {activeMainTab === 'rewards' && <View style={st.activeIndicator} />}
        </TouchableOpacity>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={st.content} showsVerticalScrollIndicator={false}>
        <View style={st.titleBox}>
          <Text style={st.title}>{activeMainTab === 'garden' ? "Khu Vườn Của Bạn" : "Đổi Quà Thực Tế"}</Text>
          <Text style={st.subtitle}>
            {activeMainTab === 'garden' 
              ? "Mua sắm hạt giống và chậu cây để xây dựng nông trại xanh mát." 
              : "Sử dụng xu tích lũy từ các hành động xanh để nhận quà thực tế."}
          </Text>
        </View>

        {activeMainTab === 'garden' && (
          <View style={st.filterRow}>
            <TouchableOpacity onPress={() => setGardenFilter('all')} style={[st.filterChip, gardenFilter === 'all' && st.filterChipActive]}>
              <Text style={[st.filterChipText, gardenFilter === 'all' && st.filterChipTextActive]}>Tất cả</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGardenFilter('seed')} style={[st.filterChip, gardenFilter === 'seed' && st.filterChipActive]}>
              <Text style={[st.filterChipText, gardenFilter === 'seed' && st.filterChipTextActive]}>Hạt giống</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setGardenFilter('pot_skin')} style={[st.filterChip, gardenFilter === 'pot_skin' && st.filterChipActive]}>
              <Text style={[st.filterChipText, gardenFilter === 'pot_skin' && st.filterChipTextActive]}>Chậu cây</Text>
            </TouchableOpacity>
          </View>
        )}

        {loading ? (
          <View style={st.loader}>
            <ActivityIndicator size="large" color="#154212" />
          </View>
        ) : filteredItems.length === 0 ? (
          <View style={st.emptyState}>
            <MaterialCommunityIcons name="archive-off-outline" size={60} color="#cbd5e1" />
            <Text style={st.emptyText}>Hiện chưa có vật phẩm nào</Text>
          </View>
        ) : (
          <View style={st.grid}>
            {filteredItems.map((item, index) => {
              const isOwned = item.item_type === 'pot_skin' && inventory.some(i => i.item_id === item.id);
              return (
                <Animated.View key={item.id} entering={FadeInDown.delay(index * 50).duration(400)} style={st.gridItem}>
                  <TouchableOpacity 
                    activeOpacity={0.9} 
                    onPress={() => !isOwned && handleBuyPress(item)} 
                    style={[st.card, isOwned && { opacity: 0.8 }]}
                  >
                    <View style={st.cardImgWrap}>
                      <Image source={{ uri: item.image_url }} style={st.cardImg} resizeMode="cover" />
                      <LinearGradient colors={['transparent', 'rgba(0,0,0,0.6)']} style={st.cardImgGrad}>
                        <View style={st.pricePill}>
                          <Text style={st.priceText}>{isOwned ? "Đã sở hữu" : `${item.price} xu`}</Text>
                        </View>
                      </LinearGradient>
                    </View>
                    <View style={st.cardBody}>
                      <Text style={st.itemName} numberOfLines={1}>{item.name}</Text>
                      <Text style={st.itemDesc} numberOfLines={1}>{item.description}</Text>
                      <TouchableOpacity 
                        onPress={() => handleBuyPress(item)}
                        disabled={buyingId === item.id || isOwned}
                        style={[
                          st.buyBtn, 
                          item.is_real && { backgroundColor: "#c2410c" },
                          isOwned && { backgroundColor: "#94a3b8" }
                        ]}
                      >
                        {buyingId === item.id ? (
                          <ActivityIndicator size="small" color="#fff" />
                        ) : (
                          <Text style={st.buyBtnText}>
                            {isOwned ? "Sở hữu" : item.is_real ? "Đổi" : "Mua"}
                          </Text>
                        )}
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        )}
        <View style={{ height: 100 }} />
      </ScrollView>

      {/* Shipping Info Modal */}
      <Modal visible={shippingModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
          <View style={st.modalOverlay}>
            <View style={st.modalContent}>
              <View style={st.modalHeader}>
                <Text style={st.modalTitle}>Thông tin nhận quà</Text>
                <TouchableOpacity onPress={() => setShippingModalVisible(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              <ScrollView showsVerticalScrollIndicator={false}>
                <Text style={st.inputLabel}>Tên người nhận</Text>
                <TextInput 
                  style={st.input}
                  placeholder="Nhập tên..."
                  value={shippingInfo.name}
                  onChangeText={v => setShippingInfo({...shippingInfo, name: v})}
                />

                <Text style={st.inputLabel}>Số điện thoại</Text>
                <TextInput 
                  style={st.input}
                  placeholder="Nhập SĐT..."
                  keyboardType="phone-pad"
                  value={shippingInfo.phone}
                  onChangeText={v => setShippingInfo({...shippingInfo, phone: v})}
                />

                <Text style={st.inputLabel}>Địa chỉ giao hàng</Text>
                <TextInput 
                  style={[st.input, { height: 80, textAlignVertical: 'top', paddingTop: 12 }]}
                  placeholder="Số nhà, đường, buôn/xã..."
                  multiline
                  value={shippingInfo.address}
                  onChangeText={v => setShippingInfo({...shippingInfo, address: v})}
                />

                <View style={st.confirmSummary}>
                  <Text style={st.summaryText}>Tổng thanh toán:</Text>
                  <Text style={st.summaryPrice}>{selectedItem?.price} Xu</Text>
                </View>

                <TouchableOpacity 
                  style={st.finalBuyBtn}
                  onPress={() => executeBuy(selectedItem, shippingInfo)}
                  disabled={!shippingInfo.address || !shippingInfo.phone || buyingId !== null}
                >
                  <Text style={st.finalBuyBtnText}>Xác nhận đổi quà</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

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
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingBottom: 10 },
  backBtn: { width: 44, height: 44, backgroundColor: "#fff", borderRadius: 22, alignItems: "center", justifyContent: "center", ...SHADOW },
  badges: { flexDirection: "row", gap: 10 },
  badge: { backgroundColor: "#fff", paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, flexDirection: "row", alignItems: "center", ...SHADOW },
  badgeText: { marginLeft: 6, fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#374151" },
  
  mainTabs: { flexDirection: "row", backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#f1f5f9" },
  mainTab: { flex: 1, paddingVertical: 16, alignItems: "center", position: "relative" },
  mainTabActive: {},
  mainTabText: { fontSize: 15, fontFamily: "Nunito_700Bold", color: "#64748b" },
  mainTabTextActive: { color: "#154212", fontFamily: "Nunito_800ExtraBold" },
  activeIndicator: { position: "absolute", bottom: 0, width: "40%", height: 3, backgroundColor: "#154212", borderTopLeftRadius: 3, borderTopRightRadius: 3 },

  content: { padding: 20 },
  titleBox: { marginBottom: 20 },
  title: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#1e293b", marginBottom: 4 },
  subtitle: { fontSize: 13, color: "#64748b", lineHeight: 20 },

  filterRow: { flexDirection: "row", gap: 8, marginBottom: 20 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "#fff", borderWidth: 1, borderColor: "#e2e8f0" },
  filterChipActive: { backgroundColor: "#154212", borderColor: "#154212" },
  filterChipText: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#64748b" },
  filterChipTextActive: { color: "#fff" },

  loader: { paddingVertical: 60, alignItems: "center" },
  emptyState: { paddingVertical: 80, alignItems: "center" },
  emptyText: { marginTop: 12, color: "#94a3b8", fontFamily: "Nunito_700Bold" },

  grid: { flexDirection: "row", flexWrap: "wrap", justifyContent: "space-between" },
  gridItem: { width: "48%", marginBottom: 16 },

  card: { backgroundColor: "#fff", borderRadius: 20, overflow: "hidden", ...SHADOW },
  cardImgWrap: { height: 120, width: "100%" },
  cardImg: { width: "100%", height: "100%" },
  cardImgGrad: { position: "absolute", bottom: 0, left: 0, right: 0, height: "60%", justifyContent: "flex-end", padding: 10 },
  pricePill: { backgroundColor: "rgba(0,0,0,0.6)", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, alignSelf: "flex-start" },
  priceText: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 11 },

  cardBody: { padding: 12 },
  itemName: { fontSize: 15, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  itemDesc: { fontSize: 11, color: "#94a3b8", marginVertical: 6 },
  buyBtn: { backgroundColor: "#154212", paddingVertical: 8, borderRadius: 10, alignItems: "center" },
  buyBtnText: { color: "#fff", fontSize: 13, fontFamily: "Nunito_800ExtraBold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, maxHeight: height * 0.85 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  inputLabel: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#64748b", marginBottom: 6, marginTop: 12 },
  input: { backgroundColor: "#f1f5f9", borderRadius: 12, paddingHorizontal: 16, height: 50, fontSize: 15, fontFamily: "Nunito_600SemiBold" },
  confirmSummary: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 20, borderTopWidth: 1, borderTopColor: "#f1f5f9", marginTop: 20 },
  summaryText: { fontSize: 15, color: "#64748b" },
  summaryPrice: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#154212" },
  finalBuyBtn: { backgroundColor: "#c2410c", paddingVertical: 16, borderRadius: 16, alignItems: "center" },
  finalBuyBtnText: { color: "#fff", fontSize: 16, fontFamily: "Nunito_800ExtraBold" },
});
