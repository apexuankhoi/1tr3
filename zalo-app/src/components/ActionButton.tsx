import React from 'react';
import { Button, Box, Text } from 'zmp-ui';

interface ActionButtonProps {
  label: string;
  onClick: () => void;
  variant?: 'primary' | 'secondary' | 'danger' | 'success';
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
  className?: string;
}

export const ActionButton: React.FC<ActionButtonProps> = ({
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  fullWidth = true,
  size = 'md',
  icon,
  className = '',
}) => {
  const baseClass = 'font-bold rounded-lg transition-all duration-300 flex items-center justify-center gap-2';
  
  const variantClass = {
    primary: 'bg-green-600 hover:bg-green-700 text-white disabled:bg-gray-400',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800 disabled:bg-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white disabled:bg-gray-400',
    success: 'bg-green-500 hover:bg-green-600 text-white disabled:bg-gray-400',
  }[variant];

  const sizeClass = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-3 text-base',
    lg: 'px-6 py-4 text-lg',
  }[size];

  const widthClass = fullWidth ? 'w-full' : 'w-auto';

  return (
    <Button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClass} ${variantClass} ${sizeClass} ${widthClass} ${className}`}
    >
      {loading ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          {label}
        </>
      ) : (
        <>
          {icon}
          {label}
        </>
      )}
    </Button>
  );
};
