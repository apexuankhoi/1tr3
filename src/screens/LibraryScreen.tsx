import React from "react";
import { View, Text, ScrollView, Dimensions, TouchableOpacity, StatusBar, StyleSheet, Platform, ActivityIndicator } from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useGameStore } from "../store/useGameStore";
import AudioStoryCard from "../components/AudioStoryCard";
import VideoGuideCard from "../components/VideoGuideCard";

const { width } = Dimensions.get("window");

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 5 },
});

const STORIES = [
  { id: "1", title: "Bí quyết giữ độ ẩm đất mùa khô hạn", author: "Bác Năm", duration: "15 Phút", imageUri: "https://images.unsplash.com/photo-1592424005510-449e7bd66050?w=400" },
  { id: "2", title: "Lịch thời vụ: Nhìn trời đoán nắng mưa", author: "Chú Hai", duration: "22 Phút", imageUri: "https://images.unsplash.com/photo-1599307734111-d138f6d66934?w=400" },
  { id: "3", title: "Cách chọn hạt giống thuần chủng", author: "Cô Ba", duration: "18 Phút", imageUri: "https://images.unsplash.com/photo-1628352081506-83c43123ed6d?w=400" },
];

const VIDEOS = [
  { id: "1", title: "Ủ phân hữu cơ từ rác thải nhà bếp", category: "Cơ bản", duration: "08:45", description: "Hướng dẫn chi tiết từng bước cách tận dụng rác thải sinh hoạt để tạo nguồn phân bón sạch và giàu dinh dưỡng.", imageUri: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800", categoryColor: "#154212" },
  { id: "2", title: "Kỹ thuật nuôi trùn quế lấy phân", category: "Nâng cao", duration: "12:20", description: "Tìm hiểu mô hình nuôi trùn quế hiệu quả, cung cấp lượng phân vi sinh cao cấp cho vườn cây ăn trái.", imageUri: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=800", categoryColor: "#1f4022" },
  { id: "3", title: "Tỉ lệ Vàng: Xanh và Nâu trong ủ phân", category: "Mẹo vặt", duration: "05:15", description: "Công thức cân bằng carbon và nitrogen giúp đống ủ phân hủy nhanh chóng, không gây mùi hôi.", imageUri: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=800", categoryColor: "#b45309" },
];

export default function LibraryScreen() {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { seeds, coins, userRole } = useGameStore();

  const [videos, setVideos] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const data = await libraryService.getLibrary();
      setVideos(data);
    } catch (err) {
      console.error("Lỗi tải thư viện:", err);
    } finally {
      setLoading(false);
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
          {userRole === 'admin' && (
            <TouchableOpacity 
              onPress={() => navigation.navigate("AdminLibrary" as any)} 
              style={[st.badge, { backgroundColor: "#154212" }]}
            >
              <MaterialCommunityIcons name="plus" size={16} color="#fff" />
              <Text style={[st.badgeText, { color: "#fff" }]}>Thêm</Text>
            </TouchableOpacity>
          )}
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
        
        {/* Section 1: Audio Stories (Keep as dummy for now or fetch later) */}
        <View style={st.sectionHeader}>
          <Text style={st.sectionTitle}>Chuyện Kể Nhà Nông</Text>
          <Text style={st.seeAll}>Xem tất cả</Text>
        </View>
        
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={st.horizList}
          contentContainerStyle={{ paddingHorizontal: 24 }}
          snapToInterval={width * 0.75 + 24}
          decelerationRate="fast"
        >
          {STORIES.map(item => (
            <AudioStoryCard key={item.id} {...item} />
          ))}
        </ScrollView>

        {/* Section 2: Video Guides */}
        <View style={[st.sectionHeader, { marginTop: 40, paddingHorizontal: 24 }]}>
          <Text style={st.sectionTitle}>Hướng Dẫn Nông Nghiệp</Text>
        </View>
        
        <View style={{ paddingHorizontal: 24 }}>
          {loading ? (
            <ActivityIndicator size="large" color="#154212" style={{ marginTop: 20 }} />
          ) : videos.length === 0 ? (
            <Text style={{ textAlign: 'center', color: '#9ca3af', marginTop: 20 }}>Chưa có nội dung nào.</Text>
          ) : (
            videos.map(item => (
              <VideoGuideCard 
                key={item.id} 
                title={item.title}
                category={item.category}
                duration={item.duration}
                description={item.description}
                imageUri={item.image_url}
                categoryColor={item.category_color}
              />
            ))
          )}
        </View>

        <View style={{ height: 60 }} />
      </ScrollView>
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
  
  content: { paddingTop: 20 },
  
  sectionHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 20, paddingHorizontal: 24 },
  sectionTitle: { fontSize: 22, fontFamily: "Nunito_800ExtraBold", color: "#111827" },
  seeAll: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#154212" },

  horizList: { marginHorizontal: -24 },
});
