import React from 'react';
import { Page, Box, Text } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';
import { communityService } from '@/services/api';

export default function CommunityPage() {
  const t = useGameStore((state) => state.t);
  const [communityData, setCommunityData] = React.useState<any>(null);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    loadCommunityData();
  }, []);

  const loadCommunityData = async () => {
    setLoading(true);
    try {
      const res: any = await communityService.getCommunityData();
      setCommunityData(res || {});
    } catch (error) {
      console.error('Failed to load community data:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Page className="bg-white min-h-screen pb-20">
      <Box className="p-4">
          <Text size="xLarge" className="font-bold text-green-800 mb-6">
          {t('tabs.community')}
        </Text>

        {loading && <Text>{t('common.loading')}</Text>}

        <Box className="space-y-4">
          <Box className="p-4 bg-green-50 rounded-lg">
            <Text size="sm" className="font-semibold text-green-800">
                {t('community.overview')}
            </Text>
          </Box>
        </Box>
      </Box>
    </Page>
  );
}
