import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet,
  Platform, Animated, Dimensions,
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { taskService } from "../services/api";
import { useGameStore } from "../store/useGameStore";
import * as haptics from "expo-haptics";

const { width } = Dimensions.get("window");

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.08, shadowRadius: 14, shadowOffset: { width: 0, height: 5 } },
  android: { elevation: 4 },
});

type QuizState = "idle" | "correct" | "wrong" | "submitted";

export default function QuizScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { userId, addCoins, t } = useGameStore();

  const taskId: number = route?.params?.taskId ?? 1;
  const taskTitle: string = route?.params?.taskTitle ?? "Quiz Nông nghiệp";
  const taskDesc: string = route?.params?.taskDesc ?? "Chọn đáp án đúng để nhận xu.";
  const taskReward: number = route?.params?.taskReward ?? 50;
  const rawOptions: any = route?.params?.quiz_options ?? ["A. 1 tuần", "B. 30-45 ngày", "C. 3 tháng", "D. 1 năm"];
  const correctAnswer: string = route?.params?.quiz_answer ?? "B";

  const options: string[] = typeof rawOptions === "string" ? JSON.parse(rawOptions) : rawOptions;

  const [selected, setSelected] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [submitting, setSubmitting] = useState(false);

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const coinAnim = useRef(new Animated.Value(0)).current;

  const getOptionKey = (opt: string): string => {
    if (opt.startsWith("A.") || opt === "A") return "A";
    if (opt.startsWith("B.") || opt === "B") return "B";
    if (opt.startsWith("C.") || opt === "C") return "C";
    if (opt.startsWith("D.") || opt === "D") return "D";
    return opt; // T/F or custom
  };

  const getOptionStyle = (opt: string) => {
    const key = getOptionKey(opt);
    if (quizState === "idle") {
      return selected === key ? [st.option, st.optionSelected] : st.option;
    }
    if (key === correctAnswer) return [st.option, st.optionCorrect];
    if (selected === key && key !== correctAnswer) return [st.option, st.optionWrong];
    return [st.option, st.optionDim];
  };

  const getTextStyle = (opt: string) => {
    const key = getOptionKey(opt);
    if (quizState === "idle") return selected === key ? st.optionTextSelected : st.optionText;
    if (key === correctAnswer) return st.optionTextCorrect;
    if (selected === key && key !== correctAnswer) return st.optionTextWrong;
    return st.optionTextDim;
  };

  const handleSelect = (opt: string) => {
    if (quizState !== "idle") return;
    setSelected(getOptionKey(opt));
  };

  const handleConfirm = async () => {
    if (!selected || submitting || quizState !== "idle") return;
    const isCorrect = selected === correctAnswer;

    if (isCorrect) {
      setQuizState("correct");
      haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.08, useNativeDriver: true, speed: 20 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
      Animated.timing(coinAnim, { toValue: 1, duration: 600, useNativeDriver: true, delay: 400 }).start();

      setSubmitting(true);
      try {
        await taskService.submitTask(userId || 1, taskId, "quiz-correct");
        await addCoins(taskReward);
      } catch {}
      setSubmitting(false);
    } else {
      setQuizState("wrong");
      haptics.notificationAsync(haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -8, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const isCorrect = quizState === "correct";
  const isWrong = quizState === "wrong";

  return (
    <View style={st.root}>
      {/* Header */}
      <LinearGradient colors={["#7c3aed", "#9d5cef"]} style={[st.header, { paddingTop: insets.top + 12 }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={22} color="#fff" />
        </TouchableOpacity>
        <View style={{ flex: 1, marginLeft: 14 }}>
          <Text style={st.headerLabel}>🎓 {t('tasks.filter_quiz')}</Text>
          <Text style={st.headerTitle} numberOfLines={1}>{taskTitle}</Text>
        </View>
        <View style={st.rewardBadge}>
          <Text style={st.rewardText}>+{taskReward} ⭐</Text>
        </View>
      </LinearGradient>

      <View style={st.body}>
        {/* Question Card */}
        <Animated.View style={[st.questionCard, { transform: [{ translateX: shakeAnim }, { scale: scaleAnim }] }]}>
          <View style={st.quizIconRow}>
            <View style={st.quizIcon}>
              <MaterialCommunityIcons name="brain" size={28} color="#7c3aed" />
            </View>
            <View style={st.quizBadge}>
              <Text style={st.quizBadgeText}>Quiz</Text>
            </View>
          </View>
          <Text style={st.questionText}>{taskDesc}</Text>
        </Animated.View>

        {/* Options */}
        <View style={st.optionsWrap}>
          {options.map((opt, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => handleSelect(opt)}
              activeOpacity={0.82}
              disabled={quizState !== "idle"}
              style={getOptionStyle(opt)}
            >
              <View style={[st.optionKey, {
                backgroundColor: quizState !== "idle" && getOptionKey(opt) === correctAnswer ? "#10b981" :
                  quizState !== "idle" && selected === getOptionKey(opt) && getOptionKey(opt) !== correctAnswer ? "#ef4444" :
                  selected === getOptionKey(opt) ? "#7c3aed" : "#f3f4f6"
              }]}>
                <Text style={[st.optionKeyText, {
                  color: selected === getOptionKey(opt) || (quizState !== "idle" && getOptionKey(opt) === correctAnswer) ? "#fff" : "#6b7280"
                }]}>
                  {getOptionKey(opt).length === 1 ? getOptionKey(opt) : (i + 1).toString()}
                </Text>
              </View>
              <Text style={getTextStyle(opt)} numberOfLines={2}>{opt}</Text>
              {quizState !== "idle" && getOptionKey(opt) === correctAnswer && (
                <MaterialCommunityIcons name="check-circle" size={20} color="#10b981" />
              )}
              {quizState !== "idle" && selected === getOptionKey(opt) && getOptionKey(opt) !== correctAnswer && (
                <MaterialCommunityIcons name="close-circle" size={20} color="#ef4444" />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Result Banner */}
        {isCorrect && (
          <Animated.View style={[st.resultBanner, st.resultCorrect, { opacity: coinAnim, transform: [{ translateY: coinAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }] }]}>
            <Text style={st.resultEmoji}>🎉</Text>
            <View>
              <Text style={[st.resultTitle, { color: "#065f46" }]}>{t('common.success')}</Text>
              <Text style={[st.resultSub, { color: "#065f46" }]}>+{taskReward} {t('profile.coins_earned')}</Text>
            </View>
          </Animated.View>
        )}

        {isWrong && (
          <View style={[st.resultBanner, st.resultWrong]}>
            <Text style={st.resultEmoji}>😔</Text>
            <View>
              <Text style={[st.resultTitle, { color: "#991b1b" }]}>{t('common.error')}</Text>
              <Text style={[st.resultSub, { color: "#991b1b" }]}>{t('tasks.status_rejected')}</Text>
            </View>
          </View>
        )}

        {/* Action Button */}
        {quizState === "idle" ? (
          <TouchableOpacity
            onPress={handleConfirm}
            disabled={!selected || submitting}
            activeOpacity={0.85}
            style={[st.confirmBtn, !selected && st.confirmDisabled]}
          >
            <LinearGradient colors={["#7c3aed", "#9d5cef"]} style={st.confirmGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
              <Text style={st.confirmText}>{t('common.confirm')}</Text>
              <MaterialCommunityIcons name="arrow-right-circle" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            activeOpacity={0.85}
            style={st.confirmBtn}
          >
            <LinearGradient
              colors={isCorrect ? ["#0f9b58", "#1dba6e"] : ["#7c3aed", "#9d5cef"]}
              style={st.confirmGrad}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
            >
              <Text style={st.confirmText}>{isCorrect ? t('common.success') : t('common.back')}</Text>
              <MaterialCommunityIcons name="arrow-right-circle" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f7f8fa" },

  header: { paddingBottom: 22, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerLabel: { fontSize: 11, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Nunito_800ExtraBold", color: "#fff", marginTop: 2 },
  rewardBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 7, borderRadius: 16 },
  rewardText: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#fff" },

  body: { flex: 1, padding: 20 },

  questionCard: { backgroundColor: "#fff", borderRadius: 22, padding: 22, marginBottom: 20, ...SHADOW },
  quizIconRow: { flexDirection: "row", alignItems: "center", marginBottom: 14, gap: 12 },
  quizIcon: { width: 50, height: 50, borderRadius: 15, backgroundColor: "#f5f3ff", alignItems: "center", justifyContent: "center" },
  quizBadge: { backgroundColor: "#ede9fe", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  quizBadgeText: { fontSize: 12, fontFamily: "Nunito_700Bold", color: "#7c3aed" },
  questionText: { fontSize: 17, fontFamily: "Nunito_800ExtraBold", color: "#111827", lineHeight: 26 },

  optionsWrap: { gap: 10, marginBottom: 16 },
  option: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 14, borderWidth: 2, borderColor: "#e5e7eb", gap: 12, ...SHADOW },
  optionSelected: { borderColor: "#7c3aed", backgroundColor: "#faf5ff" },
  optionCorrect: { borderColor: "#10b981", backgroundColor: "#f0fdf4" },
  optionWrong: { borderColor: "#ef4444", backgroundColor: "#fff5f5" },
  optionDim: { borderColor: "#f3f4f6", backgroundColor: "#fafafa", opacity: 0.5 },

  optionKey: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
  optionKeyText: { fontSize: 14, fontFamily: "Nunito_800ExtraBold" },
  optionText: { flex: 1, fontSize: 14, fontFamily: "Nunito_700Bold", color: "#374151" },
  optionTextSelected: { flex: 1, fontSize: 14, fontFamily: "Nunito_700Bold", color: "#7c3aed" },
  optionTextCorrect: { flex: 1, fontSize: 14, fontFamily: "Nunito_700Bold", color: "#065f46" },
  optionTextWrong: { flex: 1, fontSize: 14, fontFamily: "Nunito_700Bold", color: "#991b1b" },
  optionTextDim: { flex: 1, fontSize: 14, fontFamily: "Nunito_700Bold", color: "#9ca3af" },

  resultBanner: { flexDirection: "row", alignItems: "center", borderRadius: 16, padding: 16, marginBottom: 16, gap: 12 },
  resultCorrect: { backgroundColor: "#d1fae5", borderWidth: 1, borderColor: "#6ee7b7" },
  resultWrong: { backgroundColor: "#fee2e2", borderWidth: 1, borderColor: "#fca5a5" },
  resultEmoji: { fontSize: 30 },
  resultTitle: { fontSize: 16, fontFamily: "Nunito_800ExtraBold" },
  resultSub: { fontSize: 12, fontFamily: "Nunito_600SemiBold", marginTop: 2 },

  confirmBtn: { borderRadius: 18, overflow: "hidden" },
  confirmDisabled: { opacity: 0.4 },
  confirmGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 10 },
  confirmText: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
});
