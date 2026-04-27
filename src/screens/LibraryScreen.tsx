import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  ActivityIndicator,
  Modal,
  Dimensions,
  Platform,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { libraryService } from "../services/api";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { WebView } from "react-native-webview";
import { useGameStore } from "../store/useGameStore";
import { useNavigation } from "@react-navigation/native";

const { width } = Dimensions.get("window");

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 5 },
});

export default function LibraryScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { userRole, seeds, coins, t } = useGameStore();

  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("Tất cả");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res: any = await libraryService.getLibrary();
      // Handle standardized response structure
      const data = res?.data || res;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Lỗi nạp thư viện:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLibrary();
  };

  useEffect(() => {
    fetchLibrary();
  }, []);

  // Dynamic categories
  const dynamicCategories = [
    { id: "Tất cả", label: "Tất cả" },
    ...Array.from(new Set(items.map(i => i.category))).filter(Boolean).map(cat => ({
      id: cat,
      label: cat
    }))
  ];

  const filteredItems = selectedCategory === "Tất cả" 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const renderItem = (item: any, index: number) => {
    const isVideo = item.type === 'video';
    const ytId = isVideo && item.video_url ? getYoutubeId(item.video_url) : null;
    const thumbUrl = ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : item.image_url;

    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100)} 
        key={item.id} 
        style={st.card}
      >
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => isVideo ? setSelectedVideo(item.video_url) : setSelectedArticle(item)}
        >
          <View style={st.cardImageContainer}>
            <Image 
              source={{ uri: (thumbUrl && thumbUrl.trim() !== "") ? thumbUrl : "https://images.unsplash.com/photo-1592724212522-88806a03c136?w=800" }} 
              style={st.cardImage} 
            />
            <LinearGradient
              colors={["transparent", "rgba(0,0,0,0.6)"]}
              style={st.imageOverlay}
            />
            {isVideo && (
              <View style={st.playIconContainer}>
                <MaterialCommunityIcons name="play-circle" size={50} color="#fff" />
              </View>
            )}
            <View style={[st.categoryBadge, { backgroundColor: item.category_color || "#154212" }]}>
              <Text style={st.categoryText}>{item.category || "Kiến thức"}</Text>
            </View>
            {isVideo && (
              <View style={st.videoBadge}>
                <MaterialCommunityIcons name="video" size={14} color="#fff" />
                <Text style={st.videoBadgeText}>VIDEO</Text>
              </View>
            )}
          </View>
          <View style={st.cardBody}>
            <Text style={st.cardTitle} numberOfLines={2}>{item.title}</Text>
            <View style={st.cardFooter}>
              <View style={st.footerItem}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#6b7280" />
                <Text style={st.footerText}>{item.duration || "5 phút"}</Text>
              </View>
              <View style={st.footerItem}>
                <MaterialCommunityIcons name="eye-outline" size={14} color="#6b7280" />
                <Text style={st.footerText}>Xông xáo</Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>
      </Animated.View>
    );
  };

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" />
      
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 10 }]}>
        <View>
          <Text style={st.headerTitle}>{t('library.title_main')}</Text>
          <Text style={st.headerSub}>{t('library.subtitle')}</Text>
        </View>

        <View style={st.badges}>
          {userRole === 'admin' && (
            <TouchableOpacity 
              onPress={() => navigation.navigate("AdminLibrary" as never)} 
              style={[st.badge, { backgroundColor: "#154212" }]}
            >
              <MaterialCommunityIcons name="plus" size={16} color="#fff" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <View style={st.categoryContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20 }}>
          {dynamicCategories.map((cat) => (
            <TouchableOpacity 
              key={cat.id} 
              onPress={() => setSelectedCategory(cat.id)}
              style={[st.categoryButton, selectedCategory === cat.id && st.categoryButtonActive]}
            >
              <Text style={[st.categoryButtonText, selectedCategory === cat.id && st.categoryButtonTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <View style={st.loadingContainer}>
          <ActivityIndicator size="large" color="#154212" />
          <Text style={st.loadingText}>{t('common.loading')}</Text>
        </View>
      ) : (
        <ScrollView 
          style={{ flex: 1 }} 
          contentContainerStyle={st.listContent}
          showsVerticalScrollIndicator={false}
        >
          {filteredItems.length > 0 ? (
            filteredItems.map((item, index) => renderItem(item, index))
          ) : (
            <View style={st.emptyState}>
              <MaterialCommunityIcons name="book-open-blank-variant" size={64} color="#e5e7eb" />
              <Text style={st.emptyText}>{t('library.empty')}</Text>
            </View>
          )}
          <View style={{ height: 100 }} />
        </ScrollView>
      )}

      {/* Video Modal */}
      <Modal visible={!!selectedVideo} transparent animationType="fade">
        <View style={st.modalRoot}>
          <View style={st.modalContent}>
            <TouchableOpacity style={st.closeBtn} onPress={() => setSelectedVideo(null)}>
              <MaterialCommunityIcons name="close" size={28} color="#fff" />
            </TouchableOpacity>
            {selectedVideo && (
              <View style={st.videoWrapper}>
                <WebView
                  style={{ flex: 1, backgroundColor: '#000' }}
                  javaScriptEnabled={true}
                  domStorageEnabled={true}
                  allowsFullscreenVideo={true}
                  mediaPlaybackRequiresUserAction={false}
                  userAgent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
                  source={{ 
                    uri: getYoutubeId(selectedVideo) 
                      ? `https://www.youtube.com/embed/${getYoutubeId(selectedVideo)}?autoplay=1&modestbranding=1` 
                      : (selectedVideo || "about:blank") 
                  }}
                />
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Article Modal */}
      <Modal visible={!!selectedArticle} transparent animationType="slide">
        <View style={st.articleModalRoot}>
          <View style={st.articleModalContent}>
            <View style={st.articleHeader}>
              <Text style={st.articleHeaderTitle}>{t('library.article_detail')}</Text>
              <TouchableOpacity style={st.articleCloseBtn} onPress={() => setSelectedArticle(null)}>
                <MaterialCommunityIcons name="close" size={24} color="#154212" />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={st.articleScroll}>
              {selectedArticle?.image_url ? (
                <Image source={{ uri: selectedArticle.image_url }} style={st.articleImg} />
              ) : (
                <View style={[st.articleImg, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}>
                  <MaterialCommunityIcons name="image-off" size={48} color="#9ca3af" />
                </View>
              )}
              <View style={st.articleBody}>
                <View style={[st.catBadgeSmall, { backgroundColor: selectedArticle?.category_color || "#154212" }]}>
                  <Text style={st.catTextSmall}>{selectedArticle?.category}</Text>
                </View>
                <Text style={st.articleTitle}>{selectedArticle?.title}</Text>
                <View style={st.divider} />
                <Text style={st.articleDesc}>{selectedArticle?.description || "Nội dung đang được cập nhật..."}</Text>
              </View>
              <View style={{ height: 40 }} />
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f9fafb" },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingBottom: 15, backgroundColor: '#fff' },
  headerTitle: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#154212" },
  headerSub: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#6b7280", marginTop: 2 },

  badges: { flexDirection: "row", gap: 8 },
  badge: { backgroundColor: "#fff", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 16, flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#f3f4f6", ...SHADOW },
  badgeText: { marginLeft: 4, fontSize: 13, fontFamily: "Nunito_800ExtraBold", color: "#374151" },

  loadingWrap: { flex: 1, justifyContent: "center", alignItems: "center" },

  card: { backgroundColor: "#fff", borderRadius: 20, marginBottom: 20, overflow: 'hidden', ...SHADOW },
  cardImageContainer: { height: 180, position: 'relative' },
  cardImage: { width: '100%', height: '100%' },
  imageOverlay: { ...StyleSheet.absoluteFillObject },
  playIconContainer: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center' },
  
  categoryBadge: { position: 'absolute', top: 12, left: 12, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  categoryText: { color: '#fff', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
  
  videoBadge: { position: 'absolute', top: 12, right: 12, backgroundColor: 'rgba(0,0,0,0.6)', flexDirection: 'row', alignItems: 'center', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8, gap: 4 },
  videoBadgeText: { color: '#fff', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },

  cardBody: { padding: 15 },
  cardTitle: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#1f2937", lineHeight: 22 },
  cardFooter: { flexDirection: 'row', marginTop: 12, gap: 15 },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerText: { fontSize: 12, color: '#6b7280', fontFamily: 'Nunito_600SemiBold' },

  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 14, color: '#9ca3af', fontFamily: 'Nunito_600SemiBold' },

  modalRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.9)', justifyContent: 'center' },
  modalContent: { width: '100%', aspectRatio: 16/9, position: 'relative' },
  closeBtn: { position: 'absolute', top: -50, right: 20, zIndex: 10 },
  videoWrapper: { flex: 1, backgroundColor: '#000' },

  articleModalRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  articleModalContent: { backgroundColor: '#fff', height: '85%', borderTopLeftRadius: 30, borderTopRightRadius: 30, overflow: 'hidden' },
  articleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  articleHeaderTitle: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: '#154212' },
  articleCloseBtn: { padding: 5 },
  articleScroll: { paddingBottom: 40 },
  articleImg: { width: '100%', height: 250 },
  articleBody: { padding: 20 },
  catBadgeSmall: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, marginBottom: 12 },
  catTextSmall: { color: '#fff', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
  articleTitle: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: '#111827', lineHeight: 28 },
  divider: { height: 2, backgroundColor: '#f3f4f6', marginVertical: 20, width: 60 },
  articleDesc: { fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: '#4b5563', lineHeight: 26 },

  categoryContainer: { backgroundColor: '#fff', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  categoryButton: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: '#f3f4f6', marginRight: 10, borderWidth: 1, borderColor: 'transparent' },
  categoryButtonActive: { backgroundColor: '#154212', borderColor: '#154212' },
  categoryButtonText: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#6b7280' },
  categoryButtonTextActive: { color: '#fff' },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: '#9ca3af' },
  listContent: { paddingHorizontal: 20, paddingTop: 20 },
});
