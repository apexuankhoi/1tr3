import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, RefreshControl, StatusBar 
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { adminService } from "../services/api";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await adminService.getStats();
      setStats(data);
    } catch (error) {
      console.error("Lỗi lấy stats:", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading && !refreshing) {
    return (
      <View style={[st.root, { justifyContent: 'center', alignItems: 'center' }]}>
        <ActivityIndicator size="large" color="#154212" />
      </View>
    );
  }

  const StatCard = ({ title, value, icon, color, delay }: any) => (
    <Animated.View entering={FadeInDown.delay(delay).duration(600)} style={st.statCard}>
      <View style={[st.statIcon, { backgroundColor: color + '15' }]}>
        <MaterialCommunityIcons name={icon} size={28} color={color} />
      </View>
      <View>
        <Text style={st.statValue}>{value}</Text>
        <Text style={st.statTitle}>{title}</Text>
      </View>
    </Animated.View>
  );

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" />
      <ScrollView 
        contentContainerStyle={[st.content, { paddingTop: insets.top + 20 }]}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={st.header}>
          <Text style={st.headerTitle}>Hệ Thống Quản Trị</Text>
          <Text style={st.headerSub}>Tổng quan hoạt động ứng dụng</Text>
        </View>

        <View style={st.statsGrid}>
          <StatCard title="Người dùng" value={stats?.userCount || 0} icon="account-group" color="#3b82f6" delay={0} />
          <StatCard title="Nhiệm vụ" value={stats?.taskCount || 0} icon="clipboard-list" color="#10b981" delay={100} />
          <StatCard title="Chờ duyệt" value={stats?.pendingSubmissions || 0} icon="clock-outline" color="#f59e0b" delay={200} />
          <StatCard title="Sản phẩm" value={stats?.itemCount || 0} icon="storefront" color="#8b5cf6" delay={300} />
        </View>

        <Text style={st.sectionTitle}>Quản Lý Nội Dung</Text>
        
        <TouchableOpacity 
          style={st.menuItem} 
          onPress={() => navigation.navigate("AdminTasks" as any)}
        >
          <LinearGradient colors={['#154212', '#2d5a27']} style={st.menuIcon}>
            <MaterialCommunityIcons name="format-list-checks" size={24} color="#fff" />
          </LinearGradient>
          <View style={st.menuText}>
            <Text style={st.menuTitle}>Nhiệm vụ & Quiz</Text>
            <Text style={st.menuSub}>Chỉnh sửa nội dung và câu hỏi</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={st.menuItem} 
          onPress={() => navigation.navigate("AdminLibrary" as any)}
        >
          <LinearGradient colors={['#d97706', '#b45309']} style={st.menuIcon}>
            <MaterialCommunityIcons name="library-shelves" size={24} color="#fff" />
          </LinearGradient>
          <View style={st.menuText}>
            <Text style={st.menuTitle}>Thư viện kiến thức</Text>
            <Text style={st.menuSub}>Quản lý bài viết và video</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={st.menuItem} 
          onPress={() => navigation.navigate("ModDashboard" as any)}
        >
          <LinearGradient colors={['#2563eb', '#1d4ed8']} style={st.menuIcon}>
            <MaterialCommunityIcons name="check-decagram" size={24} color="#fff" />
          </LinearGradient>
          <View style={st.menuText}>
            <Text style={st.menuTitle}>Duyệt bài báo cáo</Text>
            <Text style={st.menuSub}>Xác nhận minh chứng từ người dùng</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={st.menuItem} 
          onPress={() => navigation.navigate("AdminShop" as any)}
        >
          <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={st.menuIcon}>
            <MaterialCommunityIcons name="storefront" size={24} color="#fff" />
          </LinearGradient>
          <View style={st.menuText}>
            <Text style={st.menuTitle}>Cửa hàng & Kho hàng</Text>
            <Text style={st.menuSub}>Quản lý sản phẩm và tồn kho</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  content: { paddingBottom: 100 },
  header: { paddingHorizontal: 24, marginBottom: 24 },
  headerTitle: { fontSize: 28, fontFamily: "Nunito_800ExtraBold", color: "#0f172a" },
  headerSub: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#64748b", marginTop: 4 },
  
  statsGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, marginBottom: 32 },
  statCard: { 
    width: '45%', backgroundColor: '#fff', margin: '2.5%', padding: 20, 
    borderRadius: 24, elevation: 4, shadowColor: '#000', shadowOpacity: 0.05, 
    shadowRadius: 10, shadowOffset: { width: 0, height: 4 } 
  },
  statIcon: { width: 48, height: 48, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginBottom: 12 },
  statValue: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#0f172a" },
  statTitle: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#64748b", marginTop: 2 },

  sectionTitle: { fontSize: 18, fontFamily: "Nunito_800ExtraBold", color: "#0f172a", marginHorizontal: 24, marginBottom: 16 },
  menuItem: { 
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', 
    marginHorizontal: 24, marginBottom: 16, padding: 16, borderRadius: 24,
    elevation: 2, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 8, shadowOffset: { width: 0, height: 2 }
  },
  menuIcon: { width: 50, height: 50, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  menuText: { flex: 1, marginLeft: 16 },
  menuTitle: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#0f172a" },
  menuSub: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#64748b", marginTop: 2 },
});
