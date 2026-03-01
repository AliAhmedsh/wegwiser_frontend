'use client';
import React from 'react';

interface ColorPickerProps {
  label: string;
  color: string | undefined;
  onChangeAction: (newColor: string) => void;
}

// Helper to convert named colors to hex
const getHexColor = (color: string): string => {
  const ctx = document.createElement('canvas').getContext('2d');
  if (!ctx) return '#000000';
  ctx.fillStyle = color;
  return ctx.fillStyle;
};

export const ColorPicker: React.FC<ColorPickerProps> = ({ label, color = '#000000', onChangeAction }) => {
  // Convert to hex if it's a named color
  const hexColor = getHexColor(color);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChangeAction(e.target.value);
  };

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm">{`${label}: `}</label>
      <input
        type="color"
        value={hexColor}
        onChange={handleChange}
        className="w-8 h-6 p-0 border-none bg-transparent cursor-pointer"
      />
    </div>
  );
};
