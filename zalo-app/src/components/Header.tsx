import React from 'react';
import { Box, Text } from 'zmp-ui';

interface HeaderProps {
  title: string;
  coins?: number;
  level?: number;
  exp?: number;
  showStats?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  coins = 0,
  level = 1,
  exp = 0,
  showStats = true,
  onBack,
  rightAction,
}) => {
  return (
    <Box className="sticky top-0 z-50 bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg">
      <Box className="p-4">
        <Box className="flex items-center justify-between mb-3">
          <Box className="flex items-center gap-2 flex-1">
            {onBack && (
              <button
                onClick={onBack}
                className="flex items-center justify-center w-8 h-8 hover:bg-green-800 rounded-lg transition"
              >
                ← 
              </button>
            )}
            <Text size="large" className="font-bold">
              {title}
            </Text>
          </Box>
          {rightAction && <Box>{rightAction}</Box>}
        </Box>

        {showStats && (
          <Box className="flex gap-6 text-sm">
            <Box className="flex items-center gap-1">
              <span className="text-lg">💰</span>
              <Text className="font-semibold">{coins}</Text>
            </Box>
            <Box className="flex items-center gap-1">
              <span className="text-lg">⭐</span>
              <Text className="font-semibold">{level}</Text>
            </Box>
            <Box className="flex items-center gap-1">
              <span className="text-lg">📊</span>
              <Text className="font-semibold">{exp}</Text>
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  );
};
