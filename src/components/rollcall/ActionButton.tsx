import React from 'react';

type ActionButtonProps = {
  onClick: () => void;
  disabled: boolean;
  label: string;
};

export const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled, label }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`flex w-full justify-center p-3 text-white rounded-xl transition-colors ${
      disabled ? 'bg-gray-400 cursor-not-allowed' : 'bg-sky-500 hover:bg-sky-600'
    }`}
  >
    {label}
  </button>
);
