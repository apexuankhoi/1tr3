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
  Keyboard
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameStore } from "../store/useGameStore";
import { useNavigation, useRoute } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Location from 'expo-location';

const { width } = Dimensions.get("window");

export default function RegisterInfoScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { updateProfile, fetchUserData, showToast } = useGameStore();
  
  const [fullName, setFullName] = useState("");
  const [dob, setDob] = useState(new Date());
  const [location, setLocation] = useState("");
  const [showPicker, setShowPicker] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetchingGps, setFetchingGps] = useState(false);

  const getCurrentLocation = async () => {
    setFetchingGps(true);
    try {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert("Quyền truy cập", "Vui lòng cấp quyền GPS để lấy vị trí tự động");
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
      console.log(error);
      Alert.alert("Lỗi", "Không thể lấy vị trí hiện tại");
    } finally {
      setFetchingGps(false);
    }
  };

  const handleComplete = async () => {
    if (!fullName || fullName.length < 3) {
      Alert.alert("Lỗi", "Vui lòng nhập đầy đủ họ và tên");
      return;
    }
    if (!location) {
      Alert.alert("Lỗi", "Vui lòng nhập hoặc lấy vị trí của bạn");
      return;
    }

    setLoading(true);
    try {
      await updateProfile({
        fullName,
        dob: dob.toISOString().split('T')[0],
        location: location
      });
      
      showToast("Chào mừng bạn đến với cộng đồng!", 'success');
      await fetchUserData();
    } catch (error: any) {
      Alert.alert("Lỗi", error.message || "Không thể cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const onDateChange = (event: any, selectedDate?: Date) => {
    setShowPicker(false);
    if (selectedDate) setDob(selectedDate);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <LinearGradient colors={["#f8fafc", "#e2e8f0"]} style={st.container}>
          <View style={st.content}>
            
            <Animated.View entering={FadeInDown.delay(200)} style={st.header}>
              <View style={st.iconCircle}>
                <MaterialCommunityIcons name="account-details" size={40} color="#154212" />
              </View>
              <Text style={st.title}>Hoàn thiện hồ sơ</Text>
              <Text style={st.sub}>Chào mừng bạn đến với cộng đồng. Hãy cho chúng tôi biết thêm về bạn!</Text>
            </Animated.View>

            <Animated.View entering={FadeInDown.delay(400)} style={st.formCard}>
              <Text style={st.label}>Họ và Tên</Text>
              <View style={st.inputGroup}>
                <MaterialCommunityIcons name="account-outline" size={22} color="#64748b" style={st.inputIcon} />
                <TextInput
                  style={st.input}
                  placeholder="Nhập tên của bạn..."
                  value={fullName}
                  onChangeText={setFullName}
                />
              </View>

              <Text style={st.label}>Ngày tháng năm sinh</Text>
              <TouchableOpacity style={st.inputGroup} onPress={() => setShowPicker(true)}>
                <MaterialCommunityIcons name="calendar-outline" size={22} color="#64748b" style={st.inputIcon} />
                <Text style={[st.input, { paddingTop: 15 }]}>
                  {dob.toLocaleDateString('vi-VN')}
                </Text>
              </TouchableOpacity>

              <Text style={st.label}>Địa chỉ / Vị trí</Text>
              <View style={st.inputGroup}>
                <MaterialCommunityIcons name="map-marker-outline" size={22} color="#64748b" style={st.inputIcon} />
                <TextInput
                  style={st.input}
                  placeholder="Buôn làng, xã, huyện..."
                  value={location}
                  onChangeText={setLocation}
                />
                <TouchableOpacity onPress={getCurrentLocation} disabled={fetchingGps}>
                  {fetchingGps ? (
                    <ActivityIndicator size="small" color="#154212" />
                  ) : (
                    <MaterialCommunityIcons name="crosshairs-gps" size={22} color="#154212" />
                  )}
                </TouchableOpacity>
              </View>

              {showPicker && (
                <DateTimePicker
                  value={dob}
                  mode="date"
                  display="default"
                  onChange={onDateChange}
                  maximumDate={new Date()}
                />
              )}

              <TouchableOpacity 
                style={[st.completeBtn, loading && { opacity: 0.7 }]} 
                onPress={handleComplete}
                disabled={loading}
              >
                {loading ? (
                  <ActivityIndicator color="#fff" />
                ) : (
                  <>
                    <Text style={st.completeBtnText}>Bắt đầu ngay</Text>
                    <MaterialCommunityIcons name="check-decagram" size={24} color="#fff" />
                  </>
                )}
              </TouchableOpacity>
            </Animated.View>

          </View>
        </LinearGradient>
      </TouchableWithoutFeedback>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  container: { flex: 1 },
  content: { flex: 1, paddingHorizontal: 30, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 30 },
  iconCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 5 },
  title: { fontSize: 26, fontFamily: "Nunito_800ExtraBold", color: "#1e293b", marginTop: 20 },
  sub: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#64748b", textAlign: "center", marginTop: 10, lineHeight: 20 },
  
  formCard: { backgroundColor: "#fff", borderRadius: 28, padding: 25, shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 20, elevation: 10 },
  label: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#475569", marginBottom: 8, marginLeft: 5 },
  inputGroup: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, paddingHorizontal: 15, height: 56, marginBottom: 15, borderWidth: 1, borderColor: "#e2e8f0" },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, fontFamily: "Nunito_600SemiBold", color: "#1e293b" },

  completeBtn: { height: 60, backgroundColor: "#154212", borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, marginTop: 10, shadowColor: "#154212", shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  completeBtnText: { color: "#fff", fontSize: 18, fontFamily: "Nunito_800ExtraBold" }
});
