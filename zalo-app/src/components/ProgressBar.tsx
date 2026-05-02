import React from 'react';
import { Box, Text } from 'zmp-ui';

interface ProgressBarProps {
  label: string;
  progress: number;
  maxValue?: number;
  color?: 'green' | 'blue' | 'red' | 'yellow' | 'purple';
  showPercentage?: boolean;
  height?: 'sm' | 'md' | 'lg';
  animated?: boolean;
  showValue?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  label,
  progress,
  maxValue = 100,
  color = 'green',
  showPercentage = true,
  height = 'md',
  animated = true,
  showValue = true,
}) => {
  const percentage = Math.min((progress / maxValue) * 100, 100);

  const colorClasses = {
    green: 'from-green-400 to-green-600',
    blue: 'from-blue-400 to-blue-600',
    red: 'from-red-400 to-red-600',
    yellow: 'from-yellow-400 to-yellow-600',
    purple: 'from-purple-400 to-purple-600',
  };

  const heightClasses = {
    sm: 'h-2',
    md: 'h-3',
    lg: 'h-4',
  };

  return (
    <Box className="w-full">
      {/* Label */}
      <Box className="flex items-center justify-between mb-2">
        <Text size="small" className="font-semibold text-gray-700">
          {label}
        </Text>
        {showValue && (
          <Text size="xSmall" className="text-gray-600">
            {progress} / {maxValue}
            {showPercentage && ` (${Math.round(percentage)}%)`}
          </Text>
        )}
      </Box>

      {/* Progress Bar */}
      <Box className={`w-full ${heightClasses[height]} bg-gray-200 rounded-full overflow-hidden`}>
        <Box
          className={`h-full bg-gradient-to-r ${colorClasses[color]} transition-all duration-500 ${
            animated ? 'animate-pulse' : ''
          }`}
          style={{ width: `${percentage}%` }}
        />
      </Box>

      {/* Optional sub-text */}
      {progress === maxValue && (
        <Text size="xSmall" className="text-green-600 font-semibold mt-1">
          ✓ Hoàn thành!
        </Text>
      )}
    </Box>
  );
};
