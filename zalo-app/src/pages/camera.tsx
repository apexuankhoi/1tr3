import React from 'react';
import { Page, Box, Text, Button } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';
import { useNavigate } from 'react-router-dom';

export default function CameraPage() {
  const t = useGameStore((state) => state.t);
  const navigate = useNavigate();
  const [photo, setPhoto] = React.useState<string | null>(null);

  const handleTakePhoto = async () => {
    try {
      (window as any).zmp.chooseImage({
        count: 1,
        sourceType: ['camera'],
        success: (res: any) => {
          setPhoto(res.tempFiles[0].path);
        }
      });
    } catch (error) {
      console.error('Camera error:', error);
    }
  };

  const handleUpload = () => {
    if (photo) {
      // Upload and navigate back
      navigate(-1);
    }
  };

  return (
    <Page className="bg-black min-h-screen flex flex-col items-center justify-center">
      <Box className="p-4 space-y-4 w-full">
        {photo ? (
          <>
            <img src={photo} alt="Captured" className="w-full h-96 object-cover rounded-lg" />
            <Button onClick={handleUpload} className="w-full bg-green-600 text-white py-3">
              {t('common.upload')}
            </Button>
            <Button onClick={() => setPhoto(null)} className="w-full bg-gray-600 text-white py-3">
              {t('common.retake')}
            </Button>
          </>
        ) : (
          <Button onClick={handleTakePhoto} className="w-full bg-green-600 text-white py-3">
            {t('camera.take_photo')}
          </Button>
        )}
      </Box>
    </Page>
  );
}
