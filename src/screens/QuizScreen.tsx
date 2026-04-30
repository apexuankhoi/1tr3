import React, { useState, useEffect, useRef } from "react";
import {
  View, Text, TouchableOpacity, StyleSheet, ScrollView,
  Platform, Animated, Dimensions, ActivityIndicator
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

type QuizState = "idle" | "correct" | "wrong" | "submitting" | "finished";

export default function QuizScreen({ navigation, route }: any) {
  const insets = useSafeAreaInsets();
  const { userId, addCoins, addGrowth, t } = useGameStore();

  // Task Info
  const taskId: number = route?.params?.taskId ?? 1;
  const taskType = route?.params?.taskType;
  const taskTitle: string = route?.params?.taskTitle ?? t('quiz.default_title');
  const isBundle = taskType === 'quiz_bundle' || Number(taskId) === 1000 || taskTitle?.toLowerCase().includes('hệ thống trắc nghiệm');
  const taskReward: number = route?.params?.taskReward ?? 100;

  // Quiz Data
  const [questions, setQuestions] = useState<any[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(isBundle);
  const [selected, setSelected] = useState<string | null>(null);
  const [quizState, setQuizState] = useState<QuizState>("idle");
  const [correctCount, setCorrectCount] = useState(0);

  // Animations
  const shakeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (isBundle) {
      loadBundle();
    } else {
      // Single question from params
      const rawOpts = route?.params?.quiz_options;
      const opts = rawOpts ? (typeof rawOpts === "string" ? JSON.parse(rawOpts) : rawOpts) : [];
      const shuffled = shuffleOptions(opts, route?.params?.quiz_answer || "A");
      
      setQuestions([{
        id: taskId,
        title: taskTitle,
        description: route?.params?.taskDesc,
        quiz_options: shuffled.options,
        quiz_answer: shuffled.answer,
        quiz_explanation: route?.params?.quiz_explanation,
      }]);
    }
  }, []);

  const shuffleOptions = (opts: string[], correctKey: string) => {
    if (!opts || opts.length === 0) return { options: [], answer: "A" };
    
    // 1. Identify correct text before stripping
    const keyMap: any = { A: 0, B: 1, C: 2, D: 3 };
    const correctIdx = keyMap[correctKey] ?? 0;
    const correctText = opts[correctIdx];

    // 2. Strip prefixes (A. B. C. D. ) if they exist
    const cleanOpts = opts.map(o => o.replace(/^[A-D]\.\s*/, "").trim());
    const cleanCorrectText = correctText.replace(/^[A-D]\.\s*/, "").trim();

    // 3. Shuffle
    const shuffled = [...cleanOpts].sort(() => Math.random() - 0.5);

    // 4. Find new index of correct text
    const newIdx = shuffled.indexOf(cleanCorrectText);
    const reverseMap = ["A", "B", "C", "D"];
    const newKey = reverseMap[newIdx === -1 ? 0 : newIdx];

    // 5. Re-add prefixes for display consistency
    const finalOpts = shuffled.map((o, i) => `${reverseMap[i]}. ${o}`);

    return { options: finalOpts, answer: newKey };
  };

  const loadBundle = async () => {
    try {
      const res: any = await taskService.getQuizQuestions();
      if (res && Array.isArray(res)) {
        const processed = res.map(q => {
          const rawOpts = q.quiz_options ? (typeof q.quiz_options === "string" ? JSON.parse(q.quiz_options) : q.quiz_options) : [];
          const shuffled = shuffleOptions(rawOpts, q.quiz_answer || "A");
          return { ...q, quiz_options: shuffled.options, quiz_answer: shuffled.answer };
        });
        setQuestions(processed);
      }
    } catch (error) {
      console.error("Load bundle error:", error);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestion = questions[currentIndex];
  const options: string[] = currentQuestion?.quiz_options 
    ? (typeof currentQuestion.quiz_options === "string" ? JSON.parse(currentQuestion.quiz_options) : currentQuestion.quiz_options)
    : [];
  const correctAnswer = currentQuestion?.quiz_answer ?? "A";
  const explanation = currentQuestion?.quiz_explanation ?? "";

  const getOptionKey = (opt: string): string => {
    if (opt.startsWith("A.") || opt === "A") return "A";
    if (opt.startsWith("B.") || opt === "B") return "B";
    if (opt.startsWith("C.") || opt === "C") return "C";
    if (opt.startsWith("D.") || opt === "D") return "D";
    return opt;
  };

  const getOptionStyle = (opt: string) => {
    const key = getOptionKey(opt);
    if (quizState === "idle") return selected === key ? [st.option, st.optionSelected] : st.option;
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
    if (!selected || quizState !== "idle") return;
    const isCorrect = selected === correctAnswer;

    if (isCorrect) {
      setQuizState("correct");
      setCorrectCount(prev => prev + 1);
      haptics.notificationAsync(haptics.NotificationFeedbackType.Success);
      Animated.sequence([
        Animated.spring(scaleAnim, { toValue: 1.05, useNativeDriver: true, speed: 20 }),
        Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true, speed: 20 }),
      ]).start();
    } else {
      setQuizState("wrong");
      haptics.notificationAsync(haptics.NotificationFeedbackType.Error);
      Animated.sequence([
        Animated.timing(shakeAnim, { toValue: 10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: -10, duration: 60, useNativeDriver: true }),
        Animated.timing(shakeAnim, { toValue: 0, duration: 60, useNativeDriver: true }),
      ]).start();
    }
  };

  const handleNext = async () => {
    if (currentIndex < questions.length - 1) {
      // Transition to next question
      Animated.timing(fadeAnim, { toValue: 0, duration: 200, useNativeDriver: true }).start(() => {
        setCurrentIndex(prev => prev + 1);
        setSelected(null);
        setQuizState("idle");
        Animated.timing(fadeAnim, { toValue: 1, duration: 300, useNativeDriver: true }).start();
      });
    } else {
      // Finish quiz
      setQuizState("submitting");
      try {
        const res: any = await taskService.submitTask(userId || 1, taskId, "quiz-bundle-complete");
        await addCoins(taskReward, isBundle ? 100 : 20, res.level, res.exp);
        addGrowth(isBundle ? 40 : 20); // Extra growth boost for bundle
        setQuizState("finished");
      } catch (err) {
        console.error("Submit quiz error:", err);
        navigation.goBack();
      }
    }
  };

  const handleRetry = () => {
    setQuizState("idle");
    setSelected(null);
  };

  if (loading) {
    return (
      <View style={[st.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#7c3aed" />
        <Text style={{ marginTop: 12, color: "#6b7280", fontFamily: "Nunito_600SemiBold" }}>{t('common.loading')}</Text>
      </View>
    );
  }

  if (quizState === "finished") {
    return (
      <View style={st.root}>
        <LinearGradient colors={["#7c3aed", "#9d5cef"]} style={[st.finishedHero, { paddingTop: insets.top + 60 }]}>
          <MaterialCommunityIcons name="trophy-outline" size={80} color="#fff" />
          <Text style={st.finishedTitle}>{t('quiz.finished_title')}</Text>
          <Text style={st.finishedSub}>{t('quiz.finished_sub', { correct: correctCount, total: questions.length })}</Text>
          <View style={st.rewardFinal}>
            <Text style={st.rewardFinalText}>+{taskReward} {t('common.coin_unit')}</Text>
          </View>
        </LinearGradient>
        <View style={st.finishedBody}>
          <TouchableOpacity style={st.finishedBtn} onPress={() => navigation.goBack()}>
            <LinearGradient colors={["#0f9b58", "#1dba6e"]} style={st.confirmGrad}>
              <Text style={st.confirmText}>{t('quiz.back_to_garden')}</Text>
              <MaterialCommunityIcons name="check-circle" size={20} color="#fff" />
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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
        {isBundle && (
          <View style={st.progressBadge}>
            <Text style={st.progressText}>{currentIndex + 1}/{questions.length}</Text>
          </View>
        )}
      </LinearGradient>

      <ScrollView 
        style={{ flex: 1 }} 
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        alwaysBounceVertical={true}
      >
        <Animated.View style={[st.body, { opacity: fadeAnim }]}>
          {/* Progress Bar */}
          {isBundle && (
            <View style={st.miniProgress}>
              <View style={[st.miniProgressFill, { width: `${((currentIndex + 1) / questions.length) * 100}%` }]} />
            </View>
          )}

          {/* Question Card */}
          <Animated.View style={[st.questionCard, { transform: [{ translateX: shakeAnim }, { scale: scaleAnim }] }]}>
            <View style={st.quizIconRow}>
              <View style={st.quizIcon}>
                <MaterialCommunityIcons name="brain" size={28} color="#7c3aed" />
              </View>
              <View style={st.quizBadge}>
                <Text style={st.quizBadgeText}>Câu hỏi {currentIndex + 1}</Text>
              </View>
            </View>
            <Text style={st.questionText}>{currentQuestion?.description}</Text>
          </Animated.View>

          {/* Options */}
          <View style={st.optionsWrap}>
            {options.map((opt, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => handleSelect(opt)}
                activeOpacity={0.82}
                disabled={quizState !== "idle"}
                style={[getOptionStyle(opt), { opacity: quizState !== "idle" && selected !== getOptionKey(opt) && getOptionKey(opt) !== correctAnswer ? 0.6 : 1 }]}
              >
                <View style={[st.optionKey, {
                  backgroundColor: quizState !== "idle" && getOptionKey(opt) === correctAnswer ? "#10b981" :
                    quizState !== "idle" && selected === getOptionKey(opt) && getOptionKey(opt) !== correctAnswer ? "#ef4444" :
                    selected === getOptionKey(opt) ? "#7c3aed" : "#f3f4f6"
                }]}>
                  <Text style={[st.optionKeyText, {
                    color: selected === getOptionKey(opt) || (quizState !== "idle" && getOptionKey(opt) === correctAnswer) ? "#fff" : "#6b7280"
                  }]}>
                    {getOptionKey(opt)}
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

          {/* Explanation Section */}
          {quizState !== "idle" && (
            <FadeInDown style={[st.explanationCard, isWrong && { borderLeftColor: "#ef4444", backgroundColor: "#fef2f2" }]}>
              <View style={st.explanationHeader}>
                <MaterialCommunityIcons name="lightbulb-on" size={20} color={isCorrect ? "#7c3aed" : "#ef4444"} />
                <Text style={[st.explanationTitle, isWrong && { color: "#ef4444" }]}>{isCorrect ? "Giải thích" : "Đáp án đúng là " + correctAnswer}</Text>
              </View>
              <Text style={[st.explanationText, isWrong && { color: "#7f1d1d" }]}>
                {explanation || "Câu trả lời đúng là " + correctAnswer}
              </Text>
            </FadeInDown>
          )}

          {/* Action Button */}
          <View style={[st.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
            {quizState === "idle" ? (
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={!selected}
                activeOpacity={0.85}
                style={[st.confirmBtn, !selected && st.confirmDisabled]}
              >
                <LinearGradient colors={["#7c3aed", "#9d5cef"]} style={st.confirmGrad}>
                  <Text style={st.confirmText}>Xác nhận</Text>
                  <MaterialCommunityIcons name="check" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ) : isCorrect ? (
              <TouchableOpacity onPress={handleNext} activeOpacity={0.85} style={st.confirmBtn}>
                <LinearGradient colors={["#0f9b58", "#1dba6e"]} style={st.confirmGrad}>
                  <Text style={st.confirmText}>{currentIndex < questions.length - 1 ? "Câu tiếp theo" : "Hoàn thành"}</Text>
                  <MaterialCommunityIcons name="arrow-right" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity onPress={handleRetry} activeOpacity={0.85} style={st.confirmBtn}>
                <LinearGradient colors={["#ef4444", "#f87171"]} style={st.confirmGrad}>
                  <Text style={st.confirmText}>Thử lại</Text>
                  <MaterialCommunityIcons name="refresh" size={20} color="#fff" />
                </LinearGradient>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const FadeInDown = (props: any) => {
  const anim = useRef(new Animated.Value(20)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.parallel([
      Animated.timing(anim, { toValue: 0, duration: 400, useNativeDriver: true }),
      Animated.timing(opacity, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, []);
  return <Animated.View style={[props.style, { transform: [{ translateY: anim }], opacity }]}>{props.children}</Animated.View>;
};

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f7f8fa" },
  header: { paddingBottom: 22, paddingHorizontal: 20, flexDirection: "row", alignItems: "center" },
  backBtn: { width: 38, height: 38, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  headerLabel: { fontSize: 11, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.75)", textTransform: "uppercase", letterSpacing: 1 },
  headerTitle: { fontSize: 17, fontFamily: "Nunito_800ExtraBold", color: "#fff", marginTop: 2 },
  progressBadge: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  progressText: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#fff" },

  body: { flexGrow: 1, padding: 20 },
  miniProgress: { height: 4, backgroundColor: "#e5e7eb", borderRadius: 2, marginBottom: 20, overflow: "hidden" },
  miniProgressFill: { height: "100%", backgroundColor: "#7c3aed" },

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

  explanationCard: { backgroundColor: "#fff", borderRadius: 18, padding: 18, marginTop: 10, marginBottom: 20, borderLeftWidth: 5, borderLeftColor: "#7c3aed", ...SHADOW },
  explanationHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8, gap: 8 },
  explanationTitle: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#7c3aed", textTransform: "uppercase" },
  explanationText: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#4b5563", lineHeight: 22 },

  footer: { marginTop: "auto", paddingTop: 10 },
  confirmBtn: { borderRadius: 18, overflow: "hidden" },
  confirmDisabled: { opacity: 0.4 },
  confirmGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 16, gap: 10 },
  confirmText: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#fff" },

  finishedHero: { alignItems: "center", paddingBottom: 40, borderBottomLeftRadius: 40, borderBottomRightRadius: 40 },
  finishedTitle: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#fff", marginTop: 20 },
  finishedSub: { fontSize: 16, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.8)", marginTop: 8 },
  rewardFinal: { backgroundColor: "rgba(255,255,255,0.2)", paddingHorizontal: 20, paddingVertical: 10, borderRadius: 25, marginTop: 20 },
  rewardFinalText: { fontSize: 18, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  finishedBody: { padding: 30, flex: 1, justifyContent: "center" },
  finishedBtn: { borderRadius: 20, overflow: "hidden", ...SHADOW },
});

