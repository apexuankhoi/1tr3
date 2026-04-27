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
import { useGameStore } from "../store/useGameStore";

export default function AdminDashboard() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useGameStore();
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
          <Text style={st.headerTitle}>{t('profile.admin')}</Text>
          <Text style={st.headerSub}>{t('admin_dash.stats')}</Text>
        </View>

        <View style={st.statsGrid}>
          <StatCard title={t('admin_users.title')} value={stats?.userCount || 0} icon="account-group" color="#3b82f6" delay={0} />
          <StatCard title={t('tabs.tasks')} value={stats?.taskCount || 0} icon="clipboard-list" color="#10b981" delay={100} />
          <StatCard title={t('tasks.status_pending')} value={stats?.pendingSubmissions || 0} icon="clock-outline" color="#f59e0b" delay={200} />
          <StatCard title={t('shop.title')} value={stats?.itemCount || 0} icon="storefront" color="#8b5cf6" delay={300} />
        </View>

        <Text style={st.sectionTitle}>{t('profile.mgmt')}</Text>
        
        <TouchableOpacity 
          style={st.menuItem} 
          onPress={() => navigation.navigate("AdminTasks" as never)}
        >
          <LinearGradient colors={['#154212', '#2d5a27']} style={st.menuIcon}>
            <MaterialCommunityIcons name="format-list-checks" size={24} color="#fff" />
          </LinearGradient>
          <View style={st.menuText}>
            <Text style={st.menuTitle}>{t('tabs.tasks')}</Text>
            <Text style={st.menuSub}>{t('common.edit')}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={st.menuItem} 
          onPress={() => navigation.navigate("AdminLibrary" as never)}
        >
          <LinearGradient colors={['#d97706', '#b45309']} style={st.menuIcon}>
            <MaterialCommunityIcons name="library-shelves" size={24} color="#fff" />
          </LinearGradient>
          <View style={st.menuText}>
            <Text style={st.menuTitle}>{t('library.title')}</Text>
            <Text style={st.menuSub}>{t('library.mgmt')}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={st.menuItem} 
          onPress={() => navigation.navigate("ModDashboard" as never)}
        >
          <LinearGradient colors={['#2563eb', '#1d4ed8']} style={st.menuIcon}>
            <MaterialCommunityIcons name="check-decagram" size={24} color="#fff" />
          </LinearGradient>
          <View style={st.menuText}>
            <Text style={st.menuTitle}>{t('profile.verify')}</Text>
            <Text style={st.menuSub}>{t('admin_dash.pending_tasks')}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={st.menuItem} 
          onPress={() => navigation.navigate("AdminShop" as never)}
        >
          <LinearGradient colors={['#8b5cf6', '#6d28d9']} style={st.menuIcon}>
            <MaterialCommunityIcons name="storefront" size={24} color="#fff" />
          </LinearGradient>
          <View style={st.menuText}>
            <Text style={st.menuTitle}>{t('admin_dash.manage_shop')}</Text>
            <Text style={st.menuSub}>{t('admin_shop.stock_mgmt')}</Text>
          </View>
          <MaterialCommunityIcons name="chevron-right" size={24} color="#d1d5db" />
        </TouchableOpacity>

        <TouchableOpacity 
          style={st.menuItem} 
          onPress={() => navigation.navigate("AdminUsers" as never)}
        >
          <LinearGradient colors={['#374151', '#111827']} style={st.menuIcon}>
            <MaterialCommunityIcons name="account-cog" size={24} color="#fff" />
          </LinearGradient>
          <View style={st.menuText}>
            <Text style={st.menuTitle}>{t('admin_users.title')}</Text>
            <Text style={st.menuSub}>{t('admin_users.desc')}</Text>
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
