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
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [date, setDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [password, setPassword] = useState("");
  const [agreed, setAgreed] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [hasScrolledToBottom, setHasScrolledToBottom] = useState(false);
  const [loading, setLoading] = useState(false);
  const [avatar, setAvatar] = useState<string | null>(null);

  const pickAvatar = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') return showToast("Cần quyền truy cập thư viện ảnh");
    
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.6,
    });

    if (!result.canceled) setAvatar(result.assets[0].uri);
  };

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
                <Text style={st.dateTitle}>Chọn ngày sinh</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Text style={st.dateDoneBtn}>Xong</Text>
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
    if (!fullName || !phone || !password || !email || !dob) return showToast("Vui lòng điền đầy đủ thông tin");
    if (!agreed) return setShowTermsModal(true), showToast("Bạn cần đọc và đồng ý với điều khoản");
    if (password.length < 6) return showToast("Mật khẩu phải có ít nhất 6 ký tự");
    
    const today = new Date();
    let age = today.getFullYear() - date.getFullYear();
    if (today.getMonth() < date.getMonth() || (today.getMonth() === date.getMonth() && today.getDate() < date.getDate())) age--;
    if (age < 10) return showToast("Bạn phải từ 10 tuổi trở lên mới được tham gia!");
    
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showToast("Email không hợp lệ");
    
    setLoading(true);
    try {
      let finalAvatar = null;
      if (avatar) {
        finalAvatar = await uploadImage(avatar);
      }

      await userService.register({ 
        username: phone.trim(), 
        password, 
        fullName, 
        email: email.trim(), 
        dob: dob.trim(), 
        role: "farmer",
        avatarUrl: finalAvatar
      });
      showToast("Đăng ký thành công!", 'success');
      setTimeout(() => navigation.navigate("Login"), 1500);
    } catch (error: any) {
      showToast(error.response?.data?.message || "Đăng ký thất bại");
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
              <Text style={st.modalTitle}>Điều khoản sử dụng</Text>
              <TouchableOpacity onPress={() => setShowTermsModal(false)}>
                <MaterialCommunityIcons name="close" size={24} color="#9ca3af" />
              </TouchableOpacity>
            </View>

            <ScrollView onScroll={handleScroll} scrollEventThrottle={16} style={{ flex: 1 }} showsVerticalScrollIndicator>
              <Text style={st.termsText}>
                CHÍNH SÁCH BẢO MẬT VÀ ĐIỀU KHOẢN SỬ DỤNG {"\n\n"}
                Chào mừng bạn đến với Nông Nghiệp Xanh. Bằng việc sử dụng ứng dụng của chúng tôi, bạn đồng ý tuân thủ các điều khoản sau:{"\n\n"}
                1. Thu thập thông tin: Chúng tôi thu thập thông tin cá nhân như họ tên, số điện thoại, email và ngày sinh để cung cấp dịch vụ tốt nhất.{"\n\n"}
                2. Bảo mật dữ liệu: Thông tin của bạn được mã hóa và bảo vệ bằng công nghệ tiên tiến nhất. Chúng tôi cam kết không chia sẻ thông tin cho bên thứ ba khi chưa có sự đồng ý.{"\n\n"}
                3. Quyền hạn người dùng: Bạn có quyền yêu cầu truy cập, sửa đổi hoặc xóa dữ liệu cá nhân của mình bất kỳ lúc nào thông qua cài đặt ứng dụng.{"\n\n"}
                4. Trách nhiệm: Người dùng chịu trách nhiệm bảo mật mật khẩu tài khoản của mình. Mọi hoạt động diễn ra dưới tài khoản của bạn sẽ được coi là do bạn thực hiện.{"\n\n"}
                5. Thay đổi điều khoản: Chúng tôi có quyền cập nhật chính sách này. Thông báo sẽ được gửi qua ứng dụng khi có thay đổi quan trọng.{"\n\n"}
                6. Quy tắc cộng đồng: Nghiêm cấm các hành vi gian lận, phá hoại hoặc sử dụng ứng dụng cho mục đích phi pháp.{"\n\n"}
                7. Chấm dứt dịch vụ: Chúng tôi có quyền tạm ngừng hoặc khóa tài khoản nếu phát hiện vi phạm nghiêm trọng các điều khoản này.{"\n\n"}
                8. Giải quyết tranh chấp: Mọi tranh chấp phát sinh sẽ được giải quyết thông qua thương lượng trên tinh thần hợp tác.{"\n\n"}
                9. Quy định đặc biệt: Bạn phải đọc kỹ toàn bộ văn bản này trước khi nhấn đồng ý. Hệ thống chỉ cho phép bạn xác nhận sau khi đã cuộn xuống tận cùng của nội dung.{"\n\n"}
                Cảm ơn bạn đã tin tưởng và đồng hành cùng Nông Nghiệp Xanh!
              </Text>
            </ScrollView>

            <TouchableOpacity 
              disabled={!hasScrolledToBottom}
              onPress={() => { setAgreed(true); setShowTermsModal(false); }}
              style={[st.agreeBtn, hasScrolledToBottom ? st.agreeBtnActive : st.agreeBtnDisabled]}
            >
              <Text style={[st.agreeBtnText, hasScrolledToBottom ? st.agreeBtnTextActive : st.agreeBtnTextDisabled]}>
                {hasScrolledToBottom ? "Tôi đã đọc và đồng ý" : "Vui lòng cuộn xuống hết"}
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
            <Text style={st.headerTitle}>Đăng ký tài khoản</Text>
          </View>
          <View>
            <Text style={st.welcome}>Chào mừng,</Text>
            <Text style={st.subtitle}>Vui lòng điền thông tin để tạo tài khoản mới.</Text>
          </View>
        </View>

        <View style={st.form}>
          <TouchableOpacity onPress={pickAvatar} style={st.avatarPicker}>
            {avatar ? (
              <Image source={{ uri: avatar }} style={st.avatarImg} />
            ) : (
              <View style={st.avatarPlaceholder}>
                <MaterialCommunityIcons name="camera-plus" size={32} color="#154212" />
                <Text style={st.avatarLabel}>Thêm ảnh đại diện</Text>
              </View>
            )}
          </TouchableOpacity>

          <StaticInput label="Họ và tên" icon="account-outline" value={fullName} onChangeText={setFullName} placeholder="Nguyễn Văn A" />
          <StaticInput label="Ngày sinh" icon="calendar-month-outline" value={dob} editable={false} onPress={() => setShowDatePicker(true)} placeholder="Chọn ngày sinh của bạn" />
          {renderDatePicker()}
          <StaticInput label="Email" icon="email-outline" value={email} onChangeText={setEmail} placeholder="example@gmail.com" keyboardType="email-address" />
          <StaticInput label="Số điện thoại" icon="phone-outline" value={phone} onChangeText={setPhone} placeholder="09xxxxxxxx" keyboardType="phone-pad" />
          <StaticInput label="Mật khẩu" icon="lock-outline" value={password} onChangeText={setPassword} secureTextEntry placeholder="••••••••" />

          <TouchableOpacity onPress={() => setShowTermsModal(true)} activeOpacity={0.7} style={st.agreeWrap}>
            <MaterialCommunityIcons name={agreed ? "checkbox-marked" : "checkbox-blank-outline"} size={24} color={agreed ? "#154212" : "#9ca3af"} />
            <Text style={st.agreeText}>
              Tôi đồng ý với <Text style={st.agreeHighlight}>Điều khoản</Text> và <Text style={st.agreeHighlight}>Chính sách bảo mật</Text>
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleRegister} disabled={loading} activeOpacity={0.8}>
            <LinearGradient colors={["#154212", "#2d5a27"]} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={st.regBtn}>
              {loading ? <ActivityIndicator color="white" /> : <Text style={st.regBtnText}>Đăng ký ngay</Text>}
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
            <Text style={st.socialText}>Tiếp tục bằng Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={st.socialBtn}>
            <MaterialCommunityIcons name="facebook" size={24} color="#1877f2" />
            <Text style={st.socialText}>Tiếp tục bằng Facebook</Text>
          </TouchableOpacity>
        </View>

        <View style={st.footer}>
          <Text style={st.footerText}>Đã có tài khoản? </Text>
          <TouchableOpacity onPress={() => navigation.navigate("Login")}>
            <Text style={st.footerLink}>Đăng nhập</Text>
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
