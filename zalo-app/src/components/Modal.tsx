import React from 'react';
import { Box, Text } from 'zmp-ui';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
  closable?: boolean;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closable = true,
}) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
  };

  return (
    <Box className="fixed inset-0 z-50 flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <Box
        className="absolute inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <Box
        className={`relative bg-white rounded-t-2xl md:rounded-2xl shadow-xl w-full md:w-auto md:${sizeClasses[size]} max-h-[90vh] overflow-y-auto animated`}
      >
        {/* Header */}
        {(title || closable) && (
          <Box className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between rounded-t-2xl md:rounded-t-2xl">
            {title && (
              <Text size="large" className="font-bold text-gray-800">
                {title}
              </Text>
            )}
            {closable && (
              <button
                onClick={onClose}
                className="ml-auto w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded-lg transition"
              >
                ✕
              </button>
            )}
          </Box>
        )}

        {/* Content */}
        <Box className="p-4">
          {children}
        </Box>

        {/* Footer */}
        {footer && (
          <Box className="sticky bottom-0 border-t border-gray-200 bg-white p-4 rounded-b-2xl md:rounded-b-2xl">
            {footer}
          </Box>
        )}
      </Box>
    </Box>
  );
};
