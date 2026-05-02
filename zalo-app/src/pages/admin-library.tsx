import React from 'react';
import { Page, Box, Text, Button } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';
import { adminService, libraryService } from '@/services/api';

export default function AdminLibraryPage() {
  const t = useGameStore((state) => state.t);
  const [items, setItems] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadItems();
  }, []);

  const loadItems = async () => {
    setLoading(true);
    try {
      const res: any = await libraryService.getLibrary();
      setItems(res || []);
    } catch (error) {
      console.error('Failed to load library items:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-white min-h-screen pb-20">
      <Box className="p-4">
          <Text size="xLarge" className="font-bold text-green-800 mb-6">
          {t('admin.manage_library')}
        </Text>

        <Button className="w-full bg-green-600 text-white py-3 mb-6">
          {t('admin.add_content')}
        </Button>

        {loading && <Text>{t('common.loading')}</Text>}

        <Box className="space-y-4">
          {items.length === 0 && !loading && (
            <Text className="text-gray-400 text-center py-8">
              {t('admin.no_content')}
            </Text>
          )}

          {items.map((item: any) => (
            <Box key={item.id} className="p-4 border border-gray-200 rounded-lg">
                <Text size="small" className="font-semibold">{item.title}</Text>
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
