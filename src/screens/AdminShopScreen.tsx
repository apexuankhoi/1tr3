import React, { useState, useEffect } from "react";
import {
  View, Text, ScrollView, StyleSheet, TouchableOpacity,
  ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Image
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useGameStore } from "../store/useGameStore";
import { shopService, adminService, uploadImage } from "../services/api";

export default function AdminShopScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const t = useGameStore((s: any) => s.t);
  const [items, setItems] = useState<any[]>([]);
  const [originalItems, setOriginalItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [stockModalVisible, setStockModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);
  const [stocks, setStocks] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const shopItems: any = await shopService.getShopItems();
      const stockData: any = await adminService.getStocks();
      setItems(shopItems || []);
      setOriginalItems(shopItems || []);
      setStocks(stockData || []);
    } catch (err) {
      console.error("Lỗi tải dữ liệu:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    setEditModalVisible(true);
  };

  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert(t('common.error'), t('profile.privacy'));

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      try {
        setLoading(true);
        const url = await uploadImage(result.assets[0].uri);
        setCurrentItem({ ...currentItem, image_url: url });
      } catch (err) {
        Alert.alert(t('common.error'), t('common.error'));
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!currentItem.name || !currentItem.price) {
      Alert.alert(t('common.error'), t('common.error'));
      return;
    }
    try {
      await adminService.saveShop(currentItem);
      setEditModalVisible(false);
      fetchData();
      Alert.alert(t('common.success'), t('common.success'));
    } catch (err) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(t('common.confirm'), t('admin_users.confirm_delete'), [
      { text: t('common.cancel') },
      {
        text: t('common.delete'), style: "destructive", onPress: async () => {
          try {
            await adminService.deleteItem("shop", id);
            fetchData();
          } catch (err) {
            Alert.alert(t('common.error'), t('common.error'));
          }
        }
      }
    ]);
  };

  const updateStock = async (itemId: number, newQty: string) => {
    const qty = parseInt(newQty) || 0;
    try {
      await adminService.updateStock(itemId, qty);
      fetchData();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể cập nhật kho");
    }
  };

  if (loading && items.length === 0) return <View style={st.centered}><ActivityIndicator size="large" color="#154212" /></View>;

  return (
    <View style={[st.root, { paddingTop: insets.top }]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>{t('admin_shop.title')}</Text>
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <TouchableOpacity onPress={() => setStockModalVisible(true)} style={[st.addBtn, { backgroundColor: '#e0f2fe' }]}>
            <MaterialCommunityIcons name="package-variant-closed" size={24} color="#0369a1" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleEdit({ name: '', price: 0, description: '', image_url: '' })} style={st.addBtn}>
            <MaterialCommunityIcons name="plus" size={24} color="#154212" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView contentContainerStyle={st.list}>
        {items.map(item => {
          const stock = stocks.find(s => s.id === item.id)?.quantity || 0;
          return (
            <View key={item.id} style={st.card}>
              <Image source={{ uri: item.image_url }} style={st.cardImg} />
              <View style={st.cardBody}>
                <View style={st.row}>
                  <Text style={st.cardTitle}>{item.name}</Text>
                  <Text style={st.cardPrice}>{item.price} {t('ranking.point')}</Text>
                </View>
                <Text style={st.cardDesc} numberOfLines={2}>{item.description}</Text>
                <Text style={[st.stockText, stock < 10 && { color: '#ef4444' }]}>{t('shop.stock')}: {stock}</Text>

                <View style={st.cardActions}>
                  <TouchableOpacity onPress={() => handleEdit(item)} style={st.editBtn}>
                    <MaterialCommunityIcons name="pencil" size={18} color="#2563eb" />
                    <Text style={[st.actionText, { color: "#2563eb" }]}>{t('common.edit')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDelete(item.id)} style={st.deleteBtn}>
                    <MaterialCommunityIcons name="trash-can" size={18} color="#ef4444" />
                    <Text style={[st.actionText, { color: "#ef4444" }]}>{t('common.delete')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          );
        })}
      </ScrollView>

      {/* Edit Modal */}
      <Modal visible={editModalVisible} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[st.modalContent, { paddingTop: insets.top + 20 }]}>
            <Text style={st.modalTitle}>{currentItem?.id ? t('admin_shop.edit_item') : t('admin_shop.add_item')}</Text>

            <Text style={st.label}>{t('admin_shop.image')}</Text>
            <TouchableOpacity onPress={handlePickImage} style={st.imagePicker}>
              {currentItem?.image_url ? (
                <Image source={{ uri: currentItem.image_url }} style={st.previewImg} />
              ) : (
                <View style={st.imagePlaceholder}>
                  <MaterialCommunityIcons name="camera-plus" size={32} color="#64748b" />
                  <Text style={st.placeholderText}>{t('common.search')}</Text>
                </View>
              )}
            </TouchableOpacity>

            <Text style={st.label}>{t('admin_shop.name')}</Text>
            <TextInput style={st.input} value={currentItem?.name} onChangeText={t => setCurrentItem({ ...currentItem, name: t })} />

            <Text style={st.label}>{t('admin_forms.price_label')}</Text>
            <TextInput style={st.input} keyboardType="numeric" value={currentItem?.price?.toString()} onChangeText={t => setCurrentItem({ ...currentItem, price: parseInt(t) || 0 })} />

            <Text style={st.label}>{t('admin_shop.desc')}</Text>
            <TextInput
              style={[st.input, { height: 80, textAlignVertical: 'top' }]}
              multiline
              value={currentItem?.description}
              onChangeText={t => setCurrentItem({ ...currentItem, description: t })}
            />

            <View style={st.modalBtns}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={st.cancelBtn}><Text style={st.cancelBtnText}>{t('common.cancel')}</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={st.saveBtn}><Text style={st.saveBtnText}>{t('common.save')}</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>

      {/* Stock Modal */}
      <Modal visible={stockModalVisible} animationType="fade" transparent>
        <View style={st.overlay}>
          <View style={st.stockCard}>
            <Text style={st.modalTitle}>{t('admin_shop.stock_mgmt')}</Text>
            <ScrollView style={{ maxHeight: 400 }}>
              {stocks.map(s => (
                <View key={s.id} style={st.stockRow}>
                  <Text style={st.stockName}>{s.name}</Text>
                  <TextInput
                    style={st.stockInput}
                    keyboardType="numeric"
                    defaultValue={s.quantity.toString()}
                    onEndEditing={(e: any) => updateStock(s.id, e.nativeEvent.text)}
                  />
                </View>
              ))}
            </ScrollView>
            <TouchableOpacity onPress={() => setStockModalVisible(false)} style={st.saveBtn}><Text style={st.saveBtnText}>{t('common.close')}</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontFamily: "Nunito_800ExtraBold", color: "#0f172a" },
  addBtn: { padding: 8, backgroundColor: '#fef3c7', borderRadius: 8 },

  list: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, marginBottom: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cardImg: { width: '100%', height: 140 },
  cardBody: { padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  cardTitle: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  cardPrice: { fontSize: 15, fontFamily: "Nunito_800ExtraBold", color: "#154212" },
  cardDesc: { fontSize: 13, fontFamily: "Nunito_600SemiBold", color: "#64748b", lineHeight: 18 },
  stockText: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#154212", marginTop: 8 },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 12, paddingTop: 12, gap: 16 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14, fontFamily: "Nunito_700Bold" },

  modalContent: { padding: 24, paddingBottom: 60 },
  modalTitle: { fontSize: 22, fontFamily: "Nunito_800ExtraBold", color: "#0f172a", marginBottom: 20 },
  label: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#475569", marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, fontSize: 16, fontFamily: "Nunito_600SemiBold", color: "#1e293b" },
  imagePicker: { width: 120, height: 120, backgroundColor: '#f1f5f9', borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  previewImg: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  placeholderText: { fontSize: 10, fontFamily: 'Nunito_600SemiBold', color: '#64748b', marginTop: 4 },
  modalBtns: { flexDirection: 'row', gap: 16, marginTop: 40 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center' },
  saveBtn: { flex: 2, padding: 16, borderRadius: 16, backgroundColor: '#154212', alignItems: 'center', marginTop: 20 },
  cancelBtnText: { fontSize: 16, fontFamily: "Nunito_700Bold", color: "#475569" },
  saveBtnText: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#fff" },

  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  stockCard: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  stockRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  stockName: { flex: 1, fontSize: 15, fontFamily: "Nunito_700Bold", color: "#1e293b" },
  stockInput: { width: 60, backgroundColor: '#f1f5f9', padding: 8, borderRadius: 8, textAlign: 'center', fontFamily: "Nunito_800ExtraBold" }
});
