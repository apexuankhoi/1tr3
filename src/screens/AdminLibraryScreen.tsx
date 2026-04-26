import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Image
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { libraryService, adminService, uploadImage } from "../services/api";

export default function AdminLibraryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentItem, setCurrentItem] = useState<any>(null);

  useEffect(() => {
    fetchLibrary();
  }, []);

  const fetchLibrary = async () => {
    try {
      const data = await libraryService.getLibrary();
      setItems(data);
    } catch (err) {
      console.error("Lỗi tải thư viện:", err);
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
    if (status !== 'granted') return Alert.alert("Lỗi", "Cần quyền truy cập thư viện");

    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      try {
        setLoading(true);
        const url = await uploadImage(result.assets[0].uri);
        setCurrentItem({ ...currentItem, image_url: url });
      } catch (err) {
        Alert.alert("Lỗi", "Không thể tải ảnh lên");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!currentItem.title) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");
      return;
    }
    try {
      await adminService.saveLibrary(currentItem);
      setEditModalVisible(false);
      fetchLibrary();
      Alert.alert("Thành công", "Đã lưu bài viết");
    } catch (err) {
      Alert.alert("Lỗi", "Không thể lưu bài viết");
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert("Xác nhận", "Bạn có chắc muốn xóa bài viết này?", [
      { text: "Hủy" },
      { text: "Xóa", style: "destructive", onPress: async () => {
          try {
            await adminService.deleteItem("library", id);
            fetchLibrary();
          } catch (err) {
            Alert.alert("Lỗi", "Không thể xóa");
          }
      }}
    ]);
  };

  if (loading) return <View style={st.centered}><ActivityIndicator size="large" color="#154212" /></View>;

  return (
    <View style={[st.root, { paddingTop: insets.top }]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Quản Lý Thư Viện</Text>
        <TouchableOpacity onPress={() => handleEdit({ title: '', category: 'KIẾN THỨC', duration: '05:00', category_color: '#154212', image_url: 'https://images.unsplash.com/photo-1592724212522-88806a03c136?w=800' })} style={st.addBtn}>
          <MaterialCommunityIcons name="plus" size={24} color="#154212" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={st.list}>
        {items.map(item => (
          <View key={item.id} style={st.card}>
            <Image source={{ uri: item.image_url }} style={st.cardImg} />
            <View style={st.cardBody}>
              <Text style={[st.cardCat, { color: item.category_color }]}>{item.category}</Text>
              <Text style={st.cardTitle}>{item.title}</Text>
              <Text style={st.cardDesc} numberOfLines={2}>{item.description}</Text>
              
              <View style={st.cardActions}>
                <TouchableOpacity onPress={() => handleEdit(item)} style={st.editBtn}>
                  <MaterialCommunityIcons name="pencil" size={18} color="#2563eb" />
                  <Text style={[st.actionText, { color: "#2563eb" }]}>Sửa</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleDelete(item.id)} style={st.deleteBtn}>
                  <MaterialCommunityIcons name="trash-can" size={18} color="#ef4444" />
                  <Text style={[st.actionText, { color: "#ef4444" }]}>Xóa</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[st.modalContent, { paddingTop: insets.top + 20 }]}>
            <Text style={st.modalTitle}>{currentItem?.id ? "Sửa Bài Viết" : "Thêm Bài Viết"}</Text>
            
            <Text style={st.label}>Tiêu đề</Text>
            <TextInput style={st.input} value={currentItem?.title} onChangeText={t => setCurrentItem({...currentItem, title: t})} />

            <Text style={st.label}>Danh mục (Viết hoa)</Text>
            <TextInput style={st.input} value={currentItem?.category} onChangeText={t => setCurrentItem({...currentItem, category: t})} />

            <Text style={st.label}>Thời lượng (Ví dụ: 05:20)</Text>
            <TextInput style={st.input} value={currentItem?.duration} onChangeText={t => setCurrentItem({...currentItem, duration: t})} />

            <Text style={st.label}>Mô tả</Text>
            <TextInput 
              style={[st.input, { height: 100, textAlignVertical: 'top' }]} 
              multiline 
              value={currentItem?.description} 
              onChangeText={t => setCurrentItem({...currentItem, description: t})} 
            />

            <Text style={st.label}>Hình ảnh bài viết</Text>
            <TouchableOpacity onPress={handlePickImage} style={st.imagePicker}>
              {currentItem?.image_url ? (
                <Image source={{ uri: currentItem.image_url }} style={st.previewImg} />
              ) : (
                <View style={st.imagePlaceholder}>
                  <MaterialCommunityIcons name="camera-plus" size={32} color="#64748b" />
                  <Text style={st.placeholderText}>Nhấn để chọn ảnh</Text>
                </View>
              )}
            </TouchableOpacity>
            <Text style={st.subLabel}>Hoặc dán URL: {currentItem?.image_url?.substring(0, 30)}...</Text>

            <Text style={st.label}>Mã màu danh mục (HEX)</Text>
            <TextInput style={st.input} value={currentItem?.category_color} onChangeText={t => setCurrentItem({...currentItem, category_color: t})} />

            <View style={st.modalBtns}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={st.cancelBtn}><Text style={st.cancelBtnText}>Hủy</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={st.saveBtn}><Text style={st.saveBtnText}>Lưu Lại</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  addBtn: { padding: 5, backgroundColor: '#fef3c7', borderRadius: 8 },
  
  list: { padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 24, marginBottom: 20, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cardImg: { width: '100%', height: 160 },
  cardBody: { padding: 16 },
  cardCat: { fontSize: 11, fontFamily: "Nunito_800ExtraBold", letterSpacing: 1, marginBottom: 4 },
  cardTitle: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#1e293b", marginBottom: 8 },
  cardDesc: { fontSize: 13, fontFamily: "Nunito_600SemiBold", color: "#64748b", lineHeight: 18 },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 12, paddingTop: 12, gap: 16 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14, fontFamily: "Nunito_700Bold" },

  modalContent: { padding: 24, paddingBottom: 60 },
  modalTitle: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#0f172a", marginBottom: 24 },
  label: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#475569", marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, fontSize: 16, fontFamily: "Nunito_600SemiBold", color: "#1e293b" },
  imagePicker: { width: '100%', height: 180, backgroundColor: '#f1f5f9', borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', overflow: 'hidden', justifyContent: 'center', alignItems: 'center', marginBottom: 8 },
  previewImg: { width: '100%', height: '100%' },
  imagePlaceholder: { alignItems: 'center' },
  placeholderText: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#64748b', marginTop: 8 },
  subLabel: { fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: '#94a3b8', marginBottom: 16 },
  modalBtns: { flexDirection: 'row', gap: 16, marginTop: 40 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center' },
  saveBtn: { flex: 2, padding: 16, borderRadius: 16, backgroundColor: '#154212', alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontFamily: "Nunito_700Bold", color: "#475569" },
  saveBtnText: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
});
