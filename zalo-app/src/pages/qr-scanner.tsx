import React from 'react';
import { Page, Box, Text, Button } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';

export default function QRScannerPage() {
  const t = useGameStore((state) => state.t);
  const [scanned, setScanned] = React.useState<string | null>(null);

  const handleStartScan = async () => {
    try {
      (window as any).zmp.scanQRCode({
        success: (data: any) => {
          setScanned(data.content);
        },
        fail: (err: any) => {
          console.error('QR scan error:', err);
        }
      });
    } catch (error) {
      console.error('QR scan error:', error);
    }
  };

  return (
    <Page className="bg-white min-h-screen pb-20">
      <Box className="p-4">
        <Text size="xl" className="font-bold text-green-800 mb-6">
          {t('scanner.title')}
        </Text>

        <Box className="flex flex-col items-center justify-center py-12">
          <Box className="w-64 h-64 border-4 border-green-500 rounded-lg mb-6 flex items-center justify-center">
            <Text className="text-gray-400">{t('scanner.point_at_qr')}</Text>
          </Box>

          <Button onClick={handleStartScan} className="w-full bg-green-600 text-white py-3">
            {t('scanner.start_scan')}
          </Button>

          {scanned && (
            <Box className="mt-6 p-4 bg-green-50 rounded-lg w-full">
              <Text size="sm" className="font-semibold text-green-800">
                {t('scanner.scanned')}: {scanned}
              </Text>
            </Box>
          )}
        </Box>
      </Box>
    </Page>
  );
}
