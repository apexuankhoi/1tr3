import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, TextInput, FlatList, Image,
  Dimensions, RefreshControl, KeyboardAvoidingView, Platform, StatusBar
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";
import { adminService } from "../services/api";
import { useGameStore } from "../store/useGameStore";

const { width, height } = Dimensions.get("window");

const SHADOW = {
  shadowColor: "#000",
  shadowOpacity: 0.1,
  shadowRadius: 10,
  shadowOffset: { width: 0, height: 4 },
  elevation: 5,
};

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t } = useGameStore();
  
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  
  // Editor Modal State
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userInventory, setUserInventory] = useState<any[]>([]);
  const [invLoading, setInvLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [filterRole, setFilterRole] = useState("all");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const data: any = await adminService.getUsers();
      setUsers(data || []);
    } catch (err) {
      console.error("Lỗi tải người dùng:", err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const openUserEditor = async (user: any) => {
    setSelectedUser({ ...user });
    setEditModalVisible(true);
    setInvLoading(true);
    try {
      const inv: any = await adminService.getUserInventory(user.id);
      setUserInventory(inv || []);
    } catch (err) {
      console.error("Lỗi tải kho đồ:", err);
    } finally {
      setInvLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await adminService.updateUser(selectedUser.id, {
        fullName: selectedUser.full_name,
        email: selectedUser.email,
        role: selectedUser.role,
        coins: Number(selectedUser.coins),
        seeds: Number(selectedUser.seeds),
        level: Number(selectedUser.level),
        exp: Number(selectedUser.exp),
        is_locked: selectedUser.is_locked ? 1 : 0
      });
      Alert.alert("Thành công", "Đã cập nhật dữ liệu người dùng");
      setEditModalVisible(false);
      fetchUsers();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể cập nhật người dùng");
    }
  };

  const handleDeleteInventoryItem = async (inventoryId: number) => {
    Alert.alert("Xác nhận", "Xóa vật phẩm này khỏi kho đồ người dùng?", [
      { text: "Hủy", style: "cancel" },
      { 
        text: "Xóa", 
        style: "destructive", 
        onPress: async () => {
          try {
            await adminService.deleteInventoryItem(inventoryId);
            setUserInventory(prev => prev.filter(i => i.inventory_id !== inventoryId));
          } catch (err) {
            Alert.alert("Lỗi", "Không thể xóa vật phẩm");
          }
        }
      }
    ]);
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
      <TouchableOpacity style={st.cardInner} onPress={() => openUserEditor(item)}>
        <View style={st.avatarWrap}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={st.avatar} />
          ) : (
            <LinearGradient colors={['#e2e8f0', '#cbd5e1']} style={st.avatarPlaceholder}>
              <MaterialCommunityIcons name="account" size={30} color="#64748b" />
            </LinearGradient>
          )}
          {item.is_locked === 1 && (
            <View style={st.lockBadge}>
              <MaterialCommunityIcons name="lock" size={12} color="#fff" />
            </View>
          )}
        </View>
        
        <View style={st.userMeta}>
          <Text style={st.userName}>{item.full_name || item.username}</Text>
          <Text style={st.userPhone}>{item.username} • {item.role.toUpperCase()}</Text>
          
          <View style={st.miniStatsRow}>
            <View style={st.miniStatPill}>
              <MaterialCommunityIcons name="star-four-points" size={12} color="#f59e0b" />
              <Text style={st.miniStatText}>{item.coins}</Text>
            </View>
            <View style={st.miniStatPill}>
              <MaterialCommunityIcons name="trending-up" size={12} color="#3b82f6" />
              <Text style={st.miniStatText}>Lv.{item.level}</Text>
            </View>
          </View>
        </View>

        <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" />
      
      {/* Header */}
      <LinearGradient colors={['#154212', '#2a5c24']} style={[st.header, { paddingTop: insets.top + 10 }]}>
        <View style={st.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
            <MaterialCommunityIcons name="chevron-left" size={28} color="#fff" />
          </TouchableOpacity>
          <Text style={st.headerTitle}>Quản lý người dùng</Text>
          <View style={{ width: 40 }} />
        </View>

        <View style={st.searchBox}>
          <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
          <TextInput 
            style={st.searchInput}
            placeholder="Tìm theo tên hoặc SĐT..."
            placeholderTextColor="#94a3b8"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={st.filterRow}>
          {['all', 'farmer', 'moderator', 'admin'].map((role) => (
            <TouchableOpacity 
              key={role} 
              onPress={() => setFilterRole(role)}
              style={[st.filterPill, filterRole === role && st.filterPillActive]}
            >
              <Text style={[st.filterText, filterRole === role && st.filterTextActive]}>
                {role === 'all' ? "Tất cả" : role.charAt(0).toUpperCase() + role.slice(1)}
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
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchUsers} tintColor="#154212" />}
          ListEmptyComponent={
            <View style={st.empty}>
              <MaterialCommunityIcons name="account-off-outline" size={64} color="#cbd5e1" />
              <Text style={st.emptyText}>Không tìm thấy kết quả</Text>
            </View>
          }
        />
      )}

      {/* Admin Master Editor Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={{ flex: 1 }}>
          <View style={st.modalOverlay}>
            <View style={st.modalContent}>
              <View style={st.modalHeader}>
                <View>
                  <Text style={st.modalTitle}>Bảng điều khiển Admin</Text>
                  <Text style={st.modalSubtitle}>ID: {selectedUser?.id} • {selectedUser?.username}</Text>
                </View>
                <TouchableOpacity onPress={() => setEditModalVisible(false)} style={st.closeBtn}>
                  <MaterialCommunityIcons name="close" size={24} color="#64748b" />
                </TouchableOpacity>
              </View>

              {selectedUser && (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
                  <View style={st.section}>
                    <Text style={st.sectionTitle}>Chỉ số tài khoản</Text>
                    
                    <View style={st.inputGrid}>
                      <View style={st.inputCol}>
                        <Text style={st.fieldLabel}>Xu (Coins)</Text>
                        <TextInput 
                          style={st.masterInput}
                          keyboardType="numeric"
                          value={selectedUser.coins.toString()}
                          onChangeText={(v) => setSelectedUser({ ...selectedUser, coins: v })}
                        />
                      </View>
                      <View style={st.inputCol}>
                        <Text style={st.fieldLabel}>Hạt giống</Text>
                        <TextInput 
                          style={st.masterInput}
                          keyboardType="numeric"
                          value={selectedUser.seeds.toString()}
                          onChangeText={(v) => setSelectedUser({ ...selectedUser, seeds: v })}
                        />
                      </View>
                    </View>

                    <View style={st.inputGrid}>
                      <View style={st.inputCol}>
                        <Text style={st.fieldLabel}>Level</Text>
                        <TextInput 
                          style={st.masterInput}
                          keyboardType="numeric"
                          value={selectedUser.level.toString()}
                          onChangeText={(v) => setSelectedUser({ ...selectedUser, level: v })}
                        />
                      </View>
                      <View style={st.inputCol}>
                        <Text style={st.fieldLabel}>EXP</Text>
                        <TextInput 
                          style={st.masterInput}
                          keyboardType="numeric"
                          value={selectedUser.exp.toString()}
                          onChangeText={(v) => setSelectedUser({ ...selectedUser, exp: v })}
                        />
                      </View>
                    </View>
                  </View>

                  <View style={st.section}>
                    <Text style={st.sectionTitle}>Vai trò & Trạng thái</Text>
                    <View style={st.roleList}>
                      {['farmer', 'moderator', 'admin'].map(r => (
                        <TouchableOpacity 
                          key={r}
                          style={[st.roleOption, selectedUser.role === r && st.roleOptionActive]}
                          onPress={() => setSelectedUser({ ...selectedUser, role: r })}
                        >
                          <Text style={[st.roleOptionText, selectedUser.role === r && st.roleOptionTextActive]}>
                            {r.toUpperCase()}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>

                    <TouchableOpacity 
                      style={[st.banBtn, selectedUser.is_locked && st.banBtnActive]}
                      onPress={() => setSelectedUser({ ...selectedUser, is_locked: !selectedUser.is_locked })}
                    >
                      <MaterialCommunityIcons 
                        name={selectedUser.is_locked ? "lock-open-outline" : "lock-outline"} 
                        size={20} 
                        color={selectedUser.is_locked ? "#16a34a" : "#ef4444"} 
                      />
                      <Text style={[st.banBtnText, { color: selectedUser.is_locked ? "#16a34a" : "#ef4444" }]}>
                        {selectedUser.is_locked ? "MỞ KHÓA TÀI KHOẢN" : "KHÓA TÀI KHOẢN NÀY"}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={st.section}>
                    <Text style={st.sectionTitle}>Quản lý kho đồ (Inventory)</Text>
                    {invLoading ? (
                      <ActivityIndicator size="small" color="#154212" />
                    ) : userInventory.length === 0 ? (
                      <View style={st.emptyInv}>
                        <Text style={st.emptyInvText}>Người dùng này chưa có vật phẩm nào</Text>
                      </View>
                    ) : (
                      userInventory.map((item) => (
                        <View key={item.inventory_id} style={st.invItem}>
                          <Image source={{ uri: item.image_url }} style={st.invImg} />
                          <View style={st.invMeta}>
                            <Text style={st.invName}>{item.name}</Text>
                            <Text style={st.invType}>{item.item_type}</Text>
                          </View>
                          <TouchableOpacity 
                            onPress={() => handleDeleteInventoryItem(item.inventory_id)}
                            style={st.invDel}
                          >
                            <MaterialCommunityIcons name="trash-can" size={22} color="#ef4444" />
                          </TouchableOpacity>
                        </View>
                      ))
                    )}
                  </View>
                </ScrollView>
              )}

              <TouchableOpacity style={st.masterSaveBtn} onPress={handleUpdateUser}>
                <Text style={st.masterSaveBtnText}>CẬP NHẬT TẤT CẢ THAY ĐỔI</Text>
              </TouchableOpacity>
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: { paddingHorizontal: 20, paddingBottom: 20, borderBottomLeftRadius: 32, borderBottomRightRadius: 32, ...SHADOW },
  headerTop: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 20 },
  headerTitle: { fontSize: 22, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  backBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  
  searchBox: { backgroundColor: "#fff", height: 50, borderRadius: 16, flexDirection: "row", alignItems: "center", paddingHorizontal: 15, marginBottom: 15, ...SHADOW },
  searchInput: { flex: 1, marginLeft: 10, fontFamily: "Nunito_600SemiBold", fontSize: 15, color: "#1e293b" },
  
  filterRow: { marginBottom: 5 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.15)", marginRight: 8 },
  filterPillActive: { backgroundColor: "#fff" },
  filterText: { color: "rgba(255,255,255,0.8)", fontFamily: "Nunito_700Bold", fontSize: 13 },
  filterTextActive: { color: "#154212" },

  center: { flex: 1, alignItems: "center", justifyContent: "center" },
  list: { padding: 16 },
  
  userCard: { backgroundColor: "#fff", borderRadius: 24, marginBottom: 12, ...SHADOW },
  cardInner: { flexDirection: "row", alignItems: "center", padding: 16 },
  avatarWrap: { width: 60, height: 60, borderRadius: 30, overflow: "hidden" },
  avatar: { width: "100%", height: "100%" },
  avatarPlaceholder: { width: "100%", height: "100%", alignItems: "center", justifyContent: "center" },
  lockBadge: { position: "absolute", bottom: 0, right: 0, width: 20, height: 20, borderRadius: 10, backgroundColor: "#ef4444", borderOuterWidth: 2, borderColor: "#fff", alignItems: "center", justifyContent: "center" },
  
  userMeta: { marginLeft: 16, flex: 1 },
  userName: { fontSize: 17, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  userPhone: { fontSize: 13, color: "#64748b", marginTop: 2 },
  miniStatsRow: { flexDirection: "row", gap: 10, marginTop: 8 },
  miniStatPill: { flexDirection: "row", alignItems: "center", gap: 4, backgroundColor: "#f1f5f9", paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  miniStatText: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#1e293b" },

  empty: { alignItems: "center", marginTop: 100 },
  emptyText: { marginTop: 16, fontSize: 16, color: "#94a3b8" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 36, borderTopRightRadius: 36, height: height * 0.9, padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 22, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  modalSubtitle: { fontSize: 13, color: "#64748b", marginTop: 4 },
  closeBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center" },

  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 17, fontFamily: "Nunito_800ExtraBold", color: "#1e293b", marginBottom: 16 },
  inputGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  inputCol: { flex: 1 },
  fieldLabel: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#64748b", marginBottom: 6 },
  masterInput: { backgroundColor: "#f8fafc", borderRadius: 14, paddingHorizontal: 16, height: 54, fontSize: 16, fontFamily: "Nunito_700Bold", borderWidth: 1, borderColor: "#e2e8f0" },
  
  roleList: { flexDirection: "row", gap: 10, marginBottom: 16 },
  roleOption: { flex: 1, paddingVertical: 12, borderRadius: 12, backgroundColor: "#f1f5f9", alignItems: "center" },
  roleOptionActive: { backgroundColor: "#154212" },
  roleOptionText: { fontSize: 12, fontFamily: "Nunito_800ExtraBold", color: "#64748b" },
  roleOptionTextActive: { color: "#fff" },

  banBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 14, borderRadius: 14, borderWidth: 1, borderColor: "#fee2e2", gap: 10 },
  banBtnActive: { borderColor: "#dcfce7" },
  banBtnText: { fontSize: 13, fontFamily: "Nunito_800ExtraBold" },

  emptyInv: { paddingVertical: 20, alignItems: "center" },
  emptyInvText: { color: "#94a3b8", fontSize: 14 },
  invItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", padding: 12, borderRadius: 18, marginBottom: 10, borderWidth: 1, borderColor: "#f1f5f9" },
  invImg: { width: 48, height: 48, borderRadius: 12 },
  invMeta: { flex: 1, marginLeft: 16 },
  invName: { fontSize: 15, fontFamily: "Nunito_700Bold", color: "#1e293b" },
  invType: { fontSize: 11, color: "#64748b", marginTop: 2 },
  invDel: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },

  masterSaveBtn: { backgroundColor: "#154212", paddingVertical: 18, borderRadius: 20, alignItems: "center", shadowColor: "#154212", shadowOpacity: 0.3, shadowRadius: 10, elevation: 8 },
  masterSaveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Nunito_800ExtraBold", letterSpacing: 1 },
});
