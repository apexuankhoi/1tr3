import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
  TouchableWithoutFeedback,
  Keyboard,
  Modal
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameStore } from "../store/useGameStore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, SlideInDown, FadeOut } from "react-native-reanimated";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';

const { width, height } = Dimensions.get("window");

export default function RegisterInfoScreen() {
  const navigation = useNavigation<any>();
  const userId = useGameStore((s) => s.userId);
  const { updateProfile, fetchUserData, showToast, t } = useGameStore();
  
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState(new Date(2000, 0, 1));
  const [tempDate, setTempDate] = useState(new Date(2000, 0, 1));
  const [location, setLocation] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);

  const getCurrentLocation = async () => {
    setFetchingGps(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('auth.security_title'), t('auth.gps_permission_required'));
        return;
      }

      let loc = await Location.getCurrentPositionAsync({});
      let reverse = await Location.reverseGeocodeAsync({
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude
      });

      if (reverse.length > 0) {
        const addr = reverse[0];
        const formatted = `${addr.streetNumber ? addr.streetNumber + ' ' : ''}${addr.street || ''}, ${addr.subregion || addr.district || ''}, ${addr.region || ''}`;
        setLocation(formatted.replace(/^, /, ''));
      } else {
        setLocation(`${loc.coords.latitude.toFixed(4)}, ${loc.coords.longitude.toFixed(4)}`);
      }
    } catch (error) {
      Alert.alert(t('common.error'), t('auth.current_location_failed'));
    } finally {
      setFetchingGps(false);
    }
  };

  const handleComplete = async () => {
    if (!fullName || fullName.length < 3) {
      Alert.alert(t('common.error'), t('auth.full_name_required'));
      return;
    }
    if (!location) {
      Alert.alert(t('common.error'), t('auth.location_required'));
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        fullName,
        dob: dob.toISOString().split('T')[0],
        location: location
      });
      
      showToast(t('auth.welcome_community'), 'success');
      if (userId) await fetchUserData(userId);
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || t('auth.update_profile_failed'));
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
      if (event.type === 'set' && selectedDate) {
        setDob(selectedDate);
      }
    } else {
      if (selectedDate) setTempDate(selectedDate);
    }
  };

  const confirmDate = () => {
    setDob(tempDate);
    setShowPicker(false);
  };

  const handleOpenPicker = () => {
    if (Platform.OS === 'ios') {
      setTempDate(dob);
      setShowPicker(true);
    } else {
      setShowPicker(true);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={["#f8fafc", "#f1f5f9"]} style={st.container}>
          <View style={st.content}>
            
            <Animated.View entering={FadeInDown.delay(200)} style={st.header}>
              <View style={st.iconCircle}>
                <LinearGradient colors={['#154212', '#2a5c24']} style={st.iconGrad}>
                  <MaterialCommunityIcons name="account-details" size={40} color="#fff" />
                </LinearGradient>
              </View>
              <Text style={st.title}>{t('auth.complete_profile_title')}</Text>
              <Text style={st.sub}>{t('auth.complete_profile_subtitle')}</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} style={st.formCard}>
              <View style={st.inputWrapper}>
                <Text style={st.label}>{t('auth.fullname')}</Text>
                <View style={st.inputGroup}>
                  <MaterialCommunityIcons name="account-outline" size={22} color="#64748b" style={st.inputIcon} />
                  <TextInput
                    style={st.input}
                    placeholder={t('auth.full_name_placeholder')}
                    placeholderTextColor="#94a3b8"
                    value={fullName}
                    onChangeText={setFullName}
                  />
                </View>
              </View>

              <View style={st.inputWrapper}>
                <Text style={st.label}>{t('auth.dob_label')}</Text>
                <TouchableOpacity style={st.inputGroup} onPress={handleOpenPicker}>
                  <MaterialCommunityIcons name="calendar-month-outline" size={22} color="#64748b" style={st.inputIcon} />
                  <Text style={[st.input, { lineHeight: 56 }]}>
                    {dob.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                  </Text>
                  <MaterialCommunityIcons name="chevron-down" size={20} color="#94a3b8" />
                </TouchableOpacity>
              </View>

              <View style={st.inputWrapper}>
                <Text style={st.label}>{t('auth.location_label')}</Text>
                <View style={st.inputGroup}>
                  <MaterialCommunityIcons name="map-marker-outline" size={22} color="#64748b" style={st.inputIcon} />
                  <TextInput
                    style={st.input}
                    placeholder={t('auth.location_placeholder')}
                    placeholderTextColor="#94a3b8"
                    value={location}
                    onChangeText={setLocation}
                  />
                  <TouchableOpacity onPress={getCurrentLocation} disabled={fetchingGps} style={st.gpsBtn}>
                    {fetchingGps ? (
                      <ActivityIndicator size="small" color="#154212" />
                    ) : (
                      <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#154212" />
                    )}
                  </TouchableOpacity>
                </View>
              </View>

              <TouchableOpacity 
                style={[st.completeBtn, loading && { opacity: 0.7 }]} 
                onPress={handleComplete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={st.completeBtnText}>{t('common.start')}</Text>
                    <MaterialCommunityIcons name="arrow-right-circle" size={24} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>

      {/* Android Native Picker */}
      {Platform.OS === 'android' && showPicker && (
        <DateTimePicker
          value={dob}
          mode="date"
          display="default"
          onChange={onDateChange}
          maximumDate={new Date()}
        />
      )}

      {/* iOS Premium Modal */}
      <Modal visible={Platform.OS === 'ios' && showPicker} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setShowPicker(false)}>
          <View style={st.modalOverlay}>
            <Animated.View entering={SlideInDown} exiting={FadeOut} style={st.modalContent}>
              <View style={st.modalHeader}>
                <Text style={st.modalTitle}>{t('auth.pick_birth_date')}</Text>
                <TouchableOpacity onPress={confirmDate} style={st.confirmBtn}>
                  <Text style={st.confirmBtnText}>{t('common.done')}</Text>
                </TouchableOpacity>
              </View>
              <View style={st.pickerContainer}>
                <DateTimePicker
                  value={tempDate}
                  mode="date"
                  display="spinner"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                  locale="vi-VN"
                  style={{ height: 250, width: width }}
                  textColor="#000"
                />
              </View>
            </Animated.View>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 25, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 35 },
  iconCircle: { width: 90, height: 90, borderRadius: 45, backgroundColor: "#fff", padding: 5, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 15, elevation: 8 },
  iconGrad: { flex: 1, borderRadius: 40, alignItems: "center", justifyContent: "center" },
  title: { fontSize: 28, fontFamily: "Nunito_800ExtraBold", color: "#0f172a", marginTop: 20 },
  sub: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#64748b", textAlign: "center", marginTop: 10, lineHeight: 22, paddingHorizontal: 20 },
  
  formCard: { backgroundColor: "#fff", borderRadius: 32, padding: 24, shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 30, elevation: 12 },
  inputWrapper: { marginBottom: 18 },
  label: { fontSize: 13, fontFamily: "Nunito_700Bold", color: "#64748b", marginBottom: 8, marginLeft: 4, textTransform: 'uppercase', letterSpacing: 0.5 },
  inputGroup: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, paddingHorizontal: 16, height: 56, borderWidth: 1, borderColor: "#e2e8f0" },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, fontFamily: "Nunito_600SemiBold", color: "#1e293b" },
  gpsBtn: { padding: 4 },

  completeBtn: { height: 60, backgroundColor: "#154212", borderRadius: 20, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10, shadowColor: "#154212", shadowOpacity: 0.4, shadowRadius: 12, elevation: 8 },
  completeBtnText: { color: "#fff", fontSize: 18, fontFamily: "Nunito_800ExtraBold" },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: '#fff', borderTopLeftRadius: 30, borderTopRightRadius: 30, paddingBottom: Platform.OS === 'ios' ? 40 : 20, shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 20 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 20, borderBottomWidth: 1, borderBottomColor: '#f1f5f9' },
  modalTitle: { fontSize: 18, fontFamily: 'Nunito_700Bold', color: '#1e293b' },
  confirmBtn: { backgroundColor: '#154212', paddingHorizontal: 20, paddingVertical: 8, borderRadius: 12 },
  confirmBtnText: { color: '#fff', fontFamily: 'Nunito_700Bold' },
  pickerContainer: { padding: 10, alignItems: 'center' }
});
