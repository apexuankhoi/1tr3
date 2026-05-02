import React from 'react';
import { Box, Text } from 'zmp-ui';

interface AudioStoryCardProps {
  id: number;
  title: string;
  author?: string;
  description?: string;
  duration?: number;
  imageUrl?: string;
  isPlaying?: boolean;
  onClick?: () => void;
  badge?: string;
}

export const AudioStoryCard: React.FC<AudioStoryCardProps> = ({
  id,
  title,
  author,
  description,
  duration,
  imageUrl,
  isPlaying = false,
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
      className="flex gap-3 p-3 rounded-lg border border-gray-200 hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
    >
      {/* Thumbnail */}
      <Box className="relative w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={title}
            className="w-full h-full object-cover"
          />
        ) : (
          <Text className="text-3xl">🎧</Text>
        )}

        {/* Play Button */}
        <Box
          className={`absolute inset-0 flex items-center justify-center transition ${
            isPlaying
              ? 'bg-green-600/80 text-white'
              : 'bg-black/30 text-white hover:bg-black/50'
          }`}
        >
          <Text className="text-lg">
            {isPlaying ? '⏸' : '▶️'}
          </Text>
        </Box>

        {badge && (
          <Box className="absolute top-1 right-1 bg-red-500 text-white px-1 rounded text-xs font-bold">
            {badge}
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box className="flex-1 flex flex-col justify-center">
        <Text size="small" className="font-bold text-gray-800 line-clamp-1">
          {title}
        </Text>
        {author && (
          <Text size="xSmall" className="text-gray-600">
            🎤 {author}
          </Text>
        )}
        {description && (
          <Text size="xSmall" className="text-gray-600 line-clamp-1">
            {description}
          </Text>
        )}

        {/* Duration */}
        {duration && (
          <Text size="xSmall" className="text-gray-500 mt-1">
            ⏱️ {formatDuration(duration)}
          </Text>
        )}
      </Box>
    </Box>
  );
};
