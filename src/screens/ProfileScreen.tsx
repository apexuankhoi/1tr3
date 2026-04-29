import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  StatusBar,
  Platform,
  Modal,
  TextInput,
  ActivityIndicator,
  Alert,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameStore } from "../store/useGameStore";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import QRCode from 'react-native-qrcode-svg';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import { uploadImage } from "../services/api";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation();

  const { 
    userId, fullName, userName, coins, level, exp, avatarUrl, coverUrl, bio, location, createdAt,
    redemptions, fetchRedemptions, submissions, fetchSubmissions, userStats, updateProfile, fetchUserData, userRole,
    language, setLanguage, t
  } = useGameStore();

  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedQR, setSelectedQR] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"tasks" | "rewards" | "badges">("tasks");
  const [uploadingCover, setUploadingCover] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showPrivacy, setShowPrivacy] = useState(false);
  const [showLanguageModal, setShowLanguageModal] = useState(false);
  const currentLanguage = language;

  // Edit states
  const [editData, setEditData] = useState({
    fullName: fullName,
    bio: bio,
    location: location
  });

  React.useEffect(() => {
    fetchRedemptions();
    fetchSubmissions();
    if (userId) fetchUserData(userId);
  }, []);

  const fetchGPS = async () => {
    setGpsLoading(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        alert(t('profile.gps_permission'));
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      const geo = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });
      
      if (geo.length > 0) {
        const g = geo[0];
        const address = [g.subregion, g.region].filter(Boolean).join(", ");
        setEditData(prev => ({ ...prev, location: address || "" }));
      }
    } catch (err) {
      console.error(err);
      alert(t('profile.gps_unavailable'));
    } finally {
      setGpsLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return t('common.not_updated');
    const d = new Date(dateStr);
    return `${t('profile.joined')} ${d.getMonth() + 1}/${d.getFullYear()}`;
  };

  const pickImage = async (type: 'avatar' | 'cover') => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: type === 'avatar' ? [1, 1] : [16, 9],
      quality: 0.7,
    });

    if (!result.canceled && result.assets && result.assets.length > 0) {
      if (type === 'avatar') setLoading(true);
      else setUploadingCover(true);
      
      try {
        const uploadedUrl = await uploadImage(result.assets[0].uri);
        await updateProfile({ [type === 'avatar' ? 'avatarUrl' : 'coverUrl']: uploadedUrl });
      } catch (error) {
        console.error(`Lỗi upload ${type}:`, error);
      } finally {
        if (type === 'avatar') setLoading(false);
        else setUploadingCover(false);
      }
    }
  };



  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      t('auth.logout_confirm'),
      [
        { text: t('common.cancel'), style: "cancel" },
        { 
          text: t('profile.logout'), 
          style: "destructive", 
          onPress: () => useGameStore.getState().logout() 
        }
      ]
    );
  };

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateProfile(editData);
      setIsEditing(false);
    } catch (error) {
      console.error(t('common.error'), error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={st.root}>
      <StatusBar barStyle="light-content" />

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 100 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Header Container */}
        <View style={st.headerContainer}>
          <View style={st.coverWrap}>
            <Image
              source={coverUrl ? { uri: coverUrl } : require("../../assets/sky_bg.png")}
              style={st.coverImg}
              resizeMode="cover"
            />
            <LinearGradient colors={["rgba(0,0,0,0.3)", "transparent"]} style={st.coverOverlay} />
            <TouchableOpacity style={st.coverCameraBtn} onPress={() => pickImage('cover')}>
              <MaterialCommunityIcons name="camera-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={st.profileInfoWrap}>
            <View style={st.avatarContainer}>
              <View style={st.avatarWrap}>
                <Image
                  source={(avatarUrl && avatarUrl.length > 5) ? { uri: avatarUrl } : require("../../assets/avatar_premium.png")}
                  style={st.avatarImg}
                />
                {loading && <View style={[st.avatarImg, st.avatarOverlayLoading]}><ActivityIndicator color="#fff" /></View>}
                <TouchableOpacity style={st.avatarCameraBtn} onPress={() => pickImage('avatar')}>
                  <MaterialCommunityIcons name="camera-plus" size={16} color="#fff" />
                </TouchableOpacity>
              </View>
              
              <View style={st.actionBtns}>
                <TouchableOpacity style={st.editBtn} onPress={() => { setEditData({ fullName, bio, location }); setIsEditing(true); }}>
                  <Text style={st.editBtnTxt}>{t('profile.edit_profile')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={st.shareBtn}>
                  <MaterialCommunityIcons name="share-variant-outline" size={20} color="#374151" />
                </TouchableOpacity>
              </View>
            </View>

            <View style={st.nameContainer}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={st.name}>{fullName || t('common.not_updated')}</Text>
                <MaterialCommunityIcons name="check-decagram" size={20} color="#1d4ed8" style={{ marginLeft: 6 }} />
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4 }}>
                <View style={{ backgroundColor: '#154212', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 10, marginRight: 8 }}>
                  <Text style={{ color: '#fff', fontSize: 10, fontFamily: 'Nunito_800ExtraBold' }}>{t('profile.level_short')}{level}</Text>
                </View>
                <Text style={{ color: '#6b7280', fontSize: 11, fontFamily: 'Nunito_700Bold' }}>{exp} / {level * 100} {t('profile.exp_short')}</Text>
              </View>
              <Text style={st.username}>@{userName}</Text>
            </View>

            {bio ? <Text style={st.bioText}>{bio}</Text> : null}

            <View style={st.metaRow}>
              <View style={st.metaItem}>
                <MaterialCommunityIcons name="map-marker-outline" size={16} color="#6b7280" />
                <Text style={st.metaTxt}>{location || t('common.not_updated')}</Text>
              </View>
              <View style={st.metaItem}>
                <MaterialCommunityIcons name="calendar-blank-outline" size={16} color="#6b7280" />
                <Text style={st.metaTxt}>{formatDate(createdAt)}</Text>
              </View>
            </View>

            <View style={st.followRow}>
              <Text style={st.followItem}><Text style={st.followCount}>{userStats.tasksCompleted}</Text> {t('profile.tasks_stat')}</Text>
              <Text style={st.followItem}><Text style={st.followCount}>{coins}</Text> {t('profile.coins_stat')}</Text>
            </View>
          </View>
        </View>

        {/* Management Section (Admin/Moderator) */}
        {(userRole === 'admin' || userRole === 'moderator') && (
          <View style={st.mgmtSection}>
            <Text style={st.sectionTitle}>{t('profile.mgmt')}</Text>
            <View style={st.mgmtGrid}>
              {(userRole === 'admin' || userRole === 'moderator') && (
                <TouchableOpacity 
                  style={st.mgmtCard}
                  onPress={() => navigation.navigate("ModDashboard" as any)}
                >
                  <LinearGradient colors={['#2563eb', '#1d4ed8']} style={st.mgmtIcon}>
                    <MaterialCommunityIcons name="check-decagram" size={20} color="#fff" />
                  </LinearGradient>
                  <Text style={st.mgmtText}>{t('profile.verify')}</Text>
                </TouchableOpacity>
              )}
              
              {userRole === 'admin' && (
                <>
                  <TouchableOpacity 
                    style={st.mgmtCard}
                    onPress={() => navigation.navigate("AdminDashboard" as any)}
                  >
                    <LinearGradient colors={['#154212', '#2d5a27']} style={st.mgmtIcon}>
                      <MaterialCommunityIcons name="shield-crown" size={20} color="#fff" />
                    </LinearGradient>
                    <Text style={st.mgmtText}>{t('profile.admin')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={st.mgmtCard}
                    onPress={() => navigation.navigate("Map" as any)}
                  >
                    <LinearGradient colors={['#7c3aed', '#6d28d9']} style={st.mgmtIcon}>
                      <MaterialCommunityIcons name="map-marker-radius" size={20} color="#fff" />
                    </LinearGradient>
                    <Text style={st.mgmtText}>{t('tabs.map')}</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </View>
        )}

        {/* Tabs */}
        <View style={st.tabsContainer}>
          {[
            { id: 'tasks', label: t('profile.tab_tasks'), icon: 'clipboard-list' },
            { id: 'rewards', label: t('profile.tab_rewards'), icon: 'gift' },
            { id: 'badges', label: t('profile.tab_badges'), icon: 'medal' },
          ].map((tab) => (
            <TouchableOpacity 
              key={tab.id} 
              onPress={() => setActiveTab(tab.id as any)}
              style={[st.tabBtn, activeTab === tab.id && st.tabBtnActive]}
            >
              <MaterialCommunityIcons 
                name={tab.icon as any} 
                size={22} 
                color={activeTab === tab.id ? '#154212' : '#9ca3af'} 
              />
              <Text style={[st.tabLabel, activeTab === tab.id && st.tabLabelActive]}>{tab.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        <View style={st.tabContent}>
          {activeTab === 'tasks' && (
            <Animated.View entering={FadeInDown} style={st.tasksTabContainer}>
              <View style={st.recentHeader}>
                <Text style={st.recentTitle}>{t('profile.recent_activity')}</Text>
                <Text style={st.recentSub}>{t('profile.activity_desc', { count: userStats.tasksCompleted })}</Text>
              </View>

              {(submissions?.length || 0) > 0 ? (
                <View style={st.submissionList}>
                  {submissions.map((sub, idx) => (
                    <View key={idx} style={st.submissionCard}>
                      <View style={st.subIconBox}>
                        <MaterialCommunityIcons 
                          name={sub.status === 'approved' ? 'check-circle' : sub.status === 'rejected' ? 'close-circle' : 'clock-outline'} 
                          size={24} 
                          color={sub.status === 'approved' ? '#10b981' : sub.status === 'rejected' ? '#ef4444' : '#f59e0b'} 
                        />
                      </View>
                      <View style={st.subContent}>
                        <Text style={st.subTitle}>{sub.title}</Text>
                        <Text style={st.subDesc} numberOfLines={2}>{sub.description}</Text>
                        <View style={st.subFooter}>
                          <Text style={st.subDate}>{new Date(sub.submitted_at).toLocaleDateString(language === 'vi' ? 'vi-VN' : 'en-US')}</Text>
                          <View style={[st.statusBadge, { backgroundColor: sub.status === 'approved' ? '#d1fae5' : sub.status === 'rejected' ? '#fee2e2' : '#fef3c7' }]}>
                            <Text style={[st.statusBadgeTxt, { color: sub.status === 'approved' ? '#065f46' : sub.status === 'rejected' ? '#991b1b' : '#92400e' }]}>
                              {sub.status === 'approved' ? t('tasks.status_approved') : sub.status === 'rejected' ? t('tasks.status_rejected') : t('tasks.status_pending')}
                            </Text>
                          </View>
                        </View>
                      </View>
                    </View>
                  ))}
                </View>
              ) : (
                <View style={st.emptyState}>
                  <MaterialCommunityIcons name="flower-outline" size={64} color="#e5e7eb" />
                  <Text style={st.emptyTitle}>{t('tasks.empty')}</Text>
                  <Text style={st.emptySub}>{t('home.welcome')}</Text>
                </View>
              )}
            </Animated.View>
          )}

          {activeTab === 'rewards' && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ paddingHorizontal: 20, gap: 12 }}>
              {(redemptions?.length || 0) > 0 ? redemptions.map((red, i) => (
                <TouchableOpacity key={i} style={st.rewardCard} onPress={() => setSelectedQR(red.qr_code)}>
                  <Image source={{ uri: red.image_url }} style={st.rewardImg} />
                  <Text style={st.rewardName} numberOfLines={1}>{red.name}</Text>
                  <View style={[st.rewardBadge, red.status === 'collected' && { backgroundColor: '#d1fae5' }]}>
                    <Text style={[st.rewardBadgeTxt, red.status === 'collected' && { color: '#065f46' }]}>
                      {red.status === 'collected' ? t('tasks.status_approved') : t('tasks.status_pending')}
                    </Text>
                  </View>
                </TouchableOpacity>
              )) : (
                <Text style={st.noRewards}>{t('common.no_data')}</Text>
              )}
            </ScrollView>
          )}

          {activeTab === 'badges' && (
            <View style={st.badgeGrid}>
              {[1, 2, 3].map(b => (
                <View key={b} style={st.badgeItem}>
                  <View style={st.badgeIconPlaceholder}>
                    <MaterialCommunityIcons name="lock" size={24} color="#d1d5db" />
                  </View>
                  <Text style={st.badgeName}>{t('profile.tab_badges')} {b}</Text>
                </View>
              ))}
            </View>
          )}
        </View>

        {/* Quick Settings */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>{t('profile.settings')}</Text>
          <View style={st.settingsList}>
            {[
              { 
                title: t('profile.help_center'), 
                icon: "help-circle-outline", 
                action: () => {
                  Alert.alert(
                    t('auth.help_title'),
                    t('auth.help_message'),
                    [
                      { text: t('auth.later'), style: "cancel" },
                      { 
                        text: t('auth.agree'), 
                        onPress: () => {
                          useGameStore.getState().setHasSeenTutorial(false);
                          navigation.navigate("Home");
                        } 
                      }
                    ]
                  );
                }
              },
              { 
                title: t('profile.language'), 
                icon: "translate", 
                action: () => setShowLanguageModal(true)
              },
              { 
                title: t('profile.privacy_policy'), 
                icon: "shield-lock-outline",
                action: () => setShowPrivacy(true)
              },
            ].map((item, i) => (
              <TouchableOpacity 
                key={i} 
                style={st.settingItem}
                onPress={item.action}
              >
                <MaterialCommunityIcons name={item.icon as any} size={22} color={item.color || "#374151"} />
                <Text style={[st.settingTxt, item.color && { color: item.color }]}>{item.title}</Text>
                <MaterialCommunityIcons name="chevron-right" size={20} color="#d1d5db" />
              </TouchableOpacity>
            ))}
          </View>
        </View>
        {/* Edit Modal */}
        <Modal visible={isEditing} transparent animationType="slide">
          <View style={st.modalOverlay}>
            <View style={st.modalContent}>
              <View style={st.modalHeader}>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
                <Text style={st.modalTitle}>{t('profile.edit_profile')}</Text>
                <TouchableOpacity onPress={handleSaveProfile}>
                  <Text style={st.saveTxt}>{t('common.save')}</Text>
                </TouchableOpacity>
              </View>
              
              <ScrollView style={st.modalBody}>
                <View style={st.inputGroup}>
                  <Text style={st.inputLabel}>{t('auth.fullname')}</Text>
                  <TextInput 
                    style={st.input} 
                    value={editData.fullName} 
                    onChangeText={t => setEditData(prev => ({ ...prev, fullName: t }))}
                  />
                </View>
                <View style={st.inputGroup}>
                  <Text style={st.inputLabel}>{t('profile.bio_placeholder')}</Text>
                  <TextInput 
                    style={[st.input, { height: 100, textAlignVertical: 'top' }]} 
                    multiline 
                    value={editData.bio} 
                    onChangeText={t => setEditData(prev => ({ ...prev, bio: t }))}
                    placeholder={t('profile.bio_placeholder')}
                  />
                </View>
                <View style={st.inputGroup}>
                  <Text style={st.inputLabel}>{t('profile.location_placeholder')}</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    <TextInput 
                      style={[st.input, { flex: 1 }]} 
                      value={editData.location} 
                      placeholder={t('profile.location_placeholder')}
                      onChangeText={t => setEditData(prev => ({ ...prev, location: t }))}
                    />
                    <TouchableOpacity onPress={fetchGPS} style={st.gpsBtn} disabled={gpsLoading}>
                      {gpsLoading ? <ActivityIndicator size="small" color="#154212" /> : <MaterialCommunityIcons name="map-marker-radius" size={24} color="#154212" />}
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Language Modal */}
        <Modal visible={showLanguageModal} transparent animationType="fade">
          <View style={st.modalOverlay}>
            <View style={st.modalContent}>
              <Text style={st.modalTitle}>{t('profile.language')}</Text>
              <View style={{ gap: 10, marginTop: 20 }}>
                {[
                  { id: 'vi', name: t('profile.language_vi'), flag: '🇻🇳' },
                  { id: 'en', name: t('profile.language_en'), flag: '🇺🇸' },
                  { id: 'ede', name: t('profile.language_ede'), flag: '🏹' },
                ].map(lang => (
                  <TouchableOpacity 
                    key={lang.id} 
                    style={[st.langItem, currentLanguage === lang.id && st.langItemActive]}
                    onPress={() => {
                      setLanguage(lang.id as any);
                      setShowLanguageModal(false);
                    }}
                  >
                    <Text style={st.langFlag}>{lang.flag}</Text>
                    <Text style={[st.langName, currentLanguage === lang.id && st.langNameActive]}>{lang.name}</Text>
                    {currentLanguage === lang.id && <MaterialCommunityIcons name="check" size={20} color="#154212" />}
                  </TouchableOpacity>
                ))}
              </View>
              <TouchableOpacity style={st.modalClose} onPress={() => setShowLanguageModal(false)}>
                <Text style={st.closeTxt}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        {/* Privacy Modal */}
        <Modal visible={showPrivacy} transparent animationType="slide">
          <View style={st.modalOverlay}>
            <View style={[st.modalContent, { height: '80%' }]}>
              <View style={st.modalHeader}>
                <Text style={st.modalTitle}>{t('profile.privacy_policy')}</Text>
                <TouchableOpacity onPress={() => setShowPrivacy(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              <ScrollView style={{ padding: 20 }}>
                <Text style={st.privacyText}>{t('profile.privacy_brief')}</Text>
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* QR Modal */}
        {selectedQR && (
          <View style={st.qrModal}>
            <View style={st.qrBox}>
              <Text style={st.qrTitle}>{t('qr.my_reward')}</Text>
              <QRCode value={selectedQR} size={200} />
              <Text style={st.qrRaw}>{selectedQR}</Text>
              <TouchableOpacity style={st.qrClose} onPress={() => setSelectedQR(null)}>
                <Text style={st.qrCloseTxt}>{t('common.close')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Privacy Policy Modal */}
        <Modal visible={showPrivacy} transparent animationType="fade">
          <View style={st.modalOverlay}>
            <View style={[st.modalContent, { height: '80%' }]}>
              <View style={st.modalHeader}>
                <Text style={st.modalTitle}>{t('profile.privacy_policy')}</Text>
                <TouchableOpacity onPress={() => setShowPrivacy(false)}>
                  <MaterialCommunityIcons name="close" size={24} color="#374151" />
                </TouchableOpacity>
              </View>
              <ScrollView style={st.modalBody} showsVerticalScrollIndicator={false}>
                <Text style={st.privacyHeading}>{t('profile.privacy_policy_heading_1')}</Text>
                <Text style={st.privacyText}>{t('profile.privacy_policy_body_1')}</Text>
                
                <Text style={st.privacyHeading}>{t('profile.privacy_policy_heading_2')}</Text>
                <Text style={st.privacyText}>{t('profile.privacy_policy_body_2')}</Text>

                <Text style={st.privacyHeading}>{t('profile.privacy_policy_heading_3')}</Text>
                <Text style={st.privacyText}>{t('profile.privacy_policy_body_3')}</Text>

                <View style={{ height: 40 }} />
                <TouchableOpacity style={st.qrClose} onPress={() => setShowPrivacy(false)}>
                  <Text style={st.qrCloseTxt}>{t('common.confirm')}</Text>
                </TouchableOpacity>
                <View style={{ height: 40 }} />
              </ScrollView>
            </View>
          </View>
        </Modal>

        {/* Language Settings */}
        <View style={st.section}>
          <Text style={st.sectionTitle}>{t('profile.language')}</Text>
          <View style={st.langGrid}>
            {[
              { id: 'vi', label: t('profile.language_vi'), flag: '🇻🇳' },
              { id: 'en', label: t('profile.language_en'), flag: '🇺🇸' },
              { id: 'ede', label: t('profile.language_ede'), flag: '📜' },
            ].map(lang => (
              <TouchableOpacity 
                key={lang.id}
                style={[st.langBtn, language === lang.id && st.langBtnActive]}
                onPress={() => setLanguage(lang.id as any)}
              >
                <Text style={st.langFlag}>{lang.flag}</Text>
                <Text style={[st.langLabel, language === lang.id && st.langLabelActive]}>{lang.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={st.section}>
          <TouchableOpacity style={st.logoutBtn} onPress={handleLogout}>
            <MaterialCommunityIcons name="logout" size={20} color="#ef4444" />
            <Text style={st.logoutBtnTxt}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        </View>

      </ScrollView>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },

  headerContainer: { backgroundColor: '#fff' },
  coverWrap: { height: 160, width: '100%', backgroundColor: '#154212' },
  coverImg: { width: '100%', height: '100%' },
  coverOverlay: { ...StyleSheet.absoluteFillObject },
  coverCameraBtn: { position: 'absolute', top: 40, right: 20, backgroundColor: 'rgba(0,0,0,0.4)', padding: 8, borderRadius: 20 },

  profileInfoWrap: { paddingHorizontal: 20, marginTop: -40 },
  avatarContainer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end' },
  avatarWrap: { width: 90, height: 90, borderRadius: 45, borderWidth: 4, borderColor: '#fff', backgroundColor: '#f3f4f6', position: 'relative' },
  avatarImg: { width: '100%', height: '100%', borderRadius: 45 },
  avatarOverlayLoading: { position: 'absolute', backgroundColor: 'rgba(0,0,0,0.3)', justifyContent: 'center', alignItems: 'center' },
  avatarCameraBtn: { position: 'absolute', bottom: 0, right: 0, backgroundColor: '#154212', padding: 6, borderRadius: 15, borderWidth: 2, borderColor: '#fff' },

  actionBtns: { flexDirection: 'row', gap: 10, marginBottom: 10 },
  editBtn: { borderWidth: 1, borderColor: '#d1d5db', paddingHorizontal: 16, height: 36, borderRadius: 18, justifyContent: 'center' },
  editBtnTxt: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#374151' },
  shareBtn: { width: 36, height: 36, borderRadius: 18, borderWidth: 1, borderColor: '#d1d5db', alignItems: 'center', justifyContent: 'center' },

  nameContainer: { marginTop: 12 },
  name: { fontSize: 22, fontFamily: 'Nunito_800ExtraBold', color: '#111827' },
  username: { fontSize: 14, color: '#6b7280', fontFamily: 'Nunito_600SemiBold' },
  bioText: { marginTop: 12, fontSize: 15, color: '#374151', fontFamily: 'Nunito_600SemiBold', lineHeight: 20 },

  metaRow: { flexDirection: 'row', gap: 16, marginTop: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  metaTxt: { fontSize: 13, color: '#6b7280', fontFamily: 'Nunito_600SemiBold' },

  followRow: { flexDirection: 'row', gap: 20, marginTop: 16, borderTopWidth: 1, borderTopColor: '#f3f4f6', paddingTop: 16 },
  followItem: { fontSize: 14, color: '#6b7280', fontFamily: 'Nunito_600SemiBold' },
  followCount: { color: '#111827', fontFamily: 'Nunito_800ExtraBold' },

  tabsContainer: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: '#f3f4f6', marginTop: 20 },
  tabBtn: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabBtnActive: { borderBottomColor: '#154212' },
  tabLabel: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#9ca3af' },
  tabLabelActive: { color: '#154212' },

  tabContent: { paddingVertical: 24 },
  emptyState: { alignItems: 'center', paddingHorizontal: 40 },
  emptyTitle: { marginTop: 16, fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#374151' },
  emptySub: { marginTop: 8, fontSize: 14, color: '#6b7280', textAlign: 'center', fontFamily: 'Nunito_600SemiBold' },

  rewardCard: { width: 130, backgroundColor: '#f9fafb', borderRadius: 16, padding: 10, borderWidth: 1, borderColor: '#f1f5f9' },
  rewardImg: { width: '100%', height: 80, borderRadius: 10, marginBottom: 8 },
  rewardName: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#1f2937' },
  rewardBadge: { marginTop: 6, backgroundColor: '#fef3c7', paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6, alignSelf: 'flex-start' },
  rewardBadgeTxt: { fontSize: 9, color: '#92400e', fontFamily: 'Nunito_800ExtraBold' },
  noRewards: { marginLeft: 20, color: '#9ca3af', fontFamily: 'Nunito_600SemiBold' },

  badgeGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 15 },
  badgeItem: { width: '30%', alignItems: 'center' },
  badgeIconPlaceholder: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#f3f4f6', alignItems: 'center', justifyContent: 'center', marginBottom: 8 },
  badgeName: { fontSize: 11, fontFamily: 'Nunito_700Bold', color: '#6b7280', textAlign: 'center' },

  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionTitle: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: '#111827', marginBottom: 12 },
  settingsList: { backgroundColor: '#f9fafb', borderRadius: 20, padding: 8 },
  settingItem: { flexDirection: 'row', alignItems: 'center', padding: 12, gap: 12 },
  settingTxt: { flex: 1, fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#374151' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', height: '90%', borderTopLeftRadius: 30, borderTopRightRadius: 30 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f3f4f6' },
  modalTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#111827' },
  saveTxt: { color: '#154212', fontSize: 16, fontFamily: 'Nunito_800ExtraBold' },
  modalBody: { padding: 20 },
  inputGroup: { marginBottom: 20 },
  inputLabel: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#6b7280', marginBottom: 8 },
  input: { backgroundColor: '#f9fafb', borderRadius: 12, padding: 12, fontSize: 16, color: '#111827', borderWidth: 1, borderColor: '#e5e7eb' },

  qrModal: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'center', alignItems: 'center', zIndex: 1000 },
  qrBox: { backgroundColor: '#fff', padding: 30, borderRadius: 30, alignItems: 'center' },
  qrTitle: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', marginBottom: 20 },
  qrRaw: { marginTop: 20, color: '#9ca3af', fontSize: 10 },
  qrClose: { marginTop: 30, backgroundColor: '#154212', paddingHorizontal: 40, paddingVertical: 12, borderRadius: 20 },
  qrCloseTxt: { color: '#fff', fontFamily: 'Nunito_800ExtraBold' },
  gpsBtn: { backgroundColor: '#f1f5f9', width: 48, height: 48, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },

  tasksTabContainer: { paddingHorizontal: 20 },
  recentHeader: { marginBottom: 16 },
  recentTitle: { fontSize: 18, fontFamily: 'Nunito_800ExtraBold', color: '#111827' },
  recentSub: { fontSize: 13, color: '#6b7280', fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  
  submissionList: { gap: 12 },
  submissionCard: { 
    flexDirection: 'row', 
    backgroundColor: '#fff', 
    borderRadius: 16, 
    padding: 12, 
    borderWidth: 1, 
    borderColor: '#f3f4f6',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  subIconBox: { width: 40, alignItems: 'center', justifyContent: 'center' },
  subContent: { flex: 1, marginLeft: 8 },
  subTitle: { fontSize: 15, fontFamily: 'Nunito_700Bold', color: '#111827' },
  subDesc: { fontSize: 13, color: '#6b7280', fontFamily: 'Nunito_600SemiBold', marginTop: 2 },
  subFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8 },
  subDate: { fontSize: 11, color: '#9ca3af', fontFamily: 'Nunito_600SemiBold' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 6 },
  statusBadgeTxt: { fontSize: 10, fontFamily: 'Nunito_800ExtraBold' },
  
  mgmtSection: { paddingHorizontal: 20, marginTop: 24 },
  mgmtGrid: { flexDirection: 'row', gap: 12, marginTop: 12 },
  mgmtCard: { 
    flex: 1, 
    flexDirection: 'row', 
    alignItems: 'center', 
    backgroundColor: '#fff', 
    padding: 12, 
    borderRadius: 16, 
    borderWidth: 1, 
    borderColor: '#f1f5f9',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    gap: 10
  },
  mgmtIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  mgmtText: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#111827' },

  langGrid: { flexDirection: 'row', gap: 10, marginTop: 12 },
  langBtn: { flex: 1, paddingVertical: 12, borderRadius: 16, backgroundColor: '#f9fafb', alignItems: 'center', borderWidth: 1, borderColor: '#f1f5f9' },
  langBtnActive: { backgroundColor: '#154212', borderColor: '#154212' },
  langFlag: { fontSize: 20, marginBottom: 4 },
  langLabel: { fontSize: 12, fontFamily: 'Nunito_700Bold', color: '#6b7280' },
  langLabelActive: { color: '#fff' },

  logoutBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: '#fee2e2', gap: 10 },
  logoutBtnTxt: { fontSize: 15, fontFamily: 'Nunito_800ExtraBold', color: '#ef4444' },

  privacyHeading: { fontSize: 16, fontFamily: 'Nunito_800ExtraBold', color: '#154212', marginTop: 16, marginBottom: 8 },
  privacyText: { fontSize: 14, fontFamily: 'Nunito_600SemiBold', color: '#4b5563', lineHeight: 22 },
});
