'use client';

import React, { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
  text: string;
  title?: string;
  onChangeAction: (newText: string) => void;
  //insert this string after value
  valueDimension?: string;
}

export const EditableNumberInput: React.FC<EditableTextProps> = ({ text, onChangeAction, title, valueDimension }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);

  const inputRef = useRef<HTMLInputElement | null>(null);

  // Update local value when prop changes
  useEffect(() => {
    setValue(Number(text).toFixed(0).toString());
  }, [text]);

  // Auto-focus input when entering edit mode
  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  const handleDoubleClick = () => {
    setEditing(true);
  };

  const handleBlur = () => {
    setEditing(false);
    onChangeAction(value);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setEditing(false);
      onChangeAction(value);
    }
  };

  return (
    <div className={'w-full flex flex-row items-center gap-2'}>
      <p >{`${ title } : `}</p>
      {editing ? (
        <input
          ref={inputRef}
          type='number'
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className="border-b border-gray-300 outline-none focus:border-blue-500 px-1 w-15"
        />
      ) : (
        <p
          onDoubleClick={handleDoubleClick}
          className="cursor-text inline-block"
        >
          {Number(text).toFixed(0)}
        </p>
      )}
      <p>{valueDimension}</p>
    </div>
  );
};
