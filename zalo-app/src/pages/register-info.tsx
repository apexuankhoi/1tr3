import React from 'react';
import { Page, Box, Text } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';

export default function RegisterInfoPage() {
  const t = useGameStore((state) => state.t);
  const [dob, setDob] = React.useState('');
  const [location, setLocation] = React.useState('');

  const handleSubmit = async () => {
    // Complete registration with DOB and location
    console.log('Registration complete:', { dob, location });
  };

  return (
    <Page className="bg-gradient-to-b from-green-50 to-white min-h-screen pb-20">
      <Box className="p-4">
        <Text size="xl" className="font-bold text-green-800 mb-6">
          {t('auth.register_info')}
        </Text>
        <Box className="space-y-4">
          <Box>
            <Text size="sm" className="font-semibold text-gray-700 mb-2">
              {t('auth.dob')}
            </Text>
            <input
              type="date"
              value={dob}
              onChange={(e) => setDob(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
            />
          </Box>
          <Box>
            <Text size="sm" className="font-semibold text-gray-700 mb-2">
              {t('auth.location')}
            </Text>
            <input
              type="text"
              placeholder={t('auth.location')}
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-green-500"
            />
          </Box>
          <button
            onClick={handleSubmit}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-bold hover:bg-green-700"
          >
            {t('auth.complete_registration')}
          </button>
        </Box>
      </Box>
    </Page>
  );
}
