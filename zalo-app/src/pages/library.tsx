import React from 'react';
import { Page, Box, Text } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';
import { libraryService } from '@/services/api';

export default function LibraryPage() {
  const t = useGameStore((state) => state.t);
  const [library, setLibrary] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadLibrary();
  }, []);

  const loadLibrary = async () => {
    setLoading(true);
    try {
      const res: any = await libraryService.getLibrary();
      setLibrary(res || []);
    } catch (error) {
      console.error('Failed to load library:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-white min-h-screen pb-20">
      <Box className="p-4">
          <Text size="xLarge" className="font-bold text-green-800 mb-6">
          {t('tabs.library')}
        </Text>

        {loading && <Text>{t('common.loading')}</Text>}
        
        {library.length === 0 && !loading && (
          <Box className="flex flex-col items-center justify-center py-12">
            <Text className="text-gray-400">{t('library.empty')}</Text>
          </Box>
        )}

        <Box className="space-y-4">
          {library.map((item: any) => (
            <Box key={item.id} className="p-4 border border-gray-200 rounded-lg">
                <Text size="small" className="font-semibold">{item.title}</Text>
            </Box>
          ))}
        </Box>
      </Box>
    </Page>
  );
}
