import React from 'react';
import { Box, Text } from 'zmp-ui';

interface FormInputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'tel' | 'number' | 'date' | 'textarea';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  error?: string;
  disabled?: boolean;
  required?: boolean;
  rows?: number;
  icon?: string;
  hint?: string;
}

export const FormInput: React.FC<FormInputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  error,
  disabled = false,
  required = false,
  rows = 4,
  icon,
  hint,
}) => {
  const inputClass = `w-full px-4 py-3 border-2 rounded-lg font-medium transition-all duration-300 ${
    icon ? 'pl-12' : ''
  } ${
    error
      ? 'border-red-500 focus:border-red-600 bg-red-50'
      : 'border-gray-300 focus:border-green-600 bg-gray-50 hover:bg-white'
  } ${disabled ? 'bg-gray-100 text-gray-500 cursor-not-allowed' : ''}`;

  return (
    <Box className="w-full mb-4">
      {label && (
        <Box className="flex items-center gap-1 mb-2">
          <Text size="small" className="font-semibold text-gray-700">
            {label}
          </Text>
          {required && <Text className="text-red-500 text-lg">*</Text>}
        </Box>
      )}

      <Box className="relative">
        {icon && (
          <Text className="absolute left-3 top-1/2 transform -translate-y-1/2 text-xl">
            {icon}
          </Text>
        )}

        {type === 'textarea' ? (
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows}
            className={`${inputClass} resize-none`}
          />
        ) : (
          <input
            type={type}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            disabled={disabled}
            className={inputClass}
          />
        )}
      </Box>

      {error && (
         <Text size="xSmall" className="text-red-600 mt-2 font-semibold">
          ✗ {error}
        </Text>
      )}

      {hint && !error && (
        <Text size="xSmall" className="text-gray-600 mt-2">
          ℹ️ {hint}
        </Text>
      )}
    </Box>
  );
};
