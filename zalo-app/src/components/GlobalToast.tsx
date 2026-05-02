import React from 'react';
import { Box, Text } from 'zmp-ui';
import { useGameStore } from '@/store/useGameStore';

interface GlobalToastProps {
  // Toast state is managed by Zustand store
}

export const GlobalToast: React.FC<GlobalToastProps> = () => {
  const toast = useGameStore((state) => state.toast);
  const [visible, setVisible] = React.useState(false);

  React.useEffect(() => {
    if (toast) {
      setVisible(true);
      const timer = setTimeout(() => setVisible(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  if (!toast || !visible) return null;

  const isSuccess = toast.type === 'success';
  const bgColor = isSuccess
    ? 'bg-gradient-to-r from-green-500 to-green-600'
    : 'bg-gradient-to-r from-red-500 to-red-600';
  const icon = isSuccess ? '✓' : '✕';

  return (
    <Box
      className={`fixed bottom-24 left-4 right-4 max-w-md mx-auto ${bgColor} text-white rounded-lg shadow-2xl p-4 flex items-center gap-3 animated transition-all duration-300 ${
        visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
      } z-[9999]`}
    >
      <Text className="text-2xl">{icon}</Text>
      <Box className="flex-1">
        <Text size="small" className="font-semibold">
          {toast.message}
        </Text>
      </Box>
      <button
        onClick={() => setVisible(false)}
        className="flex-shrink-0 w-6 h-6 flex items-center justify-center hover:bg-white/20 rounded"
      >
        ✕
      </button>
    </Box>
  );
};
