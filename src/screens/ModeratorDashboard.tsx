import React, { useEffect, useState } from "react";
import { 
  View, Text, ScrollView, TouchableOpacity, Image, Alert,
  StyleSheet, Platform, ActivityIndicator, StatusBar, TextInput, Modal,
  Dimensions, FlatList, Linking
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { adminService } from "../services/api";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInRight } from "react-native-reanimated";
import { useGameStore } from "../store/useGameStore";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 15, shadowOffset: { width: 0, height: 6 } },
  android: { elevation: 5 },
});

type TabType = 'submissions' | 'users' | 'redemptions';

export default function ModeratorDashboard() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const { t, language } = useGameStore();
  
  const [activeTab, setActiveTab] = useState<TabType>('submissions');
  const [loading, setLoading] = useState(true);
  
  // Submissions State
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null);
  
  // Users State
  const [users, setUsers] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [userInventory, setUserInventory] = useState<any[]>([]);
  const [inventoryLoading, setInventoryLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);

  // Redemptions State
  const [redemptions, setRedemptions] = useState<any[]>([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'submissions') {
        const data: any = await adminService.getPendingSubmissions();
        setSubmissions(data || []);
      } else if (activeTab === 'users') {
        const data: any = await adminService.getUsers();
        setUsers(data || []);
      } else if (activeTab === 'redemptions') {
        const data: any = await adminService.getAdminRedemptions();
        setRedemptions(data || []);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleUpdateRedemptionStatus = async (id: number, status: string) => {
    try {
      await adminService.updateRedemptionStatus(id, status);
      Alert.alert("Thành công", "Đã cập nhật trạng thái đơn hàng");
      fetchData();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật trạng thái");
    }
  };

  const handleApprove = async (id: number) => {
    setActionLoadingId(id);
    try {
      await adminService.approveSubmission(id);
      Alert.alert(t('admin_dash.success_title'), t('admin_dash.success_message'));
      fetchData();
    } catch (error) {
      Alert.alert(t('admin_dash.error_title'), t('admin_dash.error_message'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleReject = async (id: number) => {
    setActionLoadingId(id);
    try {
      await adminService.rejectSubmission(id);
      Alert.alert(t('admin_dash.rejected_title'), t('admin_dash.rejected_message'));
      fetchData();
    } catch (error) {
      Alert.alert(t('admin_dash.error_title'), t('admin_dash.error_message'));
    } finally {
      setActionLoadingId(null);
    }
  };

  const openUserEditor = async (user: any) => {
    setSelectedUser({ ...user });
    setEditModalVisible(true);
    setInventoryLoading(true);
    try {
      const inv: any = await adminService.getUserInventory(user.id);
      setUserInventory(inv || []);
    } catch (error) {
      console.error("Load inventory error:", error);
    } finally {
      setInventoryLoading(false);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;
    try {
      await adminService.updateUser(selectedUser.id, {
        coins: Number(selectedUser.coins),
        seeds: Number(selectedUser.seeds),
        level: Number(selectedUser.level),
        exp: Number(selectedUser.exp),
        role: selectedUser.role,
        is_locked: selectedUser.is_locked ? 1 : 0
      });
      Alert.alert("Thành công", "Đã cập nhật thông tin người dùng");
      setEditModalVisible(false);
      fetchData();
    } catch (error) {
      Alert.alert("Lỗi", "Không thể cập nhật người dùng");
    }
  };

  const renderSubmissionItem = (sub: any, index: number) => {
    const evidenceParts = sub.image_url ? sub.image_url.split("|GPS:") : [""];
    const imageUrl = evidenceParts[0];
    const gpsData = evidenceParts.length > 1 ? evidenceParts[1].split("|ADDR:") : null;
    const address = gpsData && gpsData.length > 1 ? gpsData[1] : null;

    return (
      <Animated.View key={sub.id} entering={FadeInDown.delay(index * 100).duration(500)} style={st.card}>
        <View style={st.cardHeader}>
          <View style={st.avatar}>
            {sub.avatar_url ? (
              <Image source={{ uri: sub.avatar_url }} style={st.avatarImg} />
            ) : (
              <MaterialCommunityIcons name="account" size={24} color="#154212" />
            )}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={st.username}>{sub.full_name || sub.username}</Text>
            <Text style={st.timestamp}>{new Date(sub.submitted_at).toLocaleString()}</Text>
          </View>
        </View>

        <View style={st.taskInfo}>
          <Text style={st.taskTitle}>{sub.title}</Text>
          <View style={st.rewardPill}>
            <MaterialCommunityIcons name="star-four-points" size={14} color="#fbbf24" />
            <Text style={st.rewardText}>+{sub.reward} xu</Text>
          </View>
        </View>

        {!!address && (
          <View style={st.gpsBox}>
            <MaterialCommunityIcons name="map-marker-radius" size={16} color="#7c3aed" />
            <Text style={st.gpsText} numberOfLines={2}>{address}</Text>
          </View>
        )}

        <View style={st.imgWrap}>
          <Image source={{ uri: imageUrl || "https://via.placeholder.com/400" }} style={st.img} resizeMode="cover" />
        </View>

        <View style={st.actions}>
          <TouchableOpacity onPress={() => handleReject(sub.id)} style={st.rejectBtn}>
            <Text style={st.rejectText}>{t('admin_dash.reject')}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => handleApprove(sub.id)} style={st.approveBtn}>
            {actionLoadingId === sub.id ? <ActivityIndicator size="small" color="#fff" /> : <Text style={st.approveText}>Duyệt +Xu</Text>}
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  const renderUserItem = ({ item, index }: { item: any, index: number }) => (
    <Animated.View entering={FadeInRight.delay(index * 50)} style={st.userCard}>
      <TouchableOpacity style={st.userCardInner} onPress={() => openUserEditor(item)}>
        <View style={st.userAvatar}>
          {item.avatar_url ? (
            <Image source={{ uri: item.avatar_url }} style={st.avatarImg} />
          ) : (
            <MaterialCommunityIcons name="account" size={30} color="#64748b" />
          )}
        </View>
        <View style={{ flex: 1 }}>
          <Text style={st.userNameText}>{item.full_name || item.username}</Text>
          <Text style={st.userRoleText}>{item.username} • {item.role}</Text>
          <View style={st.userStatsRow}>
            <View style={st.miniStat}>
              <MaterialCommunityIcons name="star-four-points" size={12} color="#fbbf24" />
              <Text style={st.miniStatText}>{item.coins}</Text>
            </View>
            <View style={st.miniStat}>
              <MaterialCommunityIcons name="trending-up" size={12} color="#3b82f6" />
              <Text style={st.miniStatText}>Lv.{item.level}</Text>
            </View>
          </View>
        </View>
        <MaterialCommunityIcons name="chevron-right" size={24} color="#cbd5e1" />
      </TouchableOpacity>
    </Animated.View>
  );

  const renderRedemptionItem = (item: any, index: number) => {
    const statusColors: any = {
      pending: { bg: '#fef3c7', text: '#92400e', label: 'Chờ xử lý' },
      shipping: { bg: '#dbeafe', text: '#1e40af', label: 'Đang giao' },
      completed: { bg: '#d1fae5', text: '#065f46', label: 'Hoàn tất' },
      cancelled: { bg: '#fee2e2', text: '#991b1b', label: 'Đã hủy' },
    };
    const s = statusColors[item.status] || statusColors.pending;

    return (
      <Animated.View entering={FadeInDown.delay(index * 50)} key={item.id} style={st.redemptionCard}>
        <View style={st.redemptionHeader}>
          <Image source={{ uri: item.item_image || 'https://via.placeholder.com/50' }} style={st.redemptionImg} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={st.redemptionName}>{item.item_name}</Text>
            <Text style={st.redemptionUser}>Người đổi: {item.user_full_name || item.username}</Text>
          </View>
          <View style={[st.statusPill, { backgroundColor: s.bg }]}>
            <Text style={[st.statusText, { color: s.text }]}>{s.label}</Text>
          </View>
        </View>

        {/* Shipping Info */}
        <View style={st.shippingBox}>
          <View style={st.shippingRow}>
            <MaterialCommunityIcons name="account-outline" size={16} color="#64748b" />
            <Text style={st.shippingVal}>{item.shipping_name || 'Không có tên'}</Text>
          </View>
          <View style={st.shippingRow}>
            <MaterialCommunityIcons name="phone-outline" size={16} color="#64748b" />
            <Text style={st.shippingVal}>{item.shipping_phone || 'Không có SĐT'}</Text>
          </View>
          <View style={st.shippingRow}>
            <MaterialCommunityIcons name="map-marker-outline" size={16} color="#64748b" />
            <Text style={st.shippingVal}>{item.shipping_address || 'Không có địa chỉ'}</Text>
          </View>
          {item.notes && (
            <View style={st.shippingRow}>
              <MaterialCommunityIcons name="note-text-outline" size={16} color="#64748b" />
              <Text style={st.shippingVal}>{item.notes}</Text>
            </View>
          )}
        </View>

        {/* Actions */}
        <View style={st.redemptionActions}>
          <TouchableOpacity 
            style={[st.statusBtn, item.status === 'shipping' && st.statusBtnActive, { backgroundColor: '#3b82f6' }]}
            onPress={() => handleUpdateRedemptionStatus(item.id, 'shipping')}
          >
            <Text style={st.statusBtnText}>Giao hàng</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[st.statusBtn, item.status === 'completed' && st.statusBtnActive, { backgroundColor: '#10b981' }]}
            onPress={() => handleUpdateRedemptionStatus(item.id, 'completed')}
          >
            <Text style={st.statusBtnText}>Hoàn tất</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[st.statusBtn, item.status === 'cancelled' && st.statusBtnActive, { backgroundColor: '#ef4444' }]}
            onPress={() => handleUpdateRedemptionStatus(item.id, 'cancelled')}
          >
            <Text style={st.statusBtnText}>Hủy đơn</Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    );
  };

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <View style={[st.header, { paddingTop: insets.top + 20 }]}>
        <View style={{ flex: 1 }}>
          <Text style={st.headerTitle}>Hệ thống Admin</Text>
          <Text style={st.headerSubtitle}>Quản lý dữ liệu tập trung</Text>
        </View>
        <TouchableOpacity onPress={() => navigation.navigate("QRScanner" as never)} style={st.qrBtn}>
          <MaterialCommunityIcons name="qrcode-scan" size={20} color="#154212" />
        </TouchableOpacity>
      </View>

      {/* Tabs */}
      <View style={st.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
          <TouchableOpacity 
            style={[st.tab, activeTab === 'submissions' && st.tabActive]}
            onPress={() => setActiveTab('submissions')}
          >
            <MaterialCommunityIcons name="clipboard-check" size={18} color={activeTab === 'submissions' ? "#fff" : "#64748b"} />
            <Text style={[st.tabLabel, activeTab === 'submissions' && st.tabLabelActive]}>Nhiệm vụ</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[st.tab, activeTab === 'users' && st.tabActive]}
            onPress={() => setActiveTab('users')}
          >
            <MaterialCommunityIcons name="account-group" size={18} color={activeTab === 'users' ? "#fff" : "#64748b"} />
            <Text style={[st.tabLabel, activeTab === 'users' && st.tabLabelActive]}>Người dùng</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[st.tab, activeTab === 'redemptions' && st.tabActive]}
            onPress={() => setActiveTab('redemptions')}
          >
            <MaterialCommunityIcons name="gift" size={18} color={activeTab === 'redemptions' ? "#fff" : "#64748b"} />
            <Text style={[st.tabLabel, activeTab === 'redemptions' && st.tabLabelActive]}>Đổi quà</Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      {loading ? (
        <View style={st.loader}>
          <ActivityIndicator size="large" color="#154212" />
          <Text style={st.loaderText}>Đang tải dữ liệu...</Text>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          {activeTab === 'submissions' && (
            <ScrollView contentContainerStyle={st.content}>
              {submissions.length === 0 ? (
                <View style={st.emptyState}>
                  <MaterialCommunityIcons name="check-all" size={60} color="#cbd5e1" />
                  <Text style={st.emptyTitle}>Tất cả đã hoàn thành</Text>
                </View>
              ) : (
                submissions.map((sub, idx) => renderSubmissionItem(sub, idx))
              )}
            </ScrollView>
          )}

          {activeTab === 'users' && (
            <View style={{ flex: 1 }}>
              <View style={st.searchBarContainer}>
                <View style={st.searchBar}>
                  <MaterialCommunityIcons name="magnify" size={20} color="#94a3b8" />
                  <TextInput
                    style={st.searchInput}
                    placeholder="Tìm tên hoặc SĐT..."
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                  />
                </View>
              </View>
              <FlatList
                data={users.filter(u => 
                  (u.full_name || u.username).toLowerCase().includes(searchQuery.toLowerCase()) ||
                  u.username.includes(searchQuery)
                )}
                renderItem={renderUserItem}
                keyExtractor={item => item.id.toString()}
                contentContainerStyle={st.content}
              />
            </View>
          )}

          {activeTab === 'redemptions' && (
            <ScrollView contentContainerStyle={st.content}>
              {redemptions.length === 0 ? (
                <View style={st.emptyState}>
                  <MaterialCommunityIcons name="gift-off-outline" size={60} color="#cbd5e1" />
                  <Text style={st.emptyTitle}>Chưa có yêu cầu đổi quà</Text>
                </View>
              ) : (
                redemptions.map((item, idx) => renderRedemptionItem(item, idx))
              )}
            </ScrollView>
          )}
        </View>
      )}

      {/* User Editor Modal */}
      <Modal visible={editModalVisible} animationType="slide" transparent>
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>Chỉnh sửa người dùng</Text>
              <TouchableOpacity onPress={() => setEditModalVisible(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#1e293b" />
              </TouchableOpacity>
            </View>

            {selectedUser && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={st.editorSection}>
                  <Text style={st.sectionLabel}>Thông số cơ bản</Text>
                  <View style={st.inputRow}>
                    <View style={st.inputHalf}>
                      <Text style={st.inputLabel}>Xu (Coins)</Text>
                      <TextInput 
                        style={st.editorInput}
                        keyboardType="numeric"
                        value={selectedUser.coins.toString()}
                        onChangeText={(v) => setSelectedUser({ ...selectedUser, coins: v })}
                      />
                    </View>
                    <View style={st.inputHalf}>
                      <Text style={st.inputLabel}>Hạt giống</Text>
                      <TextInput 
                        style={st.editorInput}
                        keyboardType="numeric"
                        value={selectedUser.seeds.toString()}
                        onChangeText={(v) => setSelectedUser({ ...selectedUser, seeds: v })}
                      />
                    </View>
                  </View>

                  <View style={st.inputRow}>
                    <View style={st.inputHalf}>
                      <Text style={st.inputLabel}>Level</Text>
                      <TextInput 
                        style={st.editorInput}
                        keyboardType="numeric"
                        value={selectedUser.level.toString()}
                        onChangeText={(v) => setSelectedUser({ ...selectedUser, level: v })}
                      />
                    </View>
                    <View style={st.inputHalf}>
                      <Text style={st.inputLabel}>EXP</Text>
                      <TextInput 
                        style={st.editorInput}
                        keyboardType="numeric"
                        value={selectedUser.exp.toString()}
                        onChangeText={(v) => setSelectedUser({ ...selectedUser, exp: v })}
                      />
                    </View>
                  </View>

                  <Text style={st.inputLabel}>Vai trò (Role)</Text>
                  <View style={st.roleOptions}>
                    {['farmer', 'moderator', 'admin'].map(r => (
                      <TouchableOpacity 
                        key={r}
                        style={[st.roleBtn, selectedUser.role === r && st.roleBtnActive]}
                        onPress={() => setSelectedUser({ ...selectedUser, role: r })}
                      >
                        <Text style={[st.roleBtnText, selectedUser.role === r && st.roleBtnTextActive]}>{r}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <TouchableOpacity 
                    style={[st.lockBtn, selectedUser.is_locked && st.lockBtnActive]}
                    onPress={() => setSelectedUser({ ...selectedUser, is_locked: !selectedUser.is_locked })}
                  >
                    <MaterialCommunityIcons 
                      name={selectedUser.is_locked ? "lock-open-outline" : "lock-outline"} 
                      size={20} 
                      color={selectedUser.is_locked ? "#16a34a" : "#ef4444"} 
                    />
                    <Text style={[st.lockBtnText, { color: selectedUser.is_locked ? "#16a34a" : "#ef4444" }]}>
                      {selectedUser.is_locked ? "Mở khóa tài khoản" : "Khóa tài khoản"}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={st.editorSection}>
                  <Text style={st.sectionLabel}>Quản lý kho đồ</Text>
                  {inventoryLoading ? (
                    <ActivityIndicator size="small" color="#154212" />
                  ) : userInventory.length === 0 ? (
                    <Text style={st.emptyInventory}>Kho đồ trống</Text>
                  ) : (
                    userInventory.map((item) => (
                      <View key={item.inventory_id} style={st.inventoryItem}>
                        <Image source={{ uri: item.image_url }} style={st.inventoryImg} />
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={st.inventoryName}>{item.name}</Text>
                          <Text style={st.inventoryType}>{item.item_type}</Text>
                        </View>
                      </View>
                    ))
                  )}
                </View>
              </ScrollView>
            )}

            <TouchableOpacity style={st.saveBtn} onPress={handleUpdateUser}>
              <Text style={st.saveBtnText}>Lưu thay đổi</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      
      <View style={{ height: 60 }} />
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  header: { 
    flexDirection: "row", alignItems: "center", paddingHorizontal: 24, paddingBottom: 20, 
    backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#e2e8f0", ...SHADOW 
  },
  headerTitle: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  headerSubtitle: { fontSize: 13, fontFamily: "Nunito_600SemiBold", color: "#64748b", marginTop: 4 },
  qrBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: "#f0fdf4", alignItems: "center", justifyContent: "center" },
  
  tabContainer: { backgroundColor: "#fff", padding: 12, borderBottomWidth: 1, borderBottomColor: "#e2e8f0" },
  tab: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, backgroundColor: "#f1f5f9", marginRight: 8 },
  tabActive: { backgroundColor: "#154212" },
  tabLabel: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#64748b", marginLeft: 6 },
  tabLabelActive: { color: "#fff" },

  searchBarContainer: { padding: 16 },
  searchBar: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, height: 48, ...SHADOW },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 14 },

  content: { padding: 16 },
  loader: { flex: 1, alignItems: "center", justifyContent: "center" },
  loaderText: { marginTop: 12, color: "#64748b" },

  card: { backgroundColor: "#fff", borderRadius: 24, padding: 16, marginBottom: 16, ...SHADOW },
  cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  avatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarImg: { width: "100%", height: "100%", borderRadius: 20 },
  username: { fontSize: 15, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  timestamp: { fontSize: 11, color: "#94a3b8" },
  taskInfo: { marginBottom: 12 },
  taskTitle: { fontSize: 15, fontFamily: "Nunito_700Bold", color: "#154212" },
  rewardPill: { flexDirection: "row", alignItems: "center", gap: 4, marginTop: 4 },
  rewardText: { fontSize: 12, fontFamily: "Nunito_800ExtraBold", color: "#b45309" },
  gpsBox: { flexDirection: "row", alignItems: "center", backgroundColor: "#f1f5f9", padding: 8, borderRadius: 8, marginBottom: 12, gap: 6 },
  gpsText: { fontSize: 11, color: "#64748b" },
  imgWrap: { width: "100%", height: 160, borderRadius: 16, overflow: "hidden", marginBottom: 12 },
  img: { width: "100%", height: "100%" },
  actions: { flexDirection: "row", gap: 10 },
  rejectBtn: { flex: 1, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#fee2e2", alignItems: "center" },
  rejectText: { color: "#ef4444", fontFamily: "Nunito_700Bold" },
  approveBtn: { flex: 2, backgroundColor: "#154212", paddingVertical: 10, borderRadius: 12, alignItems: "center" },
  approveText: { color: "#fff", fontFamily: "Nunito_700Bold" },

  userCard: { marginBottom: 12 },
  userCardInner: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 20, padding: 12, ...SHADOW },
  userAvatar: { width: 50, height: 50, borderRadius: 25, backgroundColor: "#f1f5f9", alignItems: "center", justifyContent: "center", marginRight: 12, overflow: "hidden" },
  userNameText: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  userRoleText: { fontSize: 12, color: "#64748b", marginVertical: 2 },
  userStatsRow: { flexDirection: "row", gap: 12 },
  miniStat: { flexDirection: "row", alignItems: "center", gap: 4 },
  miniStatText: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#1e293b" },

  redemptionCard: { backgroundColor: "#fff", borderRadius: 24, padding: 16, marginBottom: 16, ...SHADOW },
  redemptionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
  redemptionImg: { width: 50, height: 50, borderRadius: 12 },
  redemptionName: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  redemptionUser: { fontSize: 12, color: "#64748b" },
  statusPill: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 10, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  shippingBox: { backgroundColor: "#f8fafc", padding: 12, borderRadius: 16, marginBottom: 16, gap: 8 },
  shippingRow: { flexDirection: "row", alignItems: "center", gap: 8 },
  shippingVal: { fontSize: 13, color: "#475569", flex: 1 },
  redemptionActions: { flexDirection: "row", gap: 8 },
  statusBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: "#f1f5f9", alignItems: "center" },
  statusBtnActive: { borderWidth: 2, borderColor: "#000" },
  statusBtnText: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#fff" },

  emptyState: { paddingVertical: 60, alignItems: "center" },
  emptyTitle: { marginTop: 12, color: "#94a3b8", fontFamily: "Nunito_700Bold" },

  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" },
  modalContent: { backgroundColor: "#fff", borderTopLeftRadius: 32, borderTopRightRadius: 32, height: height * 0.85, padding: 24 },
  modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  modalTitle: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },

  editorSection: { marginBottom: 24 },
  sectionLabel: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#1e293b", marginBottom: 16 },
  inputRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  inputHalf: { flex: 1 },
  inputLabel: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#64748b", marginBottom: 6 },
  editorInput: { backgroundColor: "#f1f5f9", borderRadius: 12, paddingHorizontal: 12, height: 48, fontSize: 15 },
  roleOptions: { flexDirection: "row", gap: 8, marginTop: 4, marginBottom: 16 },
  roleBtn: { flex: 1, paddingVertical: 10, borderRadius: 10, backgroundColor: "#f1f5f9", alignItems: "center" },
  roleBtnActive: { backgroundColor: "#154212" },
  roleBtnText: { fontSize: 13, fontFamily: "Nunito_700Bold", color: "#64748b" },
  roleBtnTextActive: { color: "#fff" },
  lockBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: "#fee2e2", gap: 8 },
  lockBtnActive: { borderColor: "#dcfce7" },
  lockBtnText: { fontSize: 14, fontFamily: "Nunito_700Bold" },
  emptyInventory: { textAlign: "center", color: "#94a3b8", paddingVertical: 20 },
  inventoryItem: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", padding: 12, borderRadius: 16, marginBottom: 8 },
  inventoryImg: { width: 44, height: 44, borderRadius: 8 },
  inventoryName: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#1e293b" },
  inventoryType: { fontSize: 11, color: "#64748b" },
  saveBtn: { backgroundColor: "#154212", paddingVertical: 16, borderRadius: 16, alignItems: "center", marginTop: 10 },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Nunito_800ExtraBold" },
});
