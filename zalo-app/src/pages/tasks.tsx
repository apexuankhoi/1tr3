import React, { useState, useEffect } from "react";
import { Page, Box, Text, Icon, Button, Progress, Spinner, useNavigate } from "zmp-ui";
import { useGameStore } from "@/store/useGameStore";
import { taskService } from "@/services/api";

const TasksPage = () => {
  const navigate = useNavigate();
  const { seeds, coins, userId, t } = useGameStore();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [weekNum, setWeekNum] = useState(1);

  useEffect(() => {
    fetchTasks();
  }, [userId]);

  const fetchTasks = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const res: any = await taskService.getWeeklyTasks(userId);
      if (res && res.tasks) {
        setTasks(res.tasks);
        setWeekNum(res.weekNum || 1);
      } else {
        setTasks([]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const completedCount = tasks.filter(t => t.submissionStatus === "approved").length;
  const progress = tasks.length > 0 ? (completedCount / tasks.length) * 100 : 0;

  const getGroupLabel = (group: string) => {
    switch(group) {
        case 'action': return { label: 'Hành động', icon: 'zi-camera', color: 'text-green-600', bg: 'bg-green-50' };
        case 'report': return { label: 'Báo cáo', icon: 'zi-location', color: 'text-red-600', bg: 'bg-red-50' };
        case 'learn': return { label: 'Học tập', icon: 'zi-notif-ring', color: 'text-purple-600', bg: 'bg-purple-50' };
        default: return { label: 'Khác', icon: 'zi-more-grid', color: 'text-gray-600', bg: 'bg-gray-50' };
    }
  };

  return (
    <Page className="bg-gray-50 pb-24">
      {/* Header */}
      <Box className="bg-white px-4 pt-12 pb-4 flex justify-between items-center shadow-sm">
        <Box>
            <Text className="text-xl font-black text-green-900">Nhiệm vụ</Text>
            <Text className="text-xs text-gray-400 font-bold">Tuần thứ {weekNum}</Text>
        </Box>
        <Box className="flex space-x-2">
            <Box className="bg-green-50 px-3 py-1 rounded-full flex items-center space-x-1">
                <Text>🍃</Text>
                <Text className="font-bold text-green-800">{seeds}</Text>
            </Box>
            <Box className="bg-orange-50 px-3 py-1 rounded-full flex items-center space-x-1">
                <Text>⭐</Text>
                <Text className="font-bold text-orange-800">{coins}</Text>
            </Box>
        </Box>
      </Box>

      {/* Progress Card */}
      <Box className="p-4">
        <Box className="bg-gradient-to-br from-green-800 to-green-950 p-6 rounded-[32px] text-white shadow-xl">
            <Box className="flex justify-around mb-6">
                <Box className="text-center">
                    <Text className="text-2xl font-black">{tasks.length}</Text>
                    <Text className="text-[10px] opacity-60 uppercase font-bold">Tổng số</Text>
                </Box>
                <Box className="w-[1px] h-10 bg-white/20" />
                <Box className="text-center">
                    <Text className="text-2xl font-black">{completedCount}</Text>
                    <Text className="text-[10px] opacity-60 uppercase font-bold">Hoàn thành</Text>
                </Box>
            </Box>
            <Progress completed={progress} max={100} className="h-2 rounded-full bg-white/20" />
            <Text className="text-center mt-3 text-xs font-bold opacity-80">Tiến độ tuần: {Math.round(progress)}%</Text>
        </Box>
      </Box>

      {/* Task List */}
      <Box className="px-4 space-y-4">
        {loading ? (
            <Box className="flex justify-center py-10"><Spinner /></Box>
        ) : tasks.length === 0 ? (
            <Box className="text-center py-10 opacity-50"><Text>Hiện không có nhiệm vụ nào</Text></Box>
        ) : (
            tasks.map((task) => {
                const cfg = getGroupLabel(task.task_group);
                const status = (task.submissionStatus || 'none').toLowerCase();
                const isDone = status === 'approved' || status === 'pending';

                return (
                    <Box 
                        key={task.id} 
                        className={`bg-white p-4 rounded-2xl shadow-sm border-l-4 border-green-700 flex items-start space-x-4 ${isDone ? 'opacity-60' : ''}`}
                    >
                        <Box className={`${cfg.bg} ${cfg.color} w-10 h-10 rounded-xl flex items-center justify-center`}>
                            <Icon icon={cfg.icon as any} />
                        </Box>
                        <Box className="flex-1">
                            <Box className="flex justify-between items-start">
                                <Text className={`font-bold text-gray-800 ${isDone ? 'line-through' : ''}`}>{task.title}</Text>
                                <Box className="bg-orange-50 px-2 py-0.5 rounded flex items-center">
                                    <Text className="text-[10px] font-black text-orange-700">+{task.reward}⭐</Text>
                                </Box>
                            </Box>
                            <Text className="text-xs text-gray-400 mt-1" numberOfLines={2}>{task.description}</Text>
                            
                            <Box className="mt-3 flex justify-between items-center">
                                <Box className="flex items-center space-x-1">
                                    {task.task_type === 'quiz' && <Box className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded text-[10px] font-bold">Quiz</Box>}
                                    {task.needs_gps && <Box className="bg-red-100 text-red-700 px-2 py-0.5 rounded text-[10px] font-bold">GPS</Box>}
                                </Box>
                                
                                {status === 'approved' ? (
                                    <Text className="text-green-600 font-bold text-xs flex items-center">
                                        <Icon icon="zi-check-circle-solid" size={14} className="mr-1" /> Đã xong
                                    </Text>
                                ) : status === 'pending' ? (
                                    <Text className="text-gray-400 font-bold text-xs flex items-center">
                                        <Icon icon="zi-clock-2" size={14} className="mr-1" /> Chờ duyệt
                                    </Text>
                                ) : (
                                    <Button 
                                        size="small" 
                                        className="bg-green-800 rounded-lg h-7 text-[10px] font-bold"
                                        onClick={() => {
                                            const route = task.task_type === 'quiz' ? '/quiz' : '/report';
                                            navigate(route, { 
                                                state: { 
                                                    taskId: task.id,
                                                    taskTitle: task.title,
                                                    taskDesc: task.description,
                                                    taskReward: task.reward,
                                                    quiz_options: task.quiz_options,
                                                    quiz_answer: task.quiz_answer,
                                                    quiz_explanation: task.quiz_explanation,
                                                    needsGps: !!task.needs_gps
                                                } 
                                            });
                                        }}
                                    >
                                        Làm ngay
                                    </Button>
                                )}
                            </Box>
                        </Box>
                    </Box>
                );
            })
        )}
      </Box>
      <Box className="h-10" />
    </Page>
  );
};

export default TasksPage;
