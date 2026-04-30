import React, { useState, useEffect, useCallback } from "react";
import {
  View, Text, ScrollView, TouchableOpacity,
  ActivityIndicator, StatusBar, StyleSheet,
  RefreshControl, Platform, Dimensions, Alert
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInDown } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { taskService } from "../services/api";
import { useGameStore } from "../store/useGameStore";

const { width } = Dimensions.get("window");

// ── Group config ──────────────────────────────────────────────────────────────
const GROUP_CFG: Record<string, {
  icon: string; emoji: string;
  gradient: [string, string]; accent: string; bg: string;
}> = {
  action: {
    icon: "camera-outline", emoji: "📸",
    gradient: ["#0f9b58", "#1dba6e"],
    accent: "#0f9b58", bg: "#f0fdf4",
  },
  report: {
    icon: "map-marker-alert-outline", emoji: "📍",
    gradient: ["#dc2626", "#ef4444"],
    accent: "#dc2626", bg: "#fff5f5",
  },
  learn: {
    icon: "school-outline", emoji: "🎓",
    gradient: ["#7c3aed", "#9d5cef"],
    accent: "#7c3aed", bg: "#faf5ff",
  },
};

const STATUS_CFG: Record<string, { color: string; bg: string; icon: string }> = {
  none:     { color: "#fff",    bg: "transparent", icon: "arrow-right-circle" },
  pending:  { color: "#92400e", bg: "#fef3c7",     icon: "clock-time-four-outline" },
  approved: { color: "#065f46", bg: "#d1fae5",     icon: "check-decagram" },
  rejected: { color: "#991b1b", bg: "#fee2e2",     icon: "refresh" },
};

// ── MOCK fallback tasks ────────────────────────────────────────────────────────
const getMockTasks = (t: (key: string, params?: Record<string, any>) => any) => {
  const quizOptions = t('tasks.mock_2_options');
  const normalizedOptions = Array.isArray(quizOptions) ? quizOptions : [];
  return [
    { id: 1, title: t('tasks.mock_1_title'), reward: 60, category: "Action", description: t('tasks.mock_1_desc'), icon: "shovel", task_group: "action", task_type: "photo", needs_gps: false, needs_moderator: true, submissionStatus: "none" },
    { id: 2, title: t('tasks.mock_2_title'), reward: 40, category: "Quiz", description: t('tasks.mock_2_desc'), icon: "brain", task_group: "learn", task_type: "quiz", needs_gps: false, needs_moderator: false, quiz_options: normalizedOptions, quiz_answer: "B", quiz_explanation: t('tasks.mock_2_explanation'), submissionStatus: "none" },
    { id: 3, title: t('tasks.mock_3_title'), reward: 0, category: "Report", description: t('tasks.mock_3_desc'), icon: "fire-alert", task_group: "report", task_type: "photo", needs_gps: true, needs_moderator: false, submissionStatus: "none" },
  ];
};

export default function TasksScreen({ navigation }: any) {
  const insets = useSafeAreaInsets();
  const { seeds, coins, userId, addCoins, addGrowth, t } = useGameStore();

  const [weekNum, setWeekNum] = useState(0);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Quiz state
  const [quizAnswers, setQuizAnswers] = useState<Record<number, string>>({});

  const fetchWeekly = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res: any = await taskService.getWeeklyTasks(userId);
      if (res && res.tasks && Array.isArray(res.tasks)) {
        setTasks(res.tasks);
        setWeekNum(res.weekNum || 1);
      } else if (Array.isArray(res)) {
        setTasks(res);
        setWeekNum(1);
      } else {
        setTasks(getMockTasks(t));
        setWeekNum(1);
      }
    } catch (error) {
      console.error(t('common.error'), error);
      setTasks(getMockTasks(t));
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId, t]);

  useEffect(() => { fetchWeekly(); }, []);

  useFocusEffect(
    useCallback(() => {
      fetchWeekly();
    }, [fetchWeekly])
  );

  const onRefresh = () => { setRefreshing(true); fetchWeekly(); };

  const completedCount = tasks.filter(t => t.submissionStatus === "approved").length;
  const totalReward = tasks.filter(t => t.submissionStatus === "approved").reduce((s, t) => s + t.reward, 0);
  const progress = tasks.length > 0 ? completedCount / tasks.length : 0;

  // Group tasks
  const byGroup: Record<string, any[]> = { action: [], report: [], learn: [] };
  for (const t of tasks) { if (byGroup[t.task_group]) byGroup[t.task_group].push(t); }

  const handleAction = async (task: any) => {
    const status = (task.submissionStatus || "none").toLowerCase();
    if (status === "approved" || status === "pending") return;
    if (task.task_type === "quiz" || task.task_type === "quiz_bundle") {
      navigation.navigate("Quiz", {
        taskId: task.id,
        taskType: task.task_type,
        taskTitle: task.title,
        taskDesc: task.description,
        taskReward: task.reward,
        quiz_options: task.quiz_options,
        quiz_answer: task.quiz_answer,
        quiz_explanation: task.quiz_explanation,
      });
      return;
    }
    if (task.task_group === "action" || task.task_group === "report") {
      navigation.navigate("Report", {
        taskId: task.id,
        taskTitle: task.title,
        taskDesc: task.description,
        taskReward: task.reward,
        taskGroup: task.task_group,
        needsGps: !!task.needs_gps,
      });
    } else {
      // checkin / media / streak → auto-complete
      try {
        const res: any = await taskService.submitTask(userId || 1, task.id, "auto");
        if (res?.autoApproved) {
          addCoins(res.reward, task.exp_reward || 20, res.level, res.exp);
          addGrowth(20); // Tăng 20% tiến trình sinh trưởng
          Alert.alert(t('common.success'), t('tasks.auto_approved_message', { reward: res.reward, unit: t('common.coin_unit') }));
        } else {
          Alert.alert(t('tasks.submitted_title'), t('tasks.submitted_message'));
        }
        fetchWeekly();
      } catch (err: any) {
        Alert.alert(t('common.error'), err.message || t('tasks.submit_error_message'));
      }
    }
  };

  const handleQuizAnswer = (task: any, answer: string) => {
    if (quizAnswers[task.id]) return;
    setQuizAnswers(prev => ({ ...prev, [task.id]: answer }));
    if (answer === task.quiz_answer) {
      setTimeout(async () => {
        const res = await taskService.submitTask(userId || 1, task.id, "quiz-correct");
        if (res.data?.autoApproved) {
          addCoins(res.data.reward, task.exp_reward || 20, res.data.level, res.data.exp);
          addGrowth(20); // Tăng 20% khi trả lời đúng Quiz
        }
        fetchWeekly();
      }, 800);
    }
  };

  if (loading) {
    return (
      <View style={[st.root, { justifyContent: "center", alignItems: "center" }]}>
        <ActivityIndicator size="large" color="#154212" />
        <Text style={st.loaderText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <View style={st.root}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />

      {/* ── Top Bar ─────────────────────────────────── */}
      <View style={[st.topBar, { paddingTop: insets.top + 14 }]}>
        <View>
          <Text style={st.heading}>{t('tasks.weekly_title')}</Text>
          <Text style={st.subHeading}>{t('tasks.weekly_sub', { week: weekNum })}</Text>
        </View>
        <View style={st.badges}>
          <View style={st.badge}><Text style={st.badgeEmoji}>🍃</Text><Text style={st.badgeVal}>{seeds}</Text></View>
          <View style={st.badge}><Text style={st.badgeEmoji}>⭐</Text><Text style={st.badgeVal}>{coins}</Text></View>
        </View>
      </View>

      {/* ── Progress Card ───────────────────────────── */}
      <Animated.View entering={FadeInDown.duration(400)} style={st.progressCard}>
        <LinearGradient colors={["#154212", "#2a5c24"]} style={st.progressGradient} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
          <View style={st.progressStats}>
            <View style={st.pStat}><Text style={st.pNum}>{tasks.length}</Text><Text style={st.pLbl}>{t('tasks.total')}</Text></View>
            <View style={st.pDivider} />
            <View style={st.pStat}><Text style={st.pNum}>{completedCount}</Text><Text style={st.pLbl}>{t('tasks.status_approved')}</Text></View>
            <View style={st.pDivider} />
            <View style={st.pStat}><Text style={st.pNum}>+{totalReward}⭐</Text><Text style={st.pLbl}>{t('profile.coins_earned')}</Text></View>
          </View>
          {/* Progress bar */}
          <View style={st.barBg}>
            <View style={[st.barFill, { width: `${progress * 100}%` as any }]} />
          </View>
          <Text style={st.barLabel}>{t('tasks.weekly_progress', { percent: Math.round(progress * 100) })}</Text>
        </LinearGradient>
      </Animated.View>

      {/* ── Task List ───────────────────────────────── */}
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={st.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#154212" />}
      >
        {(["action", "report", "learn"] as const).map((group, gi) => {
          const groupTasks = byGroup[group];
          if (groupTasks.length === 0) return null;
          const cfg = GROUP_CFG[group];

          return (
            <Animated.View key={group} entering={FadeInDown.delay(gi * 120).duration(500)}>
              {/* Group Header */}
              <View style={st.groupHeader}>
                <LinearGradient colors={cfg.gradient} style={st.groupIcon}>
                  <Text style={{ fontSize: 16 }}>{cfg.emoji}</Text>
                </LinearGradient>
                <View style={{ flex: 1 }}>
                  <Text style={st.groupTitle}>{group === 'action' ? t('tasks.filter_action') : group === 'report' ? t('tasks.filter_report') : t('tasks.filter_quiz')}</Text>
                  <Text style={st.groupSub}>
                    {group === "action" ? t('tasks.group_action_sub') :
                     group === "report" ? t('tasks.group_report_sub') :
                     t('tasks.group_learn_sub')}
                  </Text>
                </View>
                <View style={[st.groupBadge, { backgroundColor: cfg.bg }]}>
                  <Text style={[st.groupBadgeText, { color: cfg.accent }]}>{t('tasks.group_count', { count: groupTasks.length })}</Text>
                </View>
              </View>

              {groupTasks.map((task, ti) => {
                const status = (task.submissionStatus || "none").toLowerCase();
                const statusCfg = STATUS_CFG[status] || STATUS_CFG.none;
                const isApproved = status === "approved";
                const isPending = status === "pending";
                const isQuiz = task.task_type === "quiz" || task.task_type === "quiz_bundle";
                const myAnswer = quizAnswers[task.id];
                const options = task.quiz_options
                  ? (typeof task.quiz_options === "string" ? JSON.parse(task.quiz_options) : task.quiz_options)
                  : [];

                return (
                  <Animated.View 
                    key={task.id} 
                    entering={FadeInDown.delay(gi * 120 + ti * 80).duration(400)}
                  >
                    <View style={[st.card, (isApproved || isPending) && st.cardDone]}>
                    {/* Left stripe */}
                    <LinearGradient colors={cfg.gradient} style={st.stripe} />

                    <View style={st.cardInner}>
                      {/* Header */}
                      <View style={st.cardHead}>
                        <View style={[st.cardIconWrap, { backgroundColor: (isApproved || isPending) ? "#f3f4f6" : cfg.bg }]}>
                          <MaterialCommunityIcons name={(task.icon || cfg.icon) as any} size={20} color={(isApproved || isPending) ? "#9ca3af" : cfg.accent} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 12 }}>
                          <Text style={[st.cardTitle, (isApproved || isPending) && { color: "#9ca3af", textDecorationLine: "line-through" }]} numberOfLines={2}>
                            {task.title}
                          </Text>
                          <View style={st.metaRow}>
                            <Text style={[st.rewardChip, { color: cfg.accent }]}>+{task.reward} {t('common.coin_unit')}</Text>
                            {!!task.needs_gps && <View style={st.gpsPill}><MaterialCommunityIcons name="map-marker" size={10} color="#7c3aed" /><Text style={st.gpsText}>{t('tasks.gps_label')}</Text></View>}
                            {!!task.needs_moderator && <View style={st.modPill}><Text style={st.modText}>{t('tasks.status_pending')}</Text></View>}
                          </View>
                        </View>
                        {(isApproved || isPending) && <MaterialCommunityIcons name={isApproved ? "check-decagram" : "clock-fast"} size={22} color={isApproved ? "#10b981" : "#9ca3af"} />}
                      </View>

                      {/* Description */}
                      {!isApproved && <Text style={st.cardDesc}>{task.description}</Text>}

                      {/* Quiz info banner if not approved */}
                      {isQuiz && !isApproved && (
                        <View style={[st.quizWrap, { backgroundColor: "#faf5ff", padding: 12, borderRadius: 12, borderStyle: 'dashed', borderWidth: 1, borderColor: '#7c3aed44' }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialCommunityIcons name="brain" size={18} color="#7c3aed" />
                            <Text style={{ fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#7c3aed' }}>{t('tasks.quiz_ready_title')}</Text>
                          </View>
                          <Text style={{ fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: '#6b7280', marginTop: 4 }}>{t('tasks.quiz_ready_body')}</Text>
                        </View>
                      )}

                      {/* Completed message for Quiz */}
                      {isQuiz && isApproved && (
                        <View style={[st.quizWrap, { backgroundColor: "#d1fae5", padding: 12, borderRadius: 12, borderStyle: 'solid', borderWidth: 1, borderColor: '#10b98144' }]}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                            <MaterialCommunityIcons name="check-circle" size={18} color="#10b981" />
                            <Text style={{ fontSize: 13, fontFamily: 'Nunito_700Bold', color: '#065f46' }}>{t('tasks.quiz_correct_title')}</Text>
                          </View>
                          <Text style={{ fontSize: 11, fontFamily: 'Nunito_600SemiBold', color: '#065f46', marginTop: 4 }}>{t('tasks.quiz_correct_body')}</Text>
                        </View>
                      )}

                      {/* Action button */}
                      <TouchableOpacity
                        onPress={() => handleAction(task)}
                        activeOpacity={0.85}
                        disabled={isPending || isApproved}
                        style={[st.actionBtn, (isPending || isApproved) && { backgroundColor: statusCfg.bg }]}
                      >
                        {!isPending && !isApproved ? (
                          <LinearGradient colors={cfg.gradient} style={st.actionGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}>
                            <MaterialCommunityIcons name={statusCfg.icon as any} size={16} color="#fff" />
                            <Text style={[st.actionText, { color: "#fff" }]}>
                              {status === 'rejected' ? t('common.edit') : isQuiz ? t('common.start') : t('tasks.submit')}
                            </Text>
                          </LinearGradient>
                        ) : (
                          <View style={st.actionInner}>
                            <MaterialCommunityIcons name={statusCfg.icon as any} size={16} color={statusCfg.color} />
                            <Text style={[st.actionText, { color: statusCfg.color }]}>{isApproved ? t('tasks.status_approved') : t('tasks.status_pending')}</Text>
                          </View>
                        )}
                      </TouchableOpacity>
                    </View>
                  </View>
                </Animated.View>
              );
              })}
            </Animated.View>
          );
        })}

        <View style={{ height: 120 }} />
      </ScrollView>
    </View>
  );
}

const SHADOW = Platform.select({
  ios: { shadowColor: "#000", shadowOpacity: 0.06, shadowRadius: 14, shadowOffset: { width: 0, height: 5 } },
  android: { elevation: 3 },
});

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f7f8fa" },
  loaderText: { marginTop: 12, fontFamily: "Nunito_600SemiBold", fontSize: 14, color: "#9ca3af" },

  topBar: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", paddingHorizontal: 22, paddingBottom: 14, backgroundColor: "#f7f8fa" },
  inlineExplanation: { backgroundColor: "#fff", borderRadius: 18, padding: 18, marginTop: 10, marginBottom: 20, borderWidth: 1, borderColor: "#ede9fe", borderLeftWidth: 5, borderLeftColor: "#7c3aed" },
  inlineExplanationTitle: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#7c3aed", textTransform: "uppercase", marginBottom: 8 },
  inlineExplanationText: { fontSize: 14, fontFamily: "Nunito_600SemiBold", color: "#4b5563", lineHeight: 22 },
  heading: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#111827" },
  subHeading: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#6b7280", marginTop: 2 },
  badges: { flexDirection: "row", gap: 8 },
  badge: { flexDirection: "row", alignItems: "center", backgroundColor: "#fff", paddingHorizontal: 11, paddingVertical: 7, borderRadius: 18, gap: 4, ...SHADOW },
  badgeEmoji: { fontSize: 14 },
  badgeVal: { fontSize: 13, fontFamily: "Nunito_700Bold", color: "#111827" },

  progressCard: { marginHorizontal: 20, marginBottom: 18, borderRadius: 22, overflow: "hidden", ...SHADOW },
  progressGradient: { padding: 20 },
  progressStats: { flexDirection: "row", justifyContent: "space-around", marginBottom: 16 },
  pStat: { alignItems: "center" },
  pNum: { fontSize: 22, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  pLbl: { fontSize: 11, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.65)", marginTop: 2 },
  pDivider: { width: 1, height: 32, backgroundColor: "rgba(255,255,255,0.2)" },
  barBg: { height: 7, backgroundColor: "rgba(255,255,255,0.2)", borderRadius: 4, overflow: "hidden" },
  barFill: { height: "100%", backgroundColor: "#86efac", borderRadius: 4 },
  barLabel: { fontSize: 11, fontFamily: "Nunito_600SemiBold", color: "rgba(255,255,255,0.6)", textAlign: "center", marginTop: 8 },

  listContent: { paddingHorizontal: 20, paddingTop: 4 },

  groupHeader: { flexDirection: "row", alignItems: "center", marginBottom: 12, marginTop: 8 },
  groupIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center", marginRight: 12 },
  groupTitle: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#111827" },
  groupSub: { fontSize: 11, fontFamily: "Nunito_600SemiBold", color: "#9ca3af", marginTop: 1 },
  groupBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  groupBadgeText: { fontSize: 12, fontFamily: "Nunito_700Bold" },

  card: { backgroundColor: "#fff", borderRadius: 20, marginBottom: 12, flexDirection: "row", overflow: "hidden", ...SHADOW },
  cardDone: { opacity: 0.65, backgroundColor: "#f3f4f6" },
  stripe: { width: 5 },
  cardInner: { flex: 1, padding: 16 },
  cardHead: { flexDirection: "row", alignItems: "flex-start", marginBottom: 10 },
  cardIconWrap: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 14, fontFamily: "Nunito_800ExtraBold", color: "#111827", lineHeight: 20 },
  metaRow: { flexDirection: "row", alignItems: "center", marginTop: 4, gap: 6, flexWrap: "wrap" },
  rewardChip: { fontSize: 12, fontFamily: "Nunito_700Bold" },
  gpsPill: { flexDirection: "row", alignItems: "center", backgroundColor: "#ede9fe", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, gap: 2 },
  gpsText: { fontSize: 10, fontFamily: "Nunito_700Bold", color: "#7c3aed" },
  modPill: { backgroundColor: "#fef3c7", paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6 },
  modText: { fontSize: 10, fontFamily: "Nunito_700Bold", color: "#92400e" },
  cardDesc: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#6b7280", lineHeight: 18, marginBottom: 14 },

  quizWrap: { gap: 8, marginBottom: 4 },
  quizOpt: { borderWidth: 1.5, borderColor: "#e5e7eb", borderRadius: 12, paddingVertical: 10, paddingHorizontal: 14 },
  quizCorrect: { backgroundColor: "#d1fae5", borderColor: "#10b981" },
  quizWrong: { backgroundColor: "#fee2e2", borderColor: "#ef4444" },
  quizOptText: { fontSize: 13, fontFamily: "Nunito_700Bold", color: "#374151" },

  actionBtn: { borderRadius: 12, overflow: "hidden" },
  actionGrad: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 11, gap: 7 },
  actionInner: { flexDirection: "row", alignItems: "center", justifyContent: "center", paddingVertical: 11, gap: 7 },
  actionText: { fontSize: 13, fontFamily: "Nunito_700Bold" },
});
