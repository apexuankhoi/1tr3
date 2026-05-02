import React from 'react';
import { Page, Box, Text, Button } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';
import { adminService } from '@/services/api';

export default function AdminUsersPage() {
  const t = useGameStore((state) => state.t);
  const [users, setUsers] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState('');

  React.useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const res: any = await adminService.getUsers();
      setUsers(res || []);
    } catch (error) {
      console.error('Failed to load users:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(user =>
    user.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.username?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Page className="bg-white min-h-screen pb-20">
      <Box className="p-4">
        <Text size="xLarge" className="font-bold text-green-800 mb-6">
          {t('admin.manage_users')}
        </Text>

        <input
          type="text"
          placeholder={t('admin.search_users')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-3 border border-gray-200 rounded-lg mb-6 focus:outline-none focus:border-green-500"
        />

        {loading && <Text>{t('common.loading')}</Text>}

        <Box className="space-y-4">
          {filteredUsers.length === 0 && !loading && (
            <Text className="text-gray-400 text-center py-8">
              {t('admin.no_users')}
            </Text>
          )}

          {filteredUsers.map((user: any) => (
            <Box key={user.id} className="p-4 border border-gray-200 rounded-lg">
              <Text size="small" className="font-semibold">{user.fullName}</Text>
              <Text size="xSmall" className="text-gray-600">{user.username}</Text>
              <Text size="xSmall" className="text-gray-500 mt-2">{t('admin.role')}: {user.role}</Text>
              <Box className="flex gap-2 mt-2">
                <Button className="flex-1 bg-blue-500 text-white py-2 text-sm">
                  {t('common.view')}
                </Button>
                <Button className="flex-1 bg-gray-500 text-white py-2 text-sm">
                  {t('admin.change_role')}
                </Button>
              </Box>
            </Box>
          ))}
        </Box>
      </Box>
    </Page>
  );
}
