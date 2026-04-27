import React, { useState } from "react";
import { View, Text, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Modal, StyleSheet } from "react-native";
import DateTimePicker from '@react-native-community/datetimepicker';
import { LinearGradient } from "expo-linear-gradient";
import * as ImagePicker from "expo-image-picker";
import { useGameStore } from "../store/useGameStore";
import { userService, uploadImage } from "../services/api";
import { MaterialCommunityIcons } from "@expo/vector-icons";

function StaticInput({ label, icon, value, onChangeText, secureTextEntry, keyboardType, placeholder, editable = true, onPress }: any) {
  return (
    <View style={st.inputBox}>
      <Text style={st.inputLabel}>{label}</Text>
      <TouchableOpacity 
        activeOpacity={editable ? 1 : 0.7} 
        onPress={onPress}
        style={[st.inputWrapper, !editable && st.inputDisabled]}
      >
        <MaterialCommunityIcons name={icon} size={20} color="#4b5563" />
        <TextInput
          style={st.input}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType || "default"}
          autoCapitalize="none"
          placeholder={placeholder}
          placeholderTextColor="#9ca3af"
          editable={editable}
          pointerEvents={editable ? "auto" : "none"}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function RegisterScreen({ navigation }: any) {
  const showToast = useGameStore((state) => state.showToast);
  const t = useGameStore((state) => state.t);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [villageName, setVillageName] = useState(() => useGameStore.getState().t("auth.default_village_name"));
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
      const formattedDate = `${selectedDate.getDate().toString().padStart(2, '0')}/${(selectedDate.getMonth() + 1).toString().padStart(2, '0')}/${selectedDate.getFullYear()}`;
      setDob(formattedDate);
    }
  };

  const renderDatePicker = () => {
    if (!showDatePicker) return null;
    if (Platform.OS === 'ios') {
      return (
        <Modal transparent animationType="fade" visible={showDatePicker} onRequestClose={() => setShowDatePicker(false)}>
          <View style={st.dateOverlay}>
            <View style={st.dateContent}>
              <View style={st.dateHeader}>
                <Text style={st.dateTitle}>{t('auth.dob_label')}</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={st.dateDoneBtn}>{t('common.close')}</Text>
                </TouchableOpacity>
              </View>
              <DateTimePicker value={date} mode="date" display="spinner" onChange={handleDateChange} maximumDate={new Date()} textColor="black" />
            </View>
          </View>
        </Modal>
      );
    }
    return <DateTimePicker value={date} mode="date" display="default" onChange={handleDateChange} maximumDate={new Date()} />;
  };

  const handleRegister = async () => {
    if (!fullName || !phone || !password || !email || !dob) return showToast(t('common.error'));
    if (!agreed) return setShowTermsModal(true), showToast(t('auth.must_agree_terms'));
    if (password.length < 6) return showToast(t('auth.password_min_length'));
    
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    if (today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())) age--;
    if (age < 10) return showToast(t('auth.min_age_error'));
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast(t('auth.invalid_email'));
    
    setLoading(true);
    try {
      await userService.register({ 
        username: phone.trim(), 
        password, 
        fullName, 
        email: email.trim(), 
        dob: dob.trim(), 
        villageName: villageName.trim(),
        role: "farmer",
      });
      showToast(t('common.success'), 'success');
      setTimeout(() => navigation.navigate("Login", { prefilledPhone: phone.trim() }), 1500);
    } catch (error: any) {
      showToast(error.response?.data?.message || t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  const handleScroll = (e: any) => {
    const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
    if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) setHasScrolledToBottom(true);
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={st.root}>
      
      {/* Terms Modal */}
      <Modal visible={showTermsModal} animationType="slide" transparent onRequestClose={() => setShowTermsModal(false)}>
        <View style={st.modalOverlay}>
          <View style={st.modalContent}>
            <View style={st.modalHeader}>
              <Text style={st.modalTitle}>{t('auth.terms_privacy_modal_title')}</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView onScroll={handleScroll} scrollEventThrottle={16} style={{ flex: 1 }} showsVerticalScrollIndicator>
              <Text style={st.termsText}>
                {t('auth.terms_content')}
              </Text>
            </ScrollView>

            <TouchableOpacity 
              disabled={!hasScrolledToBottom}
              onPress={() => { setAgreed(true); setShowTermsModal(false); }}
              style={[st.agreeBtn, hasScrolledToBottom ? st.agreeBtnActive : st.agreeBtnDisabled]}
            >
              <Text style={[st.agreeBtnText, hasScrolledToBottom ? st.agreeBtnTextActive : st.agreeBtnTextDisabled]}>
                {hasScrolledToBottom ? t('auth.read_and_agree') : t('auth.scroll_to_bottom')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Decorative bg blobs */}
      <View pointerEvents="none" style={st.blob1} />
      <View pointerEvents="none" style={st.blob2} />

      <ScrollView contentContainerStyle={st.scrollContent} showsVerticalScrollIndicator={false}>
        
        <View style={st.header}>
          <View style={st.headerTop}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
              <MaterialCommunityIcons name="arrow-left" size={26} color="#154212" />
            </TouchableOpacity>
            <Text style={st.headerTitle}>{t('auth.register')}</Text>
          </View>
          <View>
            <Text style={st.welcome}>{t('home.welcome')}</Text>
            <Text style={st.subtitle}>{t('auth.register')}</Text>
          </View>
        </View>

        <View style={st.form}>
          <StaticInput label={t('auth.fullname')} icon="account-outline" value={fullName} onChangeText={setFullName} placeholder={t('auth.full_name_sample')} />
          <StaticInput label={t('auth.dob_label')} icon="calendar-month-outline" value={dob} editable={false} onPress={() => setShowDatePicker(true)} placeholder={t('auth.dob_placeholder')} />
          {renderDatePicker()}
          <StaticInput label={t('auth.email')} icon="email-outline" value={email} onChangeText={setEmail} placeholder={t('auth.email_placeholder')} keyboardType="email-address" />
          <StaticInput label={t('ranking.tab_village')} icon="home-group" value={villageName} onChangeText={setVillageName} placeholder={t('auth.village_placeholder')} />
          <StaticInput label={t('auth.phone')} icon="phone-outline" value={phone} onChangeText={setPhone} placeholder={t('auth.phone_placeholder')} keyboardType="phone-pad" />
          <StaticInput label={t('auth.password')} icon="lock-outline" value={password} onChangeText={setPassword} secureTextEntry placeholder={t('auth.password_placeholder')} />

          <TouchableOpacity onPress={() => setShowTermsModal(true)} activeOpacity={0.7} style={st.agreeWrap}>
            <MaterialCommunityIcons name={agreed ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={agreed ? "#154212" : "#9ca3af"} />
            <Text style={st.agreeText}>
              {t('auth.terms_and_privacy')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            <LinearGradient colors={["#154212", "#2d5a27"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.regBtn}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={st.regBtnText}>{t('auth.register')}</Text>}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        <View style={st.dividerWrap}>
          <View style={st.dividerLine} />
          <Text style={st.dividerText}>{t('auth.or')}</Text>
          <View style={st.dividerLine} />
        </View>

        <View style={st.socialWrap}>
          <TouchableOpacity style={st.socialBtn}>
            <MaterialCommunityIcons name="google" size={24} color="#ea4335" />
            <Text style={st.socialText}>{t('auth.continue_google')}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.socialBtn}>
            <MaterialCommunityIcons name="facebook" size={24} color="#1877f2" />
            <Text style={st.socialText}>{t('auth.continue_facebook')}</Text>
          </TouchableOpacity>
        </View>

        <View style={st.footer}>
          <Text style={st.footerText}>{t('auth.has_account')} </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={st.footerLink}>{t('auth.login')}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#fbfbf9" },
  blob1: { position: 'absolute', top: -100, left: -50, width: 280, height: 280, borderRadius: 140, backgroundColor: 'rgba(21, 66, 18, 0.04)' },
  blob2: { position: 'absolute', bottom: -50, right: -100, width: 300, height: 300, borderRadius: 150, backgroundColor: 'rgba(45, 90, 39, 0.04)' },
  
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, height: '85%', shadowColor: "#000", shadowOffset: { width: 0, height: -4 }, shadowOpacity: 0.1, shadowRadius: 10, elevation: 20 },
  modalHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 16, borderBottomWidth: 1, borderBottomColor: "#f3f4f6", paddingBottom: 16 },
  modalTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 20, color: "#154212" },
  termsText: { fontFamily: "Nunito_600SemiBold", color: "#4b5563", lineHeight: 24, paddingBottom: 40 },
  agreeBtn: { marginTop: 24, height: 56, borderRadius: 28, alignItems: "center", justifyContent: "center" },
  agreeBtnActive: { backgroundColor: "#154212" },
  agreeBtnDisabled: { backgroundColor: "#e5e7eb" },
  agreeBtnText: { fontFamily: "Nunito_800ExtraBold", fontSize: 16 },
  agreeBtnTextActive: { color: "#fff" },
  agreeBtnTextDisabled: { color: "#9ca3af" },

  dateOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  dateContent: { backgroundColor: 'white', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20 },
  dateHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 16 },
  dateTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 18, color: "#154212" },
  dateDoneBtn: { fontFamily: "Nunito_800ExtraBold", fontSize: 16, color: "#154212" },

  scrollContent: { flexGrow: 1, backgroundColor: "#f8f9f5" },
  
  header: { backgroundColor: "#fff", paddingTop: 56, paddingBottom: 40, paddingHorizontal: 40, borderBottomLeftRadius: 45, borderBottomRightRadius: 45, shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 4, marginBottom: 40, borderBottomWidth: 1, borderBottomColor: "#f3f4f6" },
  headerTop: { flexDirection: "row", alignItems: "center", marginBottom: 40 },
  backBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center", marginRight: 16 },
  headerTitle: { fontFamily: "Nunito_800ExtraBold", fontSize: 20, color: "#154212" },
  welcome: { fontFamily: "Nunito_800ExtraBold", fontSize: 36, color: "#154212", marginBottom: 8 },
  subtitle: { fontFamily: "Nunito_600SemiBold", color: "#6b7280", fontSize: 16, lineHeight: 24 },

  form: { paddingHorizontal: 40, paddingBottom: 40 },
  avatarPicker: { alignSelf: 'center', marginBottom: 32, width: 100, height: 100, borderRadius: 50, backgroundColor: '#f3f4f6', borderWidth: 2, borderColor: '#e5e7eb', borderStyle: 'dashed', overflow: 'hidden', justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: '100%', height: '100%' },
  avatarPlaceholder: { alignItems: 'center' },
  avatarLabel: { fontSize: 10, fontFamily: 'Nunito_700Bold', color: '#154212', marginTop: 4 },
  inputBox: { marginBottom: 24 },
  inputLabel: { fontFamily: "Nunito_800ExtraBold", color: "#374151", marginBottom: 12, marginLeft: 4 },
  inputWrapper: { backgroundColor: "#f3f4f6", borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 28, height: 56, flexDirection: "row", alignItems: "center", paddingHorizontal: 20 },
  inputDisabled: { backgroundColor: "#f9fafb" },
  input: { flex: 1, marginLeft: 12, fontFamily: "Nunito_600SemiBold", fontSize: 16, color: "#111827" },

  agreeWrap: { flexDirection: "row", alignItems: "center", marginBottom: 40, marginLeft: 4 },
  agreeText: { marginLeft: 12, fontFamily: "Nunito_600SemiBold", color: "#4b5563", fontSize: 13, flex: 1 },
  agreeHighlight: { color: "#154212", fontFamily: "Nunito_800ExtraBold" },

  regBtn: { height: 60, borderRadius: 30, alignItems: "center", justifyContent: "center", shadowColor: "#154212", shadowOpacity: 0.3, shadowRadius: 10, shadowOffset: { width: 0, height: 4 }, elevation: 6 },
  regBtnText: { color: "#fff", fontFamily: "Nunito_800ExtraBold", fontSize: 18 },

  dividerWrap: { flexDirection: "row", alignItems: "center", marginBottom: 32, paddingHorizontal: 40 },
  dividerLine: { flex: 1, height: 1, backgroundColor: "#e5e7eb" },
  dividerText: { marginHorizontal: 16, fontFamily: "Nunito_600SemiBold", color: "#9ca3af" },

  socialWrap: { gap: 16, paddingHorizontal: 40 },
  socialBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", height: 56, borderRadius: 28, borderWidth: 1, borderColor: "#e5e7eb", backgroundColor: "#fff" },
  socialText: { marginLeft: 12, fontFamily: "Nunito_700Bold", color: "#374151" },

  footer: { flexDirection: "row", justifyContent: "center", marginTop: 48, marginBottom: 40, paddingHorizontal: 40, alignItems: "center" },
  footerText: { fontFamily: "Nunito_600SemiBold", color: "#6b7280" },
  footerLink: { fontFamily: "Nunito_800ExtraBold", color: "#154212", textDecorationLine: "underline" },
});
