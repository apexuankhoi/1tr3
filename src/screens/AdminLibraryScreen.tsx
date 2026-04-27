import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, TextInput, KeyboardAvoidingView, Platform, Image
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameStore } from "../store/useGameStore";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { libraryService, adminService, uploadImage } from "../services/api";

export default function AdminLibraryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const t = useGameStore(s => s.t);
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

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const handleEdit = (item: any) => {
    setCurrentItem(item);
    setEditModalVisible(true);
  };

  const handlePickMedia = async (mediaType: 'image' | 'video' = 'image') => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return Alert.alert(t('common.error'), t('profile.privacy'));

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: mediaType === 'video' ? ImagePicker.MediaTypeOptions.Videos : ImagePicker.MediaTypeOptions.Images,
      allowsEditing: mediaType === 'image',
      aspect: [16, 9],
      quality: 0.7,
    });

    if (!result.canceled) {
      try {
        setLoading(true);
        const url = await uploadImage(result.assets[0].uri);
        if (mediaType === 'video') {
          setCurrentItem({ ...currentItem, video_url: url, type: 'video' });
        } else {
          setCurrentItem({ ...currentItem, image_url: url });
        }
      } catch (err) {
        Alert.alert(t('common.error'), "Không thể tải tệp lên");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSave = async () => {
    if (!currentItem.title) {
      Alert.alert(t('common.error'), "Vui lòng nhập tiêu đề");
      return;
    }
    
    // Auto-thumb for YouTube
    let finalItem = { ...currentItem };
    if (finalItem.type === 'video' && finalItem.video_url?.includes('youtube.com')) {
      const ytId = getYoutubeId(finalItem.video_url);
      if (ytId && !finalItem.image_url) {
        finalItem.image_url = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
      }
    }

    try {
      await adminService.saveLibrary(finalItem);
      setEditModalVisible(false);
      fetchLibrary();
      Alert.alert(t('common.success'), t('common.success'));
    } catch (err) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(t('common.confirm'), "Bạn có chắc chắn muốn xóa bài viết này?", [
      { text: t('common.cancel') },
      { text: t('common.delete'), style: "destructive", onPress: async () => {
          try {
            await adminService.deleteItem("library", id);
            fetchLibrary();
          } catch (err) {
            Alert.alert(t('common.error'), t('common.error'));
          }
      }}
    ]);
  };

  if (loading && items.length === 0) return <View style={st.centered}><ActivityIndicator size="large" color="#154212" /></View>;

  return (
    <View style={[st.root, { paddingTop: insets.top }]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>{t('admin_dash.manage_library')}</Text>
        <TouchableOpacity onPress={() => handleEdit({ title: '', category: 'Trồng trọt', type: 'image', duration: '05:00', image_url: '', video_url: '' })} style={st.addBtn}>
          <MaterialCommunityIcons name="plus" size={24} color="#154212" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={st.list}>
        {items.map(item => (
          <View key={item.id} style={st.card}>
            <View style={{ position: 'relative' }}>
              <Image source={{ uri: item.image_url || "https://images.unsplash.com/photo-1592724212522-88806a03c136?w=800" }} style={st.cardImg} />
              {item.type === 'video' && (
                <View style={{ ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.2)' }}>
                  <MaterialCommunityIcons name="play-circle" size={40} color="#fff" />
                </View>
              )}
            </View>
            <View style={st.cardBody}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                <Text style={[st.cardCat, { color: '#154212' }]}>{item.category}</Text>
                {item.type === 'video' && <MaterialCommunityIcons name="video" size={14} color="#6b7280" />}
              </View>
              <Text style={st.cardTitle}>{item.title}</Text>
              
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
        ))}
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[st.modalContent, { paddingTop: insets.top + 20 }]}>
            <Text style={st.modalTitle}>{currentItem?.id ? "Sửa Bài Viết" : "Thêm Bài Viết"}</Text>
            
            <Text style={st.label}>Loại nội dung</Text>
            <View style={st.typeSelector}>
              <TouchableOpacity 
                onPress={() => setCurrentItem({...currentItem, type: 'image'})}
                style={[st.typeBtn, currentItem?.type === 'image' && st.typeBtnActive]}
              >
                <MaterialCommunityIcons name="image" size={20} color={currentItem?.type === 'image' ? '#fff' : '#475569'} />
                <Text style={[st.typeBtnText, currentItem?.type === 'image' && st.typeBtnTextActive]}>Ảnh/Bài viết</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                onPress={() => setCurrentItem({...currentItem, type: 'video'})}
                style={[st.typeBtn, currentItem?.type === 'video' && st.typeBtnActive]}
              >
                <MaterialCommunityIcons name="video" size={20} color={currentItem?.type === 'video' ? '#fff' : '#475569'} />
                <Text style={[st.typeBtnText, currentItem?.type === 'video' && st.typeBtnTextActive]}>Video</Text>
              </TouchableOpacity>
            </View>

            {currentItem?.type === 'video' ? (
              <View style={st.videoSection}>
                <Text style={st.label}>Nguồn Video</Text>
                <View style={st.row}>
                  <TouchableOpacity 
                    onPress={() => setCurrentItem({...currentItem, video_source: 'youtube'})}
                    style={[st.sourceBtn, (currentItem?.video_source === 'youtube' || !currentItem?.video_source) && st.sourceBtnActive]}
                  >
                    <Text style={[st.sourceBtnText, (currentItem?.video_source === 'youtube' || !currentItem?.video_source) && st.sourceBtnTextActive]}>YouTube Link</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    onPress={() => setCurrentItem({...currentItem, video_source: 'upload'})}
                    style={[st.sourceBtn, currentItem?.video_source === 'upload' && st.sourceBtnActive]}
                  >
                    <Text style={[st.sourceBtnText, currentItem?.video_source === 'upload' && st.sourceBtnTextActive]}>Tải tệp lên</Text>
                  </TouchableOpacity>
                </View>

                {(currentItem?.video_source === 'youtube' || !currentItem?.video_source) ? (
                  <View style={{ marginTop: 12 }}>
                    <TextInput 
                      style={st.input} 
                      placeholder="Dán link YouTube tại đây..." 
                      value={currentItem?.video_url} 
                      onChangeText={t => setCurrentItem({...currentItem, video_url: t})} 
                    />
                    <Text style={st.subLabel}>Hệ thống sẽ tự động lấy ảnh bìa từ YouTube</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={() => handlePickMedia('video')} style={st.videoPicker}>
                    {currentItem?.video_url && !currentItem?.video_url.includes('youtube') ? (
                      <View style={st.videoPreview}>
                        <MaterialCommunityIcons name="file-video" size={32} color="#154212" />
                        <Text style={st.videoName} numberOfLines={1}>Video đã sẵn sàng</Text>
                      </View>
                    ) : (
                      <View style={st.imagePlaceholder}>
                        <MaterialCommunityIcons name="cloud-upload" size={32} color="#64748b" />
                        <Text style={st.placeholderText}>Nhấn để chọn video từ máy</Text>
                      </View>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            ) : (
              <View style={st.imageSection}>
                <Text style={st.label}>Hình ảnh bài viết</Text>
                <TouchableOpacity onPress={() => handlePickMedia('image')} style={st.imagePicker}>
                  {currentItem?.image_url ? (
                    <Image source={{ uri: currentItem.image_url }} style={st.previewImg} />
                  ) : (
                    <View style={st.imagePlaceholder}>
                      <MaterialCommunityIcons name="camera-plus" size={32} color="#64748b" />
                      <Text style={st.placeholderText}>Nhấn để chọn ảnh</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            )}

            <Text style={st.label}>Tiêu đề</Text>
            <TextInput style={st.input} value={currentItem?.title} onChangeText={t => setCurrentItem({...currentItem, title: t})} />

            <Text style={st.label}>Danh mục</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {["Trồng trọt", "Bảo vệ đất", "Nước sạch", "Phân bón", "Khác"].map(cat => (
                <TouchableOpacity 
                  key={cat}
                  onPress={() => setCurrentItem({...currentItem, category: cat})}
                  style={[st.catSelectBtn, currentItem?.category === cat && st.catSelectBtnActive]}
                >
                  <Text style={[st.catSelectText, currentItem?.category === cat && st.catSelectTextActive]}>{cat}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            <Text style={st.label}>Mô tả bài viết</Text>
            <TextInput 
              style={[st.input, { height: 100, textAlignVertical: 'top' }]} 
              multiline 
              value={currentItem?.description} 
              onChangeText={t => setCurrentItem({...currentItem, description: t})} 
            />

            <View style={st.modalBtns}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={st.cancelBtn}><Text style={st.cancelBtnText}>{t('common.cancel')}</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={st.saveBtn}><Text style={st.saveBtnText}>{t('common.save')}</Text></TouchableOpacity>
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
  
  row: { flexDirection: 'row', gap: 10, marginTop: 8 },
  sourceBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: '#f1f5f9', alignItems: 'center', borderWidth: 1, borderColor: '#e2e8f0' },
  sourceBtnActive: { backgroundColor: '#fef3c7', borderColor: '#f59e0b' },
  sourceBtnText: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#64748b' },
  sourceBtnTextActive: { color: '#b45309' },
  
  videoPicker: { width: '100%', height: 120, backgroundColor: '#f1f5f9', borderRadius: 16, borderStyle: 'dashed', borderWidth: 2, borderColor: '#cbd5e1', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  videoPreview: { alignItems: 'center' },
  videoName: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#154212', marginTop: 8, paddingHorizontal: 20 },

  typeSelector: { flexDirection: 'row', gap: 12, marginTop: 8 },
  typeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: '#f1f5f9', gap: 8, borderWidth: 1.5, borderColor: 'transparent' },
  typeBtnActive: { backgroundColor: '#154212', borderColor: '#154212' },
  typeBtnText: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#475569' },
  typeBtnTextActive: { color: '#fff' },

  catSelectBtn: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f1f5f9', marginRight: 8, borderWidth: 1, borderColor: '#e2e8f0' },
  catSelectBtnActive: { backgroundColor: '#fef3c7', borderColor: '#f59e0b' },
  catSelectText: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#64748b' },
  catSelectTextActive: { color: '#b45309' },
});
