import React from 'react';
import { Box, Text } from 'zmp-ui';

interface RankingItemProps {
  rank: number;
  name: string;
  coins: number;
  avatarUrl?: string;
  isCurrentUser?: boolean;
  subtitle?: string;
}

export const RankingItem: React.FC<RankingItemProps> = ({
  rank,
  name,
  coins,
  avatarUrl,
  isCurrentUser = false,
  subtitle,
}) => {
  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-yellow-50 border-yellow-300';
    if (rank === 2) return 'bg-gray-50 border-gray-300';
    if (rank === 3) return 'bg-orange-50 border-orange-300';
    return 'bg-white border-gray-200';
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return `#${rank}`;
  };

  return (
    <Box
      className={`flex items-center gap-3 p-4 rounded-lg border-2 ${getRankColor(rank)} ${
        isCurrentUser ? 'ring-2 ring-green-500' : ''
      }`}
    >
      {/* Rank Badge */}
      <Box className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-green-600 text-white flex items-center justify-center font-bold text-lg flex-shrink-0">
        {getRankIcon(rank)}
      </Box>

      {/* User Info */}
      <Box className="flex-1">
        <Box className="flex items-center gap-2">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-8 h-8 rounded-full object-cover"
            />
          ) : (
            <Box className="w-8 h-8 rounded-full bg-gray-300 flex items-center justify-center text-sm">
              👤
            </Box>
          )}
          <Text size="small" className="font-bold text-gray-800">
            {name}
          </Text>
          {isCurrentUser && (
            <span className="text-xs bg-green-500 text-white px-2 py-0.5 rounded-full">
              Bạn
            </span>
          )}
        </Box>
        {subtitle && (
          <Text size="xSmall" className="text-gray-600">
            {subtitle}
          </Text>
        )}
      </Box>

      {/* Coins */}
      <Box className="flex items-center gap-1 bg-white px-3 py-2 rounded-lg">
        <Text className="text-lg">💰</Text>
        <Text className="font-bold text-green-700">
          {coins.toLocaleString()}
        </Text>
      </Box>
    </Box>
  );
};
