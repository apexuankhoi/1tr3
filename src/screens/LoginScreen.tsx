import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ImageBackground,
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
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeInUp, useSharedValue, useAnimatedStyle, withSpring, withRepeat, withSequence, withTiming } from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

export default function LoginScreen() {
  const navigation = useNavigation<any>();
  const { login, t } = useGameStore();
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);

  // Captcha State
  const [captchaCode, setCaptchaCode] = useState("");
  const [userCaptcha, setUserCaptcha] = useState("");

  useEffect(() => {
    generateCaptcha();
  }, []);

  const generateCaptcha = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setCaptchaCode(code);
    setUserCaptcha("");
  };

  const handleLogin = async () => {
    if (!phone) {
      Alert.alert(t('common.error'), "Vui lòng nhập số điện thoại");
      return;
    }

    if (userCaptcha !== captchaCode) {
      Alert.alert("Bảo mật", "Mã kiểm tra không đúng. Vui lòng nhập lại!");
      generateCaptcha();
      return;
    }

    setLoading(true);
    try {
      const res = await login(phone);
      if (!res.full_name && !res.fullName) {
        navigation.navigate("RegisterInfo", { phone });
      }
    } catch (error: any) {
      Alert.alert(t('common.error'), error.message || "Đăng nhập thất bại");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={{ flex: 1 }}>
      <ImageBackground
        source={{ uri: "https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800" }}
        style={st.bg}
      >
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
          <LinearGradient colors={["rgba(0,0,0,0.3)", "rgba(21,66,18,0.95)"]} style={st.overlay}>
            <View style={st.container}>
              
              <Animated.View entering={FadeInUp.delay(200)} style={st.logoContainer}>
                <View style={st.logoCircle}>
                  <MaterialCommunityIcons name="leaf" size={50} color="#4ade80" />
                </View>
                <Text style={st.appTitle}>Nông Nghiệp Xanh</Text>
                <Text style={st.appSub}>Hệ sinh thái nông nghiệp bền vững</Text>
              </Animated.View>

              <Animated.View entering={FadeInDown.delay(400)} style={st.formCard}>
                <Text style={st.formTitle}>Chào mừng bạn trở lại</Text>

                <View style={st.inputGroup}>
                  <MaterialCommunityIcons name="phone-outline" size={20} color="#64748b" style={st.inputIcon} />
                  <TextInput
                    style={st.input}
                    placeholder="Số điện thoại"
                    placeholderTextColor="#94a3b8"
                    keyboardType="phone-pad"
                    value={phone}
                    onChangeText={setPhone}
                  />
                </View>

                {/* Captcha Section */}
                <View style={st.captchaContainer}>
                  <View style={st.captchaBox}>
                    <Text style={st.captchaText}>{captchaCode}</Text>
                  </View>
                  <TouchableOpacity onPress={generateCaptcha} style={st.refreshBtn}>
                    <MaterialCommunityIcons name="refresh" size={24} color="#154212" />
                  </TouchableOpacity>
                  <TextInput
                    style={st.captchaInput}
                    placeholder="Nhập 4 số"
                    placeholderTextColor="#94a3b8"
                    keyboardType="number-pad"
                    maxLength={4}
                    value={userCaptcha}
                    onChangeText={setUserCaptcha}
                  />
                </View>
                <Text style={st.captchaLabel}>Xác minh bạn không phải robot</Text>

                <TouchableOpacity
                  style={[st.loginBtn, loading && { opacity: 0.7 }]}
                  onPress={handleLogin}
                  disabled={loading}
                >
                  {loading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <>
                      <Text style={st.loginBtnText}>Đăng Nhập</Text>
                      <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                    </>
                  )}
                </TouchableOpacity>

                {/* <View style={st.footer}>
                  <Text style={st.footerText}>Chưa có tài khoản?</Text>
                  <TouchableOpacity onPress={() => navigation.navigate("Register")}>
                    <Text style={st.registerLink}> Đăng ký ngay</Text>
                  </TouchableOpacity>
                </View> */}
              </Animated.View>

            </View>
          </LinearGradient>
        </TouchableWithoutFeedback>
      </ImageBackground>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  bg: { width, height },
  overlay: { flex: 1, justifyContent: "center" },
  container: { paddingHorizontal: 30 },

  logoContainer: { alignItems: "center", marginBottom: 40 },
  logoCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: "rgba(255,255,255,0.15)", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "rgba(255,255,255,0.3)" },
  appTitle: { fontSize: 32, fontFamily: "Nunito_800ExtraBold", color: "#fff", marginTop: 15 },
  appSub: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#bcf0ae", marginTop: 5 },

  formCard: { backgroundColor: "#fff", borderRadius: 32, padding: 30, shadowColor: "#000", shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 },
  formTitle: { fontSize: 20, fontFamily: "Nunito_800ExtraBold", color: "#1e293b", marginBottom: 25, textAlign: "center" },

  inputGroup: { flexDirection: "row", alignItems: "center", backgroundColor: "#f8fafc", borderRadius: 16, paddingHorizontal: 15, height: 56, marginBottom: 15, borderWidth: 1, borderColor: "#e2e8f0" },
  inputIcon: { marginRight: 12 },
  input: { flex: 1, fontSize: 16, fontFamily: "Nunito_600SemiBold", color: "#1e293b" },

  captchaContainer: { flexDirection: "row", alignItems: "center", gap: 10, marginTop: 10 },
  captchaBox: { backgroundColor: "#154212", paddingHorizontal: 15, paddingVertical: 10, borderRadius: 12, width: 80, alignItems: "center" },
  captchaText: { color: "#fff", fontSize: 20, fontFamily: "Nunito_800ExtraBold", letterSpacing: 2 },
  refreshBtn: { padding: 5 },
  captchaInput: { flex: 1, backgroundColor: "#f1f5f9", height: 48, borderRadius: 12, paddingHorizontal: 15, fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#154212", textAlign: "center" },
  captchaLabel: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#64748b", marginTop: 8, marginBottom: 20, textAlign: "center" },

  loginBtn: { height: 60, backgroundColor: "#154212", borderRadius: 18, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, shadowColor: "#154212", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 5 }, elevation: 5 },
  loginBtnText: { color: "#fff", fontSize: 18, fontFamily: "Nunito_800ExtraBold" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 25 },
  footerText: { color: "#64748b", fontFamily: "Nunito_600SemiBold" },
  registerLink: { color: "#154212", fontFamily: "Nunito_800ExtraBold" }
});
