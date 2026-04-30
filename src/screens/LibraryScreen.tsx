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
import { Video, ResizeMode } from 'expo-av';

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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const [prices, setPrices] = useState<any>(null);
  const [pricesLoading, setPricesLoading] = useState(true);
  const [isFertExpanded, setIsFertExpanded] = useState(false);

  const fetchPrices = async () => {
    try {
      const data: any = await libraryService.getPrices();
      setPrices(data);
    } catch (error) {
      console.error("Lỗi lấy giá:", error);
    } finally {
      setPricesLoading(false);
    }
  };

  const fetchLibrary = async () => {
    setLoading(true);
    try {
      const res: any = await libraryService.getLibrary();
      const data = res?.data || res;
      setItems(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error(t('common.error'), error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchLibrary();
    fetchPrices();
  };

  useEffect(() => {
    fetchLibrary();
    fetchPrices();
  }, []);

  // Dynamic categories
  const dynamicCategories = [
    { id: "all", label: t('library.cat_all') },
    ...Array.from(new Set(items.map(i => i.category))).filter(Boolean).map(cat => ({
      id: cat,
      label: cat
    }))
  ];

  const filteredItems = selectedCategory === "all" 
    ? items 
    : items.filter(i => i.category === selectedCategory);

  const getYoutubeId = (url: string) => {
    if (!url) return null;
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const renderItem = (item: any, index: number) => {
    // Better video detection: check type OR existence of video_url
    const isVideo = item.type === 'video' || (item.video_url && item.video_url.length > 5);
    const ytId = isVideo && item.video_url ? getYoutubeId(item.video_url) : null;
    
    // Thumbnail logic: YouTube > Cloudinary Video > Image > Fallback
    let thumbUrl = item.image_url;
    
    if (ytId) {
      thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    } else if (isVideo && item.video_url && item.video_url.includes('cloudinary.com')) {
      // Smart Cloudinary Thumbnail: Change extension to .jpg and add start offset (so_0)
      thumbUrl = item.video_url.replace(/\.[^/.]+$/, ".jpg").replace("/upload/", "/upload/so_0/");
    } else if (!thumbUrl || thumbUrl.trim() === "") {
      thumbUrl = "https://images.unsplash.com/photo-1592724212522-88806a03c136?w=800";
    }

    return (
      <Animated.View 
        entering={FadeInDown.delay(index * 100)} 
        key={item.id} 
        style={st.card}
      >
        <TouchableOpacity 
          activeOpacity={0.9}
          onPress={() => setSelectedArticle(item)}
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
              <Text style={st.categoryText}>{item.category || t('library.default_category')}</Text>
            </View>
            {isVideo && (
              <View style={st.videoBadge}>
                <MaterialCommunityIcons name="video" size={14} color="#fff" />
                <Text style={st.videoBadgeText}>{t('library.video_badge')}</Text>
              </View>
            )}
          </View>
          <View style={st.cardBody}>
            <Text style={st.cardTitle} numberOfLines={2}>{item.title}</Text>
            <View style={st.cardFooter}>
              <View style={st.footerItem}>
                <MaterialCommunityIcons name="clock-outline" size={14} color="#6b7280" />
                <Text style={st.footerText}>{item.duration || t('library.default_duration')}</Text>
              </View>
              <View style={st.footerItem}>
                <MaterialCommunityIcons name="eye-outline" size={14} color="#6b7280" />
                <Text style={st.footerText}>{t('library.views_label')}</Text>
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
          {/* Price Update Widget */}
          <Animated.View entering={FadeInDown.duration(600)} style={st.priceWidget}>
            <View style={st.priceHeader}>
              <MaterialCommunityIcons name="trending-up" size={20} color="#154212" />
              <Text style={st.priceHeaderText}>{t('library.prices_title')}</Text>
              {pricesLoading && <ActivityIndicator size="small" color="#154212" />}
            </View>
            
            <View style={st.priceCard}>
              {/* Coffee Row */}
              <View style={st.priceRow}>
                <View style={st.priceInfo}>
                  <Text style={st.productName}>{prices?.coffee?.name || "Cà phê Robusta xô"}</Text>
                  <Text style={st.productSub}>{prices?.coffee?.location || "Đắk Lắk"} - {t('library.today')}</Text>
                </View>
                <View style={st.priceValueContainer}>
                  <Text style={[st.priceValue, { color: prices?.coffee?.trendType === 'up' ? '#dc2626' : '#154212' }]}>
                    {prices?.coffee?.price || "88.600 đ"}
                  </Text>
                  <View style={[st.trendBadge, { backgroundColor: prices?.coffee?.trendType === 'up' ? '#fee2e2' : '#dcfce7' }]}>
                    <MaterialCommunityIcons 
                      name={prices?.coffee?.trendType === 'up' ? "arrow-up" : "arrow-down"} 
                      size={12} 
                      color={prices?.coffee?.trendType === 'up' ? '#dc2626' : '#154212'} 
                    />
                    <Text style={[st.trendText, { color: prices?.coffee?.trendType === 'up' ? '#dc2626' : '#154212' }]}>
                      {prices?.coffee?.trend || "..."}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={st.priceDivider} />

              {/* Fertilizer Row */}
              <View style={st.priceRow}>
                <View style={st.priceInfo}>
                  <Text style={st.productName}>{prices?.fertilizers?.[0]?.name || "Phân DAP Hàn Quốc"}</Text>
                  <Text style={st.productSub}>{t('library.ref_price')}</Text>
                </View>
                <View style={st.priceValueContainer}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <Text style={[st.priceValue, { color: '#154212' }]}>
                      {prices?.fertilizers?.[0]?.price || "1.095.000 đ/bao"}
                    </Text>
                    <TouchableOpacity 
                      onPress={() => setIsFertExpanded(!isFertExpanded)}
                      style={st.expandBtn}
                    >
                      <MaterialCommunityIcons 
                        name={isFertExpanded ? "chevron-up" : "chevron-down"} 
                        size={24} 
                        color="#154212" 
                      />
                    </TouchableOpacity>
                  </View>
                  {!isFertExpanded && (
                    <View style={[st.trendBadge, { backgroundColor: '#f3f4f6' }]}>
                      <Text style={[st.trendText, { color: '#6b7280' }]}>
                        {prices?.fertilizers?.[0]?.trend || t('library.stable')}
                      </Text>
                    </View>
                  )}
                </View>
              </View>

              {/* Expanded Fertilizer List */}
              {isFertExpanded && prices?.fertilizers?.slice(1).map((fert: any, idx: number) => (
                <Animated.View 
                  entering={FadeInDown.delay(idx * 50)} 
                  key={idx} 
                  style={st.expandedRow}
                >
                  <View style={st.priceDividerSmall} />
                  <View style={st.priceRow}>
                    <View style={st.priceInfo}>
                      <Text style={st.productNameSmall}>{fert.name}</Text>
                    </View>
                    <View style={st.priceValueContainer}>
                      <Text style={st.priceValueSmall}>{fert.price}</Text>
                    </View>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>

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

      {/* Integrated Article & Video Detail Modal */}
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
              
              {/* Media Section (Video or Image) */}
              <View style={st.detailMediaContainer}>
                {selectedArticle?.video_url ? (
                  // If it has a video, show the player
                  <View style={{ height: 220, backgroundColor: '#000' }}>
                    {getYoutubeId(selectedArticle.video_url) ? (
                      <WebView
                        style={{ flex: 1 }}
                        javaScriptEnabled={true}
                        domStorageEnabled={true}
                        allowsFullscreenVideo={true}
                        mediaPlaybackRequiresUserAction={false}
                        source={{ 
                          uri: `https://www.youtube.com/embed/${getYoutubeId(selectedArticle.video_url)}?autoplay=0&modestbranding=1` 
                        }}
                      />
                    ) : (
                      <Video
                        source={{ uri: selectedArticle.video_url }}
                        rate={1.0}
                        volume={1.0}
                        isMuted={false}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay={false}
                        useNativeControls
                        style={{ flex: 1 }}
                      />
                    )}
                  </View>
                ) : (
                  // If no video, show the image
                  selectedArticle?.image_url ? (
                    <Image source={{ uri: selectedArticle.image_url }} style={st.articleImg} />
                  ) : (
                    <View style={[st.articleImg, { backgroundColor: '#f3f4f6', justifyContent: 'center', alignItems: 'center' }]}>
                      <MaterialCommunityIcons name="image-off" size={48} color="#9ca3af" />
                    </View>
                  )
                )}
              </View>

              <View style={st.articleBody}>
                <View style={[st.catBadgeSmall, { backgroundColor: selectedArticle?.category_color || "#154212" }]}>
                  <Text style={st.catTextSmall}>{selectedArticle?.category}</Text>
                </View>
                <Text style={st.articleTitle}>{selectedArticle?.title}</Text>
                <View style={st.divider} />
                <Text style={st.articleDesc}>{selectedArticle?.description || t('library.content_updating')}</Text>
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
  playOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', backgroundColor: 'rgba(0,0,0,0.1)' },
  detailMediaContainer: { width: '100%', height: 220, overflow: 'hidden' },
  articleModalRoot: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  articleModalContent: { backgroundColor: '#fff', borderTopLeftRadius: 32, borderTopRightRadius: 32, height: '90%', overflow: 'hidden' },
  articleHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  articleHeaderTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#154212' },
  articleCloseBtn: { padding: 4 },
  articleScroll: { paddingBottom: 40 },
  articleImg: { width: '100%', height: 220 },
  articleBody: { padding: 24 },
  articleTitle: { fontSize: 24, fontFamily: 'Nunito_800ExtraBold', color: '#111827', marginTop: 12 },
  articleDesc: { fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: '#4b5563', lineHeight: 26, marginTop: 16 },
  catBadgeSmall: { alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12 },
  catTextSmall: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold', color: '#fff' },
  divider: { height: 1, backgroundColor: '#f3f4f6', marginVertical: 20 },

  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: 60 },
  loadingText: { marginTop: 12, fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: '#9ca3af' },
  listContent: { paddingHorizontal: 20, paddingTop: 20 },
  
  priceWidget: { marginBottom: 24 },
  priceHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12, gap: 8 },
  priceHeaderText: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#1f2937' },
  priceCard: { backgroundColor: '#f3f4f6', borderRadius: 24, padding: 20 },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  priceInfo: { flex: 1 },
  productName: { fontSize: 16, fontFamily: 'Nunito_700Bold', color: '#1f2937' },
  productSub: { fontSize: 13, fontFamily: 'Nunito_600SemiBold', color: '#6b7280', marginTop: 2 },
  priceValueContainer: { alignItems: 'flex-end' },
  priceValue: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold' },
  trendBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, marginTop: 4, gap: 2 },
  trendText: { fontSize: 12, fontFamily: 'Nunito_800ExtraBold' },
  priceDivider: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 15, borderStyle: 'dashed' },
  expandBtn: { padding: 4, backgroundColor: '#fff', borderRadius: 12, ...SHADOW },
  expandedRow: { marginTop: 0 },
  priceDividerSmall: { height: 1, backgroundColor: '#e5e7eb', marginVertical: 10, opacity: 0.5 },
  productNameSmall: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: '#4b5563' },
  priceValueSmall: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#154212' },
});
