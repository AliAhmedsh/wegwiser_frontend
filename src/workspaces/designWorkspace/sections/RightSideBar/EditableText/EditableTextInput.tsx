'use client';

import React, { useState, useRef, useEffect } from 'react';

interface EditableTextProps {
  text: string;
  title?: string;
  className?: string;
  onChangeAction: (newText: string) => void;
}

export const EditableTextInput: React.FC<EditableTextProps> = ({ text, onChangeAction, title, className }) => {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(text);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const spanRef = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editing]);

  useEffect(() => {
    if (spanRef.current && inputRef.current) {
      const width = spanRef.current.offsetWidth;
      inputRef.current.style.width = `${width + 2}px`; // +2 for small padding
    }
  }, [value]);

  const handleDoubleClick = () => setEditing(true);

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
    <div className={`w-full flex flex-row items-center gap-2 ${className}`}>
      {title && <p>{`${title} : `}</p>}
      {editing ? (
        <>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onBlur={handleBlur}
            onKeyDown={handleKeyDown}
            className="border-b border-gray-300 outline-none focus:border-blue-500 px-1"
            style={{ width: 'auto' }}
          />
          {/* Hidden span to measure text width */}
          <span
            ref={spanRef}
            className="invisible absolute whitespace-pre px-1 font-normal"
            style={{ position: 'absolute', top: '-9999px', left: '-9999px' }}
          >
            {value || ' '}
          </span>
        </>
      ) : (
        <p
          onDoubleClick={handleDoubleClick}
          className="cursor-text inline-block"
        >
          {text}
        </p>
      )}
    </div>
  );
};
