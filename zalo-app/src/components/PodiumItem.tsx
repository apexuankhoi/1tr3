import React from 'react';
import { Box, Text } from 'zmp-ui';

interface PodiumItemProps {
  position: 1 | 2 | 3;
  name: string;
  coins: number;
  avatarUrl?: string;
}

export const PodiumItem: React.FC<PodiumItemProps> = ({
  position,
  name,
  coins,
  avatarUrl,
}) => {
  const positionData = {
    1: {
      icon: '🥇',
      label: 'Hạng 1',
      color: 'from-yellow-400 to-yellow-600',
      height: 'h-32',
      textColor: 'text-yellow-700',
      bgColor: 'bg-yellow-50',
    },
    2: {
      icon: '🥈',
      label: 'Hạng 2',
      color: 'from-gray-400 to-gray-600',
      height: 'h-24',
      textColor: 'text-gray-700',
      bgColor: 'bg-gray-50',
    },
    3: {
      icon: '🥉',
      label: 'Hạng 3',
      color: 'from-orange-400 to-orange-600',
      height: 'h-20',
      textColor: 'text-orange-700',
      bgColor: 'bg-orange-50',
    },
  };

  const data = positionData[position];

  return (
    <Box className="flex flex-col items-center">
      {/* Podium Bar */}
      <Box
        className={`${data.height} bg-gradient-to-b ${data.color} w-full rounded-t-lg flex items-end justify-center pb-2 transition-all duration-300 hover:shadow-lg`}
      >
        <Text className="text-3xl animate-bounce">{data.icon}</Text>
      </Box>

      {/* User Info */}
      <Box className={`${data.bgColor} w-full rounded-b-lg p-4 text-center`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={name}
            className="w-12 h-12 rounded-full object-cover mx-auto mb-2"
          />
        ) : (
          <Box className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center mx-auto mb-2 text-2xl">
            👤
          </Box>
        )}
        <Text size="small" className="font-bold text-gray-800 truncate">
          {name}
        </Text>
        <Box className="flex items-center justify-center gap-1 mt-2">
          <Text className="text-lg">💰</Text>
          <Text className={`font-bold ${data.textColor}`}>
            {coins.toLocaleString()}
          </Text>
        </Box>
        <Text size="xSmall" className="text-gray-600 mt-1">
          {data.label}
        </Text>
      </Box>
    </Box>
  );
};
