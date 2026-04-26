import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Image, StyleSheet } from "react-native";
import { useGameStore } from "../store/useGameStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeOutUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";

const { width } = Dimensions.get("window");

function PillInput({ label, icon, value, onChangeText, secureTextEntry, keyboardType, placeholder }: any) {
  return (
    <View style={st.inputBox}>
      <Text style={st.inputLabel}>{label}</Text>
      <View style={st.inputWrapper}>
        <MaterialCommunityIcons name={icon} size={20} color="#4b5563" />
        <TextInput
          style={st.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || "default"}
          autoCapitalize="none"
          placeholder={placeholder}
          placeholderTextColor="#6b7280"
        />
      </View>
    </View>
  );
}

export default function LoginScreen({ navigation }: any) {
  const login = useGameStore((state) => state.login);
  const showToast = useGameStore((state) => state.showToast);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) {
      showToast("Vui lòng nhập đầy đủ thông tin");
      return;
    }
    setLoading(true);
    const success = await login({ username: username.trim(), password });
    setLoading(false);
    if (!success) {
      setShowError(true);
      showToast("Sai số điện thoại hoặc mật khẩu");
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={st.root}>
      <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={st.container}>
          
          <View style={st.header}>
            <View style={st.logoWrap}>
              <Image source={require("../../assets/logo.png")} style={st.logo} resizeMode="contain" />
            </View>
            <Text style={st.subtitle}>Chào mừng bạn trở lại</Text>
          </View>

          <View style={st.form}>
            <PillInput label="Số điện thoại" icon="phone" placeholder="Nhập số điện thoại của bạn" value={username} onChangeText={(text: string) => { setUsername(text); if (showError) setShowError(false); }} keyboardType="phone-pad" />

            {username.length > 0 && (
              <Animated.View entering={FadeInDown.duration(400)} exiting={FadeOutUp}>
                <PillInput label="Mật khẩu" icon="lock-outline" placeholder="Nhập mật khẩu" value={password} onChangeText={(text: string) => { setPassword(text); if (showError) setShowError(false); }} secureTextEntry />
                
                <View style={st.optionsRow}>
                  <TouchableOpacity onPress={() => setRememberMe(!rememberMe)} style={st.rememberWrap}>
                    <MaterialCommunityIcons name={rememberMe ? "checkbox-marked" : "checkbox-blank-outline"} size={22} color={rememberMe ? "#154212" : "#9ca3af"} />
                    <Text style={st.rememberText}>Ghi nhớ tôi</Text>
                  </TouchableOpacity>
                  {showError && (
                    <TouchableOpacity>
                      <Text style={st.forgotText}>Quên mật khẩu?</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </Animated.View>
            )}

            <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.9} style={st.loginBtnWrap}>
              <LinearGradient colors={["#154212", "#2d5a27"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.loginBtn}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={st.loginBtnText}>Đăng Nhập</Text>}
              </LinearGradient>
            </TouchableOpacity>
          </View>

          <View style={st.dividerWrap}>
            <View style={st.dividerLine} />
            <Text style={st.dividerText}>Hoặc</Text>
            <View style={st.dividerLine} />
          </View>

          <View style={st.socialWrap}>
            <TouchableOpacity style={st.socialBtn}>
              <MaterialCommunityIcons name="google" size={24} color="#ea4335" />
              <Text style={st.socialText}>Đăng nhập bằng Google</Text>
            </TouchableOpacity>
            <TouchableOpacity style={st.socialBtn}>
              <MaterialCommunityIcons name="facebook" size={24} color="#1877f2" />
              <Text style={st.socialText}>Đăng nhập bằng Facebook</Text>
            </TouchableOpacity>
          </View>

          <View style={st.footer}>
            <Text style={st.footerText}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <AnimatedPulseText />
            </TouchableOpacity>
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AnimatedPulseText() {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.08, { duration: 800 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.Text style={[animatedStyle, st.registerText]}>
      Đăng ký ngay
    </Animated.Text>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 40 },
  container: { flex: 1, justifyContent: "center", paddingVertical: 40 },
  
  header: { alignItems: "center", marginBottom: 40 },
  logoWrap: { width: 96, height: 96, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 16 },
  logo: { width: "200%", height: "200%" },
  subtitle: { fontFamily: "Nunito_600SemiBold", color: "#6b7280" },

  form: { marginTop: 16 },
  inputBox: { marginBottom: 24 },
  inputLabel: { fontFamily: "Nunito_800ExtraBold", color: "#374151", marginBottom: 12, marginLeft: 4 },
  inputWrapper: { backgroundColor: "#e5e7eb", borderWidth: 1, borderColor: "#d1d5db", borderRadius: 28, height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 24 },
  input: { flex: 1, marginLeft: 12, fontFamily: "Nunito_600SemiBold", fontSize: 16, color: "#111827" },

  optionsRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 32, marginTop: -10 },
  rememberWrap: { flexDirection: "row", alignItems: "center", marginLeft: 8 },
  rememberText: { marginLeft: 8, fontFamily: "Nunito_600SemiBold", color: "#6b7280", fontSize: 14 },
  forgotText: { color: "#154212", fontFamily: "Nunito_800ExtraBold", fontSize: 14, marginRight: 8 },

  loginBtnWrap: { marginTop: 8 },
  loginBtn: { height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  loginBtnText: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 18 },

  dividerWrap: { flexDirection: "row", alignItems: "center", marginVertical: 40 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: { marginHorizontal: 16, fontFamily: "Nunito_600SemiBold", color: "#9ca3af" },

  socialWrap: { gap: 16 },
  socialBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 56, borderRadius: 28, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff" },
  socialText: { marginLeft: 12, fontFamily: "Nunito_700Bold", color: "#374151" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 48, marginBottom: 24, alignItems: "center" },
  footerText: { fontFamily: "Nunito_600SemiBold", color: "#6b7280" },
  registerText: { fontFamily: "Nunito_800ExtraBold", color: "#154212", fontSize: 18, textDecorationLine: "underline", marginLeft: 4 },
});
