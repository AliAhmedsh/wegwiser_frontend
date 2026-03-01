'use client';

import React from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../../../../components/ui/select';

interface FontFamilySelectProps {
  fonts: string[];
  onChange: (fontName: string) => void;
  value?: string;
}

const FontFamilySelect: React.FC<FontFamilySelectProps> = ({ fonts, onChange, value }) => {
  return (
    <div className="w-full">
      <Select onValueChange={onChange} value={value}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Select font" />
        </SelectTrigger>
        <SelectContent>
          {fonts.map((font) => (
            <SelectItem key={font} value={font} style={{ fontFamily: font }}>
              {font}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default FontFamilySelect;
