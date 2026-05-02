import React from 'react';
import { Page, Box, Text, Button } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';
import { adminService, taskService } from '@/services/api';

export default function AdminTasksPage() {
  const t = useGameStore((state) => state.t);
  const [tasks, setTasks] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const res: any = await taskService.getTasks();
      setTasks(res || []);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-white min-h-screen pb-20">
      <Box className="p-4">
        <Text size="xLarge" className="font-bold text-green-800 mb-6">
          {t('admin.manage_tasks')}
        </Text>

        <Button className="w-full bg-green-600 text-white py-3 mb-6">
          {t('admin.add_task')}
        </Button>

        {loading && <Text>{t('common.loading')}</Text>}

        <Box className="space-y-4">
          {tasks.length === 0 && !loading && (
            <Text className="text-gray-400 text-center py-8">
              {t('admin.no_tasks')}
            </Text>
          )}

          {tasks.map((task: any) => (
            <Box key={task.id} className="p-4 border border-gray-200 rounded-lg">
              <Text size="small" className="font-semibold">{task.title}</Text>
              <Box className="flex gap-2 mt-2">
                <Button className="flex-1 bg-blue-500 text-white py-2 text-sm">
                  {t('common.edit')}
                </Button>
                <Button className="flex-1 bg-red-500 text-white py-2 text-sm">
                  {t('common.delete')}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Page>
  );
}
