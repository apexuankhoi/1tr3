import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Dimensions, Image, StyleSheet } from "react-native";
import { useGameStore } from "../store/useGameStore";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown, FadeOutUp, useSharedValue, useAnimatedStyle, withRepeat, withTiming } from "react-native-reanimated";

const { width } = Dimensions.get("window");

function PillInput({ label, icon, value, onChangeText, secureTextEntry, keyboardType, placeholder, ...props }: any) {
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
          {...props}
        />
      </View>
    </View>
  );
}

export default function LoginScreen({ navigation, route }: any) {
  const login = useGameStore((state) => state.login);
  const showToast = useGameStore((state) => state.showToast);
  const t = useGameStore((state) => state.t);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [showError, setShowError] = useState(false);

  React.useEffect(() => {
    if (route.params?.prefilledPhone) {
      setUsername(route.params.prefilledPhone);
    }
  }, [route.params?.prefilledPhone]);

  const handleLogin = async () => {
    if (!username) {
      showToast(t('common.error'));
      return;
    }
    setLoading(true);
    const success = await login({ username: username.trim() });
    setLoading(false);
    if (!success) {
      setShowError(true);
      showToast(t('auth.login') + " " + t('common.error'));
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
            <Text style={st.subtitle}>Mùa Rẫy Không Khói</Text>
          </View>

          <View style={st.form}>
            <PillInput 
              label={t('auth.phone')} 
              icon="phone" 
              placeholder="Nhập số điện thoại (ví dụ: 0912345678)" 
              value={username} 
              onChangeText={(text: string) => { 
                // Chỉ cho phép nhập số
                const cleaned = text.replace(/[^0-9]/g, '');
                setUsername(cleaned); 
                if (showError) setShowError(false); 
              }} 
              keyboardType="phone-pad" 
              maxLength={10}
            />

            {/* Chỉ hiện nút khi nhập đúng định dạng 10 số bắt đầu bằng 0 */}
            {username.length === 10 && /^0[0-9]{9}$/.test(username) && (
              <Animated.View entering={FadeInDown.duration(400)} style={st.loginBtnWrap}>
                <TouchableOpacity onPress={handleLogin} disabled={loading} activeOpacity={0.9}>
                  <LinearGradient colors={["#154212", "#2d5a27"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.loginBtn}>
                    {loading ? <ActivityIndicator color="white" /> : <Text style={st.loginBtnText}>{t('auth.login')}</Text>}
                  </LinearGradient>
                </TouchableOpacity>
              </Animated.View>
            )}

            {username.length > 0 && username.length < 10 && (
              <Text style={st.hintText}>Vui lòng nhập đủ 10 chữ số</Text>
            )}
          </View>

        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function AnimatedPulseText({ text }: { text: string }) {
  const scale = useSharedValue(1);

  React.useEffect(() => {
    scale.value = withRepeat(withTiming(1.08, { duration: 800 }), -1, true);
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({ transform: [{ scale: scale.value }] }));

  return (
    <Animated.Text style={[animatedStyle, st.registerText]}>
      {text}
    </Animated.Text>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fff" },
  scrollContent: { flexGrow: 1, paddingHorizontal: 40 },
  container: { flex: 1, justifyContent: "center", paddingVertical: 40 },
  
  header: { alignItems: "center", marginBottom: 40 },
  logoWrap: { width: 96, height: 96, backgroundColor: "#fff", alignItems: "center", justifyContent: "center", marginBottom: 16, borderRadius: 20, overflow: 'hidden' },
  logo: { width: '100%', height: '100%' },
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
  hintText: { textAlign: "center", color: "#9ca3af", marginTop: 8, fontSize: 12, fontFamily: "Nunito_600SemiBold" },
});
