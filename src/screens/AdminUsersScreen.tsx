import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, TextInput, FlatList, Image,
  Dimensions, RefreshControl
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import api from "../services/api";
import { useGameStore } from "../store/useGameStore";

const { width } = Dimensions.get("window");

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useGameStore();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [passwordModalVisible, setPasswordModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [newPassword, setNewPassword] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data = await api.get("admin/users");
      setUsers(data);
    } catch (err) {
      console.error("Lỗi tải người dùng:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleToggleLock = (user: any) => {
    const action = user.is_locked ? t('admin_users.unlock') : t('admin_users.lock');
    Alert.alert(t('common.confirm'), `${action} ${user.username}?`, [
      { text: t('common.cancel') },
      { text: t('common.confirm'), onPress: async () => {
          try {
            await api.patch(`admin/users/${user.id}/status`, { is_locked: !user.is_locked });
            fetchUsers();
          } catch (err) {
            Alert.alert(t('common.error'), t('common.error'));
          }
      }}
    ]);
  };

  const handleDeleteUser = (user: any) => {
    Alert.alert(t('admin_users.delete'), `${t('admin_users.confirm_delete')} (${user.username})`, [
      { text: t('common.cancel') },
      { text: t('common.delete'), style: "destructive", onPress: async () => {
          try {
            await api.delete(`admin/users/${user.id}`);
            fetchUsers();
          } catch (err) {
            Alert.alert(t('common.error'), t('common.error'));
          }
      }}
    ]);
  };

  const handleResetPassword = async () => {
    if (!newPassword) return Alert.alert(t('common.error'), t('auth.password'));
    try {
      await api.patch(`admin/users/${selectedUser.id}/password`, { newPassword });
      setPasswordModalVisible(false);
      setNewPassword("");
      Alert.alert(t('common.success'), t('admin_users.success_update'));
    } catch (err) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleUpdateRole = (user: any) => {
    Alert.alert(t('admin_users.change_role'), `${user.username}`, [
      { text: "Farmer", onPress: () => updateRole(user.id, 'farmer') },
      { text: "Moderator", onPress: () => updateRole(user.id, 'moderator') },
      { text: "Admin", onPress: () => updateRole(user.id, 'admin') },
      { text: t('common.cancel'), style: "cancel" }
    ]);
  };

  const updateRole = async (userId: number, role: string) => {
    try {
      await api.patch(`admin/users/${userId}/role`, { role });
      Alert.alert(t('common.success'), t('admin_users.success_update'));
      fetchUsers();
    } catch (err) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const filteredUsers = users.filter(u => {
    const nameStr = (u.full_name || "").toLowerCase();
    const userStr = (u.username || "").toLowerCase();
    const query = searchQuery.toLowerCase();
    const matchSearch = nameStr.includes(query) || userStr.includes(query);
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  const renderUserItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInDown.delay(index * 50).duration(400)} style={st.userCard}>
      <View style={st.cardTop}>
        <View style={st.userInfo}>
          <View style={st.avatarWrap}>
            {item.avatar_url ? (
              <Image source={{ uri: item.avatar_url }} style={st.avatar} />
            ) : (
              <LinearGradient colors={['#e2e8f0', '#cbd5e1']} style={st.avatarPlaceholder}>
                <MaterialCommunityIcons name="account" size={24} color="#64748b" />
              </LinearGradient>
            )}
            {item.is_locked && (
              <View style={st.lockOverlay}>
                <MaterialCommunityIcons name="lock" size={12} color="#fff" />
              </View>
            )}
          </View>
          <View style={st.userMeta}>
            <Text style={st.userName}>{item.full_name || item.username}</Text>
            <View style={st.roleBadgeWrap}>
              <View style={[st.roleBadge, { backgroundColor: getRoleColor(item.role).bg }]}>
                <Text style={[st.roleText, { color: getRoleColor(item.role).text }]}>{item.role.toUpperCase()}</Text>
              </View>
              <Text style={st.userPhone}>{item.username}</Text>
            </View>
          </View>
        </View>
        <View style={st.coinWrap}>
          <MaterialCommunityIcons name="star-four-points" size={14} color="#f59e0b" />
          <Text style={st.coinText}>{item.coins || 0}</Text>
        </View>
      </View>

      <View style={st.cardDivider} />

      <View style={st.cardActions}>
        <TouchableOpacity style={st.actionBtn} onPress={() => handleUpdateRole(item)}>
          <MaterialCommunityIcons name="shield-edit-outline" size={20} color="#6366f1" />
          <Text style={[st.actionLabel, { color: "#6366f1" }]}>{t('admin_users.change_role')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={st.actionBtn} onPress={() => { setSelectedUser(item); setPasswordModalVisible(true); }}>
          <MaterialCommunityIcons name="key-outline" size={20} color="#059669" />
          <Text style={[st.actionLabel, { color: "#059669" }]}>{t('admin_users.reset_pass')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={st.actionBtn} onPress={() => handleToggleLock(item)}>
          <MaterialCommunityIcons name={item.is_locked ? "lock-open-outline" : "lock-outline"} size={20} color="#f59e0b" />
          <Text style={[st.actionLabel, { color: "#f59e0b" }]}>{item.is_locked ? t('admin_users.unlock') : t('admin_users.lock')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={st.actionBtn} onPress={() => handleDeleteUser(item)}>
          <MaterialCommunityIcons name="trash-can-outline" size={20} color="#ef4444" />
          <Text style={[st.actionLabel, { color: "#ef4444" }]}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </Animated.View>
  );

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return { bg: '#fee2e2', text: '#991b1b' };
      case 'moderator': return { bg: '#e0e7ff', text: '#3730a3' };
      default: return { bg: '#f1f5f9', text: '#475569' };
    }
  };

  return (
    <View style={st.root}>
      {/* Header */}
      <LinearGradient colors={['#154212', '#2a5c24']} style={[st.header, { paddingTop: insets.top + 10 }]}>
        <View style={st.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={st.headerTitle}>{t('admin_users.title')}</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={st.searchBarWrap}>
          <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
          <TextInput 
            style={st.searchInput}
            placeholder={t('admin_users.search')}
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery("")}>
              <MaterialCommunityIcons name="close-circle" size={18} color="#94a3b8" />
            </TouchableOpacity>
          )}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.filterScroll} contentContainerStyle={{ paddingRight: 20 }}>
          {['all', 'farmer', 'moderator', 'admin'].map((role) => (
            <TouchableOpacity 
              key={role} 
              onPress={() => setFilterRole(role)}
              style={[st.filterBtn, filterRole === role && st.filterBtnActive]}
            >
              <Text style={[st.filterText, filterRole === role && st.filterTextActive]}>
                {role === 'all' ? t('admin_users.filter_all') : role.charAt(0).toUpperCase() + role.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </LinearGradient>

      {loading ? (
        <View style={st.center}>
          <ActivityIndicator size="large" color="#154212" />
        </View>
      ) : (
        <FlatList 
          data={filteredUsers}
          keyExtractor={u => u.id.toString()}
          renderItem={renderUserItem}
          contentContainerStyle={[st.list, { paddingBottom: insets.bottom + 20 }]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchUsers(); }} tintColor="#154212" />}
          ListEmptyComponent={
            <View style={st.empty}>
              <MaterialCommunityIcons name="account-search-outline" size={64} color="#cbd5e1" />
              <Text style={st.emptyText}>Không tìm thấy người dùng nào</Text>
            </View>
          }
        />
      )}

      {/* Password Modal */}
      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <Animated.View entering={FadeInUp} style={st.modalContent}>
            <Text style={st.modalTitle}>{t('admin_users.reset_pass')}</Text>
            <Text style={st.modalSub}>Nhập mật khẩu mới cho {selectedUser?.username}</Text>
            
            <TextInput 
              style={st.modalInput}
              secureTextEntry
              placeholder={t('auth.password')}
              value={newPassword}
              onChangeText={setNewPassword}
              autoFocus
            />

            <View style={st.modalButtons}>
              <TouchableOpacity style={st.modalCancel} onPress={() => setPasswordModalVisible(false)}>
                <Text style={st.cancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={st.modalConfirm} onPress={handleResetPassword}>
                <Text style={st.confirmText}>{t('common.confirm')}</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </View>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: { paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 30, borderBottomRightRadius: 30 },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  headerTitle: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  
  searchBarWrap: { backgroundColor: "#fff", height: 50, borderRadius: 25, flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginBottom: 15 },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: "Nunito_600SemiBold", fontSize: 15, color: "#1e293b" },
  
  filterScroll: { marginBottom: 5 },
  filterBtn: { paddingHorizontal: 18, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", marginRight: 10 },
  filterBtnActive: { backgroundColor: "#fff" },
  filterText: { color: "rgba(255,255,255,0.8)", fontFamily: "Nunito_700Bold", fontSize: 13 },
  filterTextActive: { color: "#154212" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 20 },
  
  userCard: { backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 16, elevation: 3, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 } },
  cardTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" },
  userInfo: { flexDirection: "row", alignItems: "center", flex: 1 },
  avatarWrap: { width: 48, height: 48, borderRadius: 24, overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  lockOverlay: { position: "absolute", bottom: 0, right: 0, width: 18, height: 18, borderRadius: 9, backgroundColor: "#ef4444", borderOuterWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  
  userMeta: { marginLeft: 12, flex: 1 },
  userName: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  roleBadgeWrap: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, marginRight: 8 },
  roleText: { fontSize: 10, fontFamily: "Nunito_800ExtraBold" },
  userPhone: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#64748b" },
  
  coinWrap: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff9eb", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  coinText: { marginLeft: 4, fontSize: 13, fontFamily: "Nunito_700Bold", color: "#b45309" },
  
  cardDivider: { height: 1, backgroundColor: "#f1f5f9", marginVertical: 12 },
  cardActions: { flexDirection: "row", justifyContent: "space-between" },
  actionBtn: { alignItems: "center", flex: 1 },
  actionLabel: { fontSize: 9, fontFamily: "Nunito_700Bold", marginTop: 4 },

  empty: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, fontFamily: "Nunito_600SemiBold", color: "#94a3b8" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 30 },
  modalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#1e293b", textAlign: "center" },
  modalSub: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#64748b", textAlign: "center", marginTop: 8, marginBottom: 20 },
  modalInput: { backgroundColor: "#f1f5f9", height: 50, borderRadius: 12, paddingHorizontal: 16, fontSize: 16, fontFamily: "Nunito_600SemiBold", color: "#1e293b", marginBottom: 20 },
  modalButtons: { flexDirection: "row", gap: 12 },
  modalCancel: { flex: 1, height: 50, borderRadius: 25, alignItems: "center", justifyContent: "center", borderOuterWidth: 1, borderColor: "#e2e8f0" },
  modalConfirm: { flex: 1, height: 50, borderRadius: 25, backgroundColor: "#154212", alignItems: "center", justifyContent: "center" },
  cancelText: { fontSize: 16, fontFamily: "Nunito_700Bold", color: "#64748b" },
  confirmText: { fontSize: 16, fontFamily: "Nunito_700Bold", color: "#fff" },
});
