import React from 'react';
import { Box, Text } from 'zmp-ui';

interface ShopCardProps {
  id: number;
  title: string;
  description?: string;
  price: number;
  imageUrl?: string;
  category?: string;
  stock?: number;
  inStock?: boolean;
  onClick?: () => void;
  onBuy?: () => void;
  badge?: string;
}

export const ShopCard: React.FC<ShopCardProps> = ({
  id,
  title,
  description,
  price,
  imageUrl,
  category,
  stock,
  inStock = true,
  onClick,
  onBuy,
  badge,
}) => {
  return (
    <Box
      onClick={onClick}
      className="rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer bg-white"
    >
      {/* Image */}
      <Box className="relative w-full h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
        {imageUrl ? (
          <img src={imageUrl} alt={title} className="w-full h-full object-cover" />
        ) : (
          <Text className="text-4xl">🛍️</Text>
        )}
        {badge && (
          <Box className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-bold">
            {badge}
          </Box>
        )}
        {!inStock && (
          <Box className="absolute inset-0 bg-black/50 flex items-center justify-center">
            <Text className="text-white font-bold">Hết hàng</Text>
          </Box>
        )}
      </Box>

      {/* Content */}
      <Box className="p-3">
        {category && (
          <Text size="xSmall" className="text-gray-500 uppercase tracking-wide mb-1">
            {category}
          </Text>
        )}
        <Text size="small" className="font-bold text-gray-800 mb-1">
          {title}
        </Text>
        {description && (
          <Text size="xSmall" className="text-gray-600 mb-2">
            {description}
          </Text>
        )}

        <Box className="flex items-center justify-between mt-3">
          <Box className="flex items-baseline gap-1">
            <Text className="text-xl">💰</Text>
            <Text className="text-lg font-bold text-green-700">
              {price}
            </Text>
          </Box>
          {stock !== undefined && (
            <Text size="xSmall" className="text-gray-500">
              {stock} còn lại
            </Text>
          )}
        </Box>

        {onBuy && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBuy();
            }}
            disabled={!inStock}
            className="w-full mt-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white py-2 rounded-lg font-semibold transition"
          >
            {inStock ? 'Mua ngay' : 'Hết hàng'}
          </button>
        )}
      </Box>
    </Box>
  );
};
