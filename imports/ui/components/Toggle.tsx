import React, { useState } from 'react';

interface ToggleProps {
  label?: string;
  initial?: boolean;
  onToggle?: (state: boolean) => void;
  size?: 'sm' | 'md' | 'lg';
}

const sizeMap = {
    sm: {
      container: 'w-12 h-6',
      knob: 'w-4 h-4',
      translateX: 'translate-x-6',
    },
    md: {
      container: 'w-16 h-8',
      knob: 'w-6 h-6',
      translateX: 'translate-x-8',
    },
    lg: {
      container: 'w-24 h-12',
      knob: 'w-8 h-8',
      translateX: 'translate-x-12',
    },
  };

export const Toggle: React.FC<ToggleProps> = ({ label = '', initial = false, onToggle, size = 'md' }) => {
  const [enabled, setEnabled] = useState<boolean>(initial);
  const currentSize = sizeMap[size];

  const handleToggle = () => {
    const newState = !enabled;
    setEnabled(newState);
    if (onToggle) onToggle(newState);
  };

  return (
    <button
      onClick={handleToggle}
      className={`rounded-full p-1 transition-colors duration-300 focus:outline-none
        ${enabled ? 'bg-[#8e3e44]' : 'bg-[#eaf0ff]'} ${currentSize.container}`}
    >
      <div
        className={`rounded-full transition-transform duration-300
          ${enabled ? `bg-[#d1727a] ${currentSize.translateX}` : `bg-[#d1727a]`} ${currentSize.knob}`}
      />
    </button>
  );
};

