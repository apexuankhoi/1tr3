import React, { useState, useEffect, useRef } from "react";
import { 
  View, Text, StyleSheet, Image, TouchableOpacity, 
  Dimensions, Modal, Platform 
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useGameStore } from "../store/useGameStore";
import Animated, { 
  FadeIn, FadeOut, SlideInUp, 
  useSharedValue, useAnimatedStyle, withRepeat, withTiming
} from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { useNavigation } from "@react-navigation/native";

const { width, height } = Dimensions.get("window");

const STEPS = [
  {
    id: "welcome",
    title: "Chào cháu nhé!",
    text: "Bác là Bác Sáu, rất vui được dẫn dắt cháu tham gia Nông Nghiệp Xanh. Để bác chỉ cháu cách kiếm tiền từ khu vườn này nhé!",
    position: "center",
    tab: "Home"
  },
  {
    id: "plant",
    title: "Bước 1: Gieo hạt",
    text: "Đầu tiên, cháu hãy chọn một 'đám mây' trống và nhấn nút 'Gieo hạt'. Cháu sẽ dùng 1 hạt giống để bắt đầu trồng một cái cây mới đấy.",
    position: "top",
    arrow: "up",
    tab: "Home"
  },
  {
    id: "care",
    title: "Bước 2: Chăm sóc cây",
    text: "Nhấn vào chậu cây đang lớn, cháu sẽ thấy thanh Độ ẩm và Dinh dưỡng. Cháu phải nhấn 'Tưới nước' và 'Bón phân' thường xuyên để cây lớn nhanh hơn nhé!",
    position: "top",
    arrow: "up",
    tab: "Home"
  },
  {
    id: "harvest",
    title: "Bước 3: Thu hoạch Xu",
    text: "Khi cây ra quả chín, cháu hãy nhấn 'Thu hoạch'. Cháu sẽ nhận được Xu vàng. Càng chăm sóc tốt, cháu càng nhận được nhiều Xu đấy!",
    position: "top",
    arrow: "up",
    tab: "Home"
  },
  {
    id: "tasks",
    title: "Bước 4: Làm nhiệm vụ",
    text: "Nếu hết hạt giống, cháu hãy vào đây. Chụp ảnh vườn rau sạch nhà cháu để bác duyệt và tặng thưởng hạt giống nhé!",
    position: "bottom",
    arrow: "down",
    tab: "Tasks",
    highlightIdx: 1
  },
  {
    id: "shop",
    title: "Bước 5: Đổi quà thật",
    text: "Có Xu rồi thì vào đây! Cháu có thể đổi Xu lấy Thẻ cào điện thoại 50k, 100k hoặc các vật phẩm hữu ích. Quà thật 100%!",
    position: "bottom",
    arrow: "down",
    tab: "Shop",
    highlightIdx: 2
  },
  {
    id: "library",
    title: "Bước 6: Học hỏi",
    text: "Cuối cùng, cháu vào đây xem video hướng dẫn của các kỹ sư nếu muốn biết kỹ thuật xịn hơn. Chúc cháu có một khu vườn rực rỡ!",
    position: "bottom",
    arrow: "down",
    tab: "Library",
    highlightIdx: 3
  }
];

export function OnboardingOverlay() {
  const navigation = useNavigation<any>();
  const { hasSeenTutorial, setHasSeenTutorial, userRole } = useGameStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [visible, setVisible] = useState(false);
  const [displayText, setDisplayText] = useState("");

  const floatAnim = useSharedValue(0);
  const pulseAnim = useSharedValue(1);

  useEffect(() => {
    if (!hasSeenTutorial && userRole === 'farmer') {
      const timer = setTimeout(() => setVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, [hasSeenTutorial, userRole]);

  useEffect(() => {
    if (visible) {
      floatAnim.value = withRepeat(withTiming(-10, { duration: 1500 }), -1, true);
      pulseAnim.value = withRepeat(withTiming(1.3, { duration: 1000 }), -1, true);
    }
  }, [visible]);

  useEffect(() => {
    if (visible) {
      let i = 0;
      setDisplayText("");
      const fullText = STEPS[currentStep].text;
      const interval = setInterval(() => {
        setDisplayText(fullText.slice(0, i));
        i++;
        if (i > fullText.length) clearInterval(interval);
      }, 25);
      return () => clearInterval(interval);
    }
  }, [currentStep, visible]);

  const nextStep = () => {
    const nextIdx = currentStep + 1;
    if (nextIdx < STEPS.length) {
      const nextTab = STEPS[nextIdx].tab;
      try {
        if (nextTab) navigation.navigate(nextTab);
      } catch (e) {}
      setCurrentStep(nextIdx);
    } else {
      finish();
    }
  };

  const finish = () => {
    setVisible(false);
    setHasSeenTutorial(true);
  };

  const teacherStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: floatAnim.value }]
  }));

  const highlightStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseAnim.value }],
    opacity: 1.5 - pulseAnim.value
  }));

  if (!visible) return null;

  const step = STEPS[currentStep];
  const tabWidth = width / 5;

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View style={st.overlay}>
        <Animated.View entering={FadeIn} exiting={FadeOut} style={st.dim} />

        {step.highlightIdx !== undefined && (
          <View style={[st.highlightContainer, { left: tabWidth * step.highlightIdx + tabWidth/2 - 35 }]}>
            <Animated.View style={[st.pulseRing, highlightStyle]} />
            <View style={st.solidRing} />
          </View>
        )}

        <Animated.View 
          key={step.id}
          entering={FadeIn.duration(400)}
          style={[
            st.boxContainer,
            step.position === 'center' ? st.posCenter : (step.position === 'top' ? st.posTop : st.posBottom)
          ]}
        >
          {step.arrow === 'up' && (
            <MaterialCommunityIcons name="chevron-double-up" size={40} color="#fbbf24" style={{ marginBottom: 10 }} />
          )}

          <View style={st.card}>
            <View style={st.cardHeader}>
              <Animated.View style={[st.avatarBox, teacherStyle]}>
                <Image source={require("../../assets/teacher.png")} style={st.avatar} />
              </Animated.View>
              <View style={st.titleBox}>
                <Text style={st.title}>{step.title}</Text>
                <View style={st.titleLine} />
              </View>
            </View>

            <View style={st.body}>
              <Text style={st.message}>{displayText}</Text>
            </View>

            <View style={st.footer}>
              <TouchableOpacity onPress={finish} style={st.skipBtn}>
                <Text style={st.skipText}>Bỏ qua</Text>
              </TouchableOpacity>
              
              <TouchableOpacity onPress={nextStep} style={st.nextBtnWrap}>
                <LinearGradient colors={["#154212", "#2d5a27"]} start={{x:0, y:0}} end={{x:1, y:1}} style={st.nextBtn}>
                  <Text style={st.nextText}>
                    {currentStep === STEPS.length - 1 ? "Bắt đầu thôi!" : "Tiếp theo"}
                  </Text>
                  <MaterialCommunityIcons name="arrow-right" size={18} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>

          {step.arrow === 'down' && (
            <MaterialCommunityIcons name="chevron-double-down" size={40} color="#fbbf24" style={{ marginTop: 10 }} />
          )}
        </Animated.View>
      </View>
    </Modal>
  );
}

const st = StyleSheet.create({
  overlay: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  dim: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,10,0,0.85)' },
  
  highlightContainer: { position: 'absolute', bottom: Platform.OS === 'ios' ? 30 : 10, width: 70, height: 70, alignItems: 'center', justifyContent: 'center' },
  pulseRing: { position: 'absolute', width: 80, height: 80, borderRadius: 40, borderWidth: 4, borderColor: '#fbbf24' },
  solidRing: { width: 60, height: 60, borderRadius: 30, borderWidth: 2, borderColor: '#fbbf24', backgroundColor: 'rgba(251,191,36,0.1)' },

  boxContainer: { width: width * 0.9, alignItems: 'center', position: 'absolute' },
  posCenter: { top: height * 0.3 },
  posTop: { top: height * 0.15 },
  posBottom: { bottom: 130 },

  card: { backgroundColor: 'rgba(255,255,255,0.95)', borderRadius: 32, padding: 24, width: '100%', borderWidth: 1, borderColor: 'rgba(255,255,255,0.5)', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 15 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 16 },
  avatarBox: { width: 74, height: 74, borderRadius: 37, backgroundColor: '#fff', padding: 3, shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 10, elevation: 5 },
  avatar: { width: '100%', height: '100%', borderRadius: 35 },
  
  titleBox: { flex: 1 },
  title: { fontSize: 20, fontFamily: 'Nunito_800ExtraBold', color: '#154212' },
  titleLine: { height: 3, width: 40, backgroundColor: '#fbbf24', marginTop: 4, borderRadius: 2 },

  body: { minHeight: 60 },
  message: { fontSize: 16, fontFamily: 'Nunito_600SemiBold', color: '#374151', lineHeight: 24 },

  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  skipBtn: { padding: 12 },
  skipText: { fontSize: 14, fontFamily: 'Nunito_700Bold', color: '#9ca3af' },
  
  nextBtnWrap: { borderRadius: 20, overflow: 'hidden', elevation: 4 },
  nextBtn: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 24, paddingVertical: 12, gap: 10 },
  nextText: { color: '#fff', fontFamily: 'Nunito_800ExtraBold', fontSize: 15 },
});
