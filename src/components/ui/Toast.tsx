'use client';

import { useEffect } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  message: string;
  type?: 'success' | 'error';
  onClose: () => void;
}

export function Toast({ message, type = 'success', onClose }: ToastProps) {
  useEffect(() => {
    const timer = setTimeout(onClose, 2000);
    return () => clearTimeout(timer);
  }, [onClose]);

  // Only render on client
  if (typeof window === 'undefined') return null;

  return createPortal(
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div 
        className={`
          rounded-lg px-4 py-3 shadow-lg
          ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}
          text-white
        `}
      >
        {message}
      </div>
    </div>,
    document.body
  );
} 