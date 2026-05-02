import React from 'react';
import { Box, Text } from 'zmp-ui';

interface VideoGuideCardProps {
  id: number;
  title: string;
  description?: string;
  thumbnailUrl?: string;
  duration?: number;
  author?: string;
  views?: number;
  onClick?: () => void;
  badge?: string;
}

export const VideoGuideCard: React.FC<VideoGuideCardProps> = ({
  id,
  title,
  description,
  thumbnailUrl,
  duration,
  author,
  views,
  onClick,
  badge,
}) => {
  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Box
      onClick={onClick}
      className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
    >
      {/* Thumbnail */}
      <Box className="relative w-full h-40 bg-gray-100 flex items-center justify-center group overflow-hidden">
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <Text className="text-4xl">🎥</Text>
        )}

        {/* Play Button Overlay */}
        <Box className="absolute inset-0 flex items-center justify-center bg-black/30 group-hover:bg-black/50 transition">
          <Box className="text-4xl">▶️</Box>
        </Box>

        {/* Duration Badge */}
        {duration && (
          <Box className="absolute bottom-2 right-2 bg-black text-white px-2 py-1 rounded text-xs font-semibold">
            {formatDuration(duration)}
          </Box>
        )}

        {badge && (
          <Box className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
            {badge}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box className="p-3">
        <Text size="small" className="font-bold text-gray-800 line-clamp-2">
          {title}
        </Text>
        {description && (
          <Text size="xSmall" className="text-gray-600 mt-1 line-clamp-2">
            {description}
          </Text>
        )}

        {/* Meta Info */}
        <Box className="flex items-center justify-between mt-3 text-xs text-gray-500">
          {author && <Text size="xs">{author}</Text>}
          {views && <Text size="xs">👁️ {views.toLocaleString()}</Text>}
        </Box>
      </Box>
    </Box>
  );
};
