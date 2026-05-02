import React from 'react';
import { Box, Text } from 'zmp-ui';

interface TaskCardProps {
  id: number;
  title: string;
  description?: string;
  reward: number;
  rewardType?: 'coins' | 'exp' | 'seed';
  status?: 'pending' | 'completed' | 'submitted';
  icon?: string;
  progress?: number;
  onClick?: () => void;
  badge?: string;
}

export const TaskCard: React.FC<TaskCardProps> = ({
  id,
  title,
  description,
  reward,
  rewardType = 'coins',
  status = 'pending',
  icon = '✅',
  progress,
  onClick,
  badge,
}) => {
  const statusColors = {
    pending: 'bg-yellow-50 border-yellow-200',
    completed: 'bg-green-50 border-green-200',
    submitted: 'bg-blue-50 border-blue-200',
  };

  const rewardIcons = {
    coins: '💰',
    exp: '📊',
    seed: '🌱',
  };

  return (
    <Box
      onClick={onClick}
      className={`p-4 rounded-lg border-2 cursor-pointer transition-all duration-300 hover:shadow-lg ${statusColors[status]}`}
    >
      <Box className="flex items-start justify-between mb-3">
        <Box className="flex items-start gap-3 flex-1">
          <Text className="text-2xl">{icon}</Text>
          <Box className="flex-1">
            <Box className="flex items-center gap-2">
                    <Text size="sm" className="font-bold text-gray-800">
                {title}
              </Text>
              {badge && (
                <span className="text-xs bg-green-500 text-white px-2 py-1 rounded-full">
                  {badge}
                </span>
              )}
            </Box>
            {description && (
                      <Text size="xs" className="text-gray-600 line-clamp-1">{description}</Text>
            )}
          </Box>
        </Box>
        <Box className="flex items-center gap-1 bg-white px-3 py-1 rounded-lg">
          <Text className="text-lg">{rewardIcons[rewardType]}</Text>
                  <Text size="small" className="font-bold text-green-700">
            +{reward}
          </Text>
        </Box>
      </Box>

      {progress !== undefined && (
        <Box className="mt-3">
          <Box className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
            <Box
              className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-300"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </Box>
          <Text size="xs" className="text-gray-500 mt-1">
            {progress}%
          </Text>
        </Box>
      )}

      {status === 'completed' && (
        <Box className="mt-3 text-center">
                  <Text size="xSmall" className="text-green-700 font-semibold">
            ✓ Hoàn thành
          </Text>
        </Box>
      )}
    </Box>
  );
};
