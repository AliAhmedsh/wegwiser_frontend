import React from 'react';
import {
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import { Open_Sans } from 'next/font/google';

const options = [
  'Product workspace',
  'Design workspace',
  'Engineering workspace',
];

const OpenSans400 = Open_Sans({
  weight: ['400'],
  subsets: ['cyrillic'],
});

export default function MainWorkspacePopup({
  onSelect,
}: {
  onSelect: (option: string) => void;
}) {
  return (
    <DropdownMenuContent
      className={`mr-50 mb-2 bg-white min-w-[200px] border-none ${OpenSans400.className}`}
      style={{
        boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
      }}
    >
      {options.map((option) => (
        <DropdownMenuItem
          key={option}
          className="text-sm font-normal cursor-pointer hover:bg-gray-100 rounded-sm px-2 py-1 transition-all"
          onClick={() => onSelect(option)}
        >
          {option}
        </DropdownMenuItem>
      ))}
    </DropdownMenuContent>
  );
}
