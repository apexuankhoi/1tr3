import React from 'react';
import { Page, Box, Text } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';
import { adminService } from '@/services/api';

export default function AdminDashboardPage() {
  const t = useGameStore((state) => state.t);
  const [stats, setStats] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    try {
      const res: any = await adminService.getStats();
      setStats({
        totalUsers: res?.userCount || 0,
        totalTasks: res?.taskCount || 0,
        totalRevenue: res?.pendingSubmissions || 0, // Mapping pendingSubmissions to a stat block
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-white min-h-screen pb-20">
      <Box className="p-4">
        <Text size="xLarge" className="font-bold text-green-800 mb-6">
          {t('admin.dashboard')}
        </Text>

        {loading && <Text>{t('common.loading')}</Text>}

        {stats && (
          <Box className="grid grid-cols-1 gap-4">
            <Box className="p-4 bg-green-50 rounded-lg">
              <Text size="small" className="text-gray-600">{t('admin.total_users')}</Text>
              <Text size="xLarge" className="font-bold text-green-800">{stats.totalUsers}</Text>
            </Box>
            <Box className="p-4 bg-blue-50 rounded-lg">
              <Text size="small" className="text-gray-600">{t('admin.total_tasks')}</Text>
              <Text size="xLarge" className="font-bold text-blue-800">{stats.totalTasks}</Text>
            </Box>
            <Box className="p-4 bg-yellow-50 rounded-lg">
              <Text size="small" className="text-gray-600">{t('admin.total_revenue')}</Text>
              <Text size="xLarge" className="font-bold text-yellow-800">{stats.totalRevenue}</Text>
            </Box>
          </Box>
        )}
      </Box>
    </Page>
  );
}
