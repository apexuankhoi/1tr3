import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, TextInput, FlatList, Image
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import api from "../services/api";

export default function AdminUsersScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
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
    }
  };

  const handleToggleLock = (user: any) => {
    const action = user.is_locked ? "mở khóa" : "khóa";
    Alert.alert("Xác nhận", `Bạn có chắc muốn ${action} người dùng ${user.username}?`, [
      { text: "Hủy" },
      { text: "Đồng ý", onPress: async () => {
          try {
            await api.patch(`admin/users/${user.id}/status`, { is_locked: !user.is_locked });
            fetchUsers();
          } catch (err) {
            Alert.alert("Lỗi", "Không thể thực hiện");
          }
      }}
    ]);
  };

  const handleDeleteUser = (user: any) => {
    Alert.alert("CẢNH BÁO", `Xóa vĩnh viễn người dùng ${user.username}? Hành động này không thể hoàn tác!`, [
      { text: "Hủy" },
      { text: "XÓA", style: "destructive", onPress: async () => {
          try {
            await api.delete(`admin/users/${user.id}`);
            fetchUsers();
          } catch (err) {
            Alert.alert("Lỗi", "Không thể xóa");
          }
      }}
    ]);
  };

  const handleResetPassword = async () => {
    if (!newPassword) return Alert.alert("Lỗi", "Nhập mật khẩu mới");
    try {
      await api.patch(`admin/users/${selectedUser.id}/password`, { newPassword });
      setPasswordModalVisible(false);
      setNewPassword("");
      Alert.alert("Thành công", "Đã đổi mật khẩu mới");
    } catch (err) {
      Alert.alert("Lỗi", "Không thể đổi mật khẩu");
    }
  };

  const handleUpdateRole = (user: any) => {
    Alert.alert("Thay đổi quyền", `Chọn quyền mới cho ${user.username}`, [
      { text: "Farmer", onPress: () => updateRole(user.id, 'farmer') },
      { text: "Moderator", onPress: () => updateRole(user.id, 'moderator') },
      { text: "Admin", onPress: () => updateRole(user.id, 'admin') },
      { text: "Hủy", style: "cancel" }
    ]);
  };

  const updateRole = async (userId: number, role: string) => {
    try {
      await api.patch(`admin/users/${userId}/role`, { role });
      Alert.alert("Thành công", "Đã cập nhật quyền hạn");
      fetchUsers();
    } catch (err) {
      Alert.alert("Lỗi", "Không thể cập nhật quyền");
    }
  };

  const filteredUsers = users.filter(u => {
    const matchSearch = (u.full_name || u.username).toLowerCase().includes(searchQuery.toLowerCase());
    const matchRole = filterRole === 'all' || u.role === filterRole;
    return matchSearch && matchRole;
  });

  if (loading) return <View style={st.centered}><ActivityIndicator size="large" color="#154212" /></View>;

  return (
    <View style={[st.root, { paddingTop: insets.top }]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>Quản Lý Người Dùng</Text>
        <View style={{ width: 24 }} />
      </View>

      <View style={st.searchBar}>
        <View style={st.searchContainer}>
          <MaterialCommunityIcons name="magnify" size={20} color="#64748b" />
          <TextInput 
            style={st.searchInput} 
            placeholder="Tìm theo tên hoặc username..." 
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>
      </View>

      <View style={st.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={st.filterScroll}>
          {['all', 'farmer', 'moderator', 'admin'].map(r => (
            <TouchableOpacity 
              key={r} 
              style={[st.filterPill, filterRole === r && st.filterPillActive]} 
              onPress={() => setFilterRole(r)}
            >
              <Text style={[st.filterLabel, filterRole === r && st.filterLabelActive]}>
                {r === 'all' ? 'Tất cả' : r.charAt(0).toUpperCase() + r.slice(1)}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <FlatList
        data={filteredUsers}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={st.list}
        renderItem={({ item }) => (
          <View style={[st.card, item.is_locked && st.cardLocked]}>
            <View style={st.cardHeader}>
              <View style={st.avatarPlaceholder}>
                {item.avatar_url ? (
                  <Image source={{ uri: item.avatar_url }} style={st.avatarImg} />
                ) : (
                  <Text style={st.avatarText}>{item.username[0].toUpperCase()}</Text>
                )}
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={st.cardTitle}>{item.full_name || item.username}</Text>
                <Text style={st.cardMeta}>@{item.username} • {item.role}</Text>
              </View>
              {item.is_locked && (
                <MaterialCommunityIcons name="lock" size={20} color="#ef4444" />
              )}
            </View>
            
            <View style={st.cardActions}>
              <TouchableOpacity onPress={() => handleUpdateRole(item)} style={st.actionBtn}>
                <MaterialCommunityIcons name="account-edit-outline" size={18} color="#154212" />
                <Text style={[st.actionText, { color: "#154212" }]}>Sửa Quyền</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleToggleLock(item)} style={st.actionBtn}>
                <MaterialCommunityIcons name={item.is_locked ? "lock-open-outline" : "lock-outline"} size={18} color="#4b5563" />
                <Text style={st.actionText}>{item.is_locked ? "Mở khóa" : "Khóa"}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => { setSelectedUser(item); setPasswordModalVisible(true); }} style={st.actionBtn}>
                <MaterialCommunityIcons name="key-variant" size={18} color="#2563eb" />
                <Text style={[st.actionText, { color: "#2563eb" }]}>Mật khẩu</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={() => handleDeleteUser(item)} style={st.actionBtn}>
                <MaterialCommunityIcons name="trash-can-outline" size={18} color="#ef4444" />
                <Text style={[st.actionText, { color: "#ef4444" }]}>Xóa</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />

      <Modal visible={passwordModalVisible} transparent animationType="fade">
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <Text style={st.modalTitle}>Đổi mật khẩu cho {selectedUser?.username}</Text>
            <TextInput 
              style={st.input} 
              placeholder="Nhập mật khẩu mới" 
              secureTextEntry
              value={newPassword}
              onChangeText={setNewPassword}
            />
            <View style={st.modalBtns}>
              <TouchableOpacity onPress={() => setPasswordModalVisible(false)} style={st.cancelBtn}><Text style={st.cancelText}>Hủy</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleResetPassword} style={st.saveBtn}><Text style={st.saveText}>Lưu</Text></TouchableOpacity>
            </View>
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
  
  list: { padding: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  cardLocked: { backgroundColor: '#fef2f2', borderColor: '#fee2e2', borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  avatarPlaceholder: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#e2e8f0', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  avatarImg: { width: '100%', height: '100%' },
  avatarText: { fontSize: 18, fontWeight: 'bold', color: '#64748b' },
  cardTitle: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  cardMeta: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#64748b", marginTop: 2 },
  
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 16, paddingTop: 12, justifyContent: 'space-around' },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 13, fontFamily: "Nunito_700Bold", color: "#4b5563" },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 30 },
  modalContent: { backgroundColor: '#fff', borderRadius: 24, padding: 24 },
  modalTitle: { fontSize: 18, fontFamily: "Nunito_800ExtraBold", color: "#0f172a", marginBottom: 20 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, marginBottom: 20 },
  modalBtns: { flexDirection: 'row', gap: 12 },
  cancelBtn: { flex: 1, padding: 12, alignItems: 'center' },
  saveBtn: { flex: 1, backgroundColor: '#154212', padding: 12, borderRadius: 12, alignItems: 'center' },
  cancelText: { color: '#64748b', fontFamily: 'Nunito_700Bold' },
  saveText: { color: '#fff', fontFamily: 'Nunito_800ExtraBold' },

  searchBar: { paddingHorizontal: 20, paddingVertical: 10, backgroundColor: '#fff' },
  searchContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#f1f5f9', borderRadius: 12, paddingHorizontal: 12, height: 44 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14, fontFamily: 'Nunito_600SemiBold' },

  filterBar: { backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#f1f5f9', paddingBottom: 10 },
  filterScroll: { paddingHorizontal: 20, gap: 8 },
  filterPill: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20, backgroundColor: '#f1f5f9' },
  filterPillActive: { backgroundColor: '#154212' },
  filterLabel: { fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#64748b' },
  filterLabelActive: { color: '#fff' },
});
