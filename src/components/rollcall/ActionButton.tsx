import React from 'react';

type ActionButtonProps = {
  onClick: () => void | Promise<void>;
  disabled?: boolean;
  label: string;
  className?: string;
};

export const ActionButton: React.FC<ActionButtonProps> = ({
  onClick,
  disabled = false,
  label,
  className = '',
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex w-full justify-center p-3 rounded-xl transition-all font-bold shadow-sm active:scale-[0.98] ${
      disabled
        ? 'bg-gray-200 text-gray-400 cursor-not-allowed border border-transparent'
        : 'bg-blue-600 text-white hover:bg-blue-700 border border-transparent'
    } ${className}`}
  >
    {label}
  </button>
);
