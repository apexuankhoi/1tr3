import React, { useState, useEffect } from "react";
import { 
  View, Text, ScrollView, StyleSheet, TouchableOpacity, 
  ActivityIndicator, Alert, Modal, TextInput, Switch, KeyboardAvoidingView, Platform
} from "react-native";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { taskService, adminService } from "../services/api";
import { useGameStore } from "../store/useGameStore";

export default function AdminTasksScreen() {
  const insets = useSafeAreaInsets();
  const navigation = useNavigation();
  const t = useGameStore(s => s.t);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [currentTask, setCurrentTask] = useState<any>(null);

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data: any = await taskService.getTasks();
      setTasks(data || []);
    } catch (err) {
      console.error(t('common.error'), err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (task: any) => {
    setCurrentTask({
      ...task,
      quiz_options: typeof task.quiz_options === 'string' ? JSON.parse(task.quiz_options) : task.quiz_options || ["", "", "", ""]
    });
    setEditModalVisible(true);
  };

  const handleSave = async () => {
    if (!currentTask.title) {
      Alert.alert(t('common.error'), t('common.error'));
      return;
    }
    try {
      await adminService.saveTask(currentTask);
      setEditModalVisible(false);
      fetchTasks();
      Alert.alert(t('common.success'), t('common.success'));
    } catch (err) {
      Alert.alert(t('common.error'), t('common.error'));
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert(t('common.confirm'), t('common.confirm'), [
      { text: t('common.close') },
      { text: t('admin_users.action_delete'), style: "destructive", onPress: async () => {
          try {
            await adminService.deleteItem("tasks", id);
            fetchTasks();
          } catch (err) {
            Alert.alert(t('common.error'), t('common.error'));
          }
      }}
    ]);
  };

  if (loading) return <View style={st.centered}><ActivityIndicator size="large" color="#154212" /></View>;

  return (
    <View style={[st.root, { paddingTop: insets.top }]}>
      <View style={st.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={st.backBtn}>
          <MaterialCommunityIcons name="arrow-left" size={24} color="#111827" />
        </TouchableOpacity>
        <Text style={st.headerTitle}>{t('tabs.tasks')}</Text>
        <TouchableOpacity onPress={() => handleEdit({ title: '', reward: 50, task_type: 'photo', needs_gps: 0, needs_moderator: 1 })} style={st.addBtn}>
          <MaterialCommunityIcons name="plus" size={24} color="#154212" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={st.list}>
        {tasks.map(task => (
          <View key={task.id} style={st.card}>
            <View style={st.cardHeader}>
              <View style={st.iconWrap}>
                <MaterialCommunityIcons name={task.icon || "clipboard-text"} size={20} color="#154212" />
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={st.cardTitle}>{task.title}</Text>
                <Text style={st.cardMeta}>{task.category} • {task.reward} {t('common.coin_unit')}</Text>
              </View>
            </View>
            <View style={st.cardActions}>
              <TouchableOpacity onPress={() => handleEdit(task)} style={st.editBtn}>
                <MaterialCommunityIcons name="pencil" size={18} color="#2563eb" />
                <Text style={[st.actionText, { color: "#2563eb" }]}>{t('common.edit')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(task.id)} style={st.deleteBtn}>
                <MaterialCommunityIcons name="trash-can" size={18} color="#ef4444" />
                <Text style={[st.actionText, { color: "#ef4444" }]}>{t('common.delete')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
      </ScrollView>

      <Modal visible={editModalVisible} animationType="slide">
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={[st.modalContent, { paddingTop: insets.top + 20 }]}>
            <Text style={st.modalTitle}>{currentTask?.id ? t('admin_forms.edit_task') : t('admin_forms.add_task')}</Text>
            
            <Text style={st.label}>{t('admin_forms.title_label')}</Text>
            <TextInput style={st.input} value={currentTask?.title} onChangeText={t => setCurrentTask({...currentTask, title: t})} />

            <Text style={st.label}>{t('admin_forms.reward_label')}</Text>
            <TextInput style={st.input} keyboardType="numeric" value={String(currentTask?.reward)} onChangeText={t => setCurrentTask({...currentTask, reward: parseInt(t) || 0})} />

            <Text style={st.label}>{t('admin_forms.type')}</Text>
            <View style={st.row}>
              <TouchableOpacity onPress={() => setCurrentTask({...currentTask, task_type: 'photo'})} style={[st.typeBtn, currentTask?.task_type === 'photo' && st.typeBtnActive]}>
                <Text style={[st.typeText, currentTask?.task_type === 'photo' && st.typeTextActive]}>{t('admin_forms.task_type_photo')}</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setCurrentTask({...currentTask, task_type: 'quiz'})} style={[st.typeBtn, currentTask?.task_type === 'quiz' && st.typeBtnActive]}>
                <Text style={[st.typeText, currentTask?.task_type === 'quiz' && st.typeTextActive]}>{t('admin_forms.task_type_quiz')}</Text>
              </TouchableOpacity>
            </View>

            {currentTask?.task_type === 'quiz' && (
              <View style={st.quizSection}>
                <Text style={st.label}>{t('admin_forms.quiz_options_label')}</Text>
                {currentTask.quiz_options.map((opt: string, i: number) => (
                  <TextInput 
                    key={i}
                    style={[st.input, { marginBottom: 8 }]} 
                    value={opt} 
                    onChangeText={t => {
                      const newOpts = [...currentTask.quiz_options];
                      newOpts[i] = t;
                      setCurrentTask({...currentTask, quiz_options: newOpts});
                    }}
                    placeholder={t('admin_forms.quiz_option_placeholder', { index: i + 1 })}
                  />
                ))}
                <Text style={st.label}>{t('admin_forms.quiz_answer_label')}</Text>
                <TextInput style={st.input} value={currentTask?.quiz_answer} onChangeText={t => setCurrentTask({...currentTask, quiz_answer: t.toUpperCase()})} maxLength={1} />
              </View>
            )}

            <View style={st.switchRow}>
              <Text style={st.label}>{t('admin_forms.gps_req')}</Text>
              <Switch value={!!currentTask?.needs_gps} onValueChange={v => setCurrentTask({...currentTask, needs_gps: v ? 1 : 0})} />
            </View>

            <View style={st.switchRow}>
              <Text style={st.label}>{t('admin_forms.mod_req')}</Text>
              <Switch value={!!currentTask?.needs_moderator} onValueChange={v => setCurrentTask({...currentTask, needs_moderator: v ? 1 : 0})} />
            </View>

            <View style={st.modalBtns}>
              <TouchableOpacity onPress={() => setEditModalVisible(false)} style={st.cancelBtn}><Text style={st.cancelBtnText}>{t('common.cancel')}</Text></TouchableOpacity>
              <TouchableOpacity onPress={handleSave} style={st.saveBtn}><Text style={st.saveBtnText}>{t('common.save')}</Text></TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}

const st = StyleSheet.create({
  root: { flex: 1, backgroundColor: "#f8fafc" },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 15, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#e2e8f0' },
  backBtn: { padding: 5 },
  headerTitle: { fontSize: 18, fontFamily: "Nunito_800ExtraBold", color: "#0f172a" },
  addBtn: { padding: 5, backgroundColor: '#f0fdf4', borderRadius: 8 },
  
  list: { padding: 20 },
  card: { backgroundColor: '#fff', padding: 16, borderRadius: 20, marginBottom: 16, elevation: 2, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, shadowOffset: { width: 0, height: 4 } },
  cardHeader: { flexDirection: 'row', alignItems: 'center' },
  iconWrap: { width: 44, height: 44, borderRadius: 12, backgroundColor: '#f0fdf4', alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#1e293b" },
  cardMeta: { fontSize: 12, fontFamily: "Nunito_600SemiBold", color: "#64748b", marginTop: 2 },
  cardActions: { flexDirection: 'row', borderTopWidth: 1, borderTopColor: '#f1f5f9', marginTop: 16, paddingTop: 12, gap: 16 },
  editBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  deleteBtn: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  actionText: { fontSize: 14, fontFamily: "Nunito_700Bold" },

  modalContent: { padding: 24, paddingBottom: 60 },
  modalTitle: { fontSize: 24, fontFamily: "Nunito_800ExtraBold", color: "#0f172a", marginBottom: 24 },
  label: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#475569", marginBottom: 8, marginTop: 16 },
  input: { backgroundColor: '#f1f5f9', padding: 12, borderRadius: 12, fontSize: 16, fontFamily: "Nunito_600SemiBold", color: "#1e293b" },
  row: { flexDirection: 'row', gap: 12 },
  typeBtn: { flex: 1, padding: 12, borderRadius: 12, borderWidth: 1, borderColor: '#e2e8f0', alignItems: 'center' },
  typeBtnActive: { backgroundColor: '#154212', borderColor: '#154212' },
  typeText: { fontSize: 14, fontFamily: "Nunito_700Bold", color: "#64748b" },
  typeTextActive: { color: '#fff' },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 16 },
  modalBtns: { flexDirection: 'row', gap: 16, marginTop: 40 },
  cancelBtn: { flex: 1, padding: 16, borderRadius: 16, backgroundColor: '#f1f5f9', alignItems: 'center' },
  saveBtn: { flex: 2, padding: 16, borderRadius: 16, backgroundColor: '#154212', alignItems: 'center' },
  cancelBtnText: { fontSize: 16, fontFamily: "Nunito_700Bold", color: "#475569" },
  saveBtnText: { fontSize: 16, fontFamily: "Nunito_800ExtraBold", color: "#fff" },
  quizSection: { marginTop: 10, padding: 12, backgroundColor: '#f8fafc', borderRadius: 16, borderLeftWidth: 4, borderLeftColor: '#154212' },
});
