import React, { useEffect, useRef, useState } from 'react';

interface InlineCreateInputProps {
  type: 'file' | 'folder';
  onConfirm: (name: string) => void;
  onCancel: () => void;
  parentId?: string;
}

const InlineCreateInput: React.FC<InlineCreateInputProps> = ({
  type,
  onConfirm,
  onCancel,
  parentId,
}) => {
  const [name, setName] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (name.trim()) {
        onConfirm(name.trim());
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onCancel();
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    // Remove focus ring
    e.target.style.boxShadow = 'none';
    
    // Handle confirmation/cancellation
    setTimeout(() => {
      if (name.trim()) {
        onConfirm(name.trim());
      } else {
        onCancel();
      }
    }, 100);
  };

  return (
    <div className="flex items-center gap-1 py-1">
      <div className="w-4 h-4 flex items-center justify-center">
        {type === 'folder' ? (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-blue-500">
            <path d="M13.5 2h-11C1.67 2 1 2.67 1 3.5v9c0 .83.67 1.5 1.5 1.5h11c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5zM13 12.5c0 .28-.22.5-.5.5h-11c-.28 0-.5-.22-.5-.5v-9c0-.28.22-.5.5-.5h11c.28 0 .5.22.5.5v9z"/>
          </svg>
        ) : (
          <svg width="12" height="12" viewBox="0 0 16 16" fill="currentColor" className="text-gray-500">
            <path d="M13.5 2h-11C1.67 2 1 2.67 1 3.5v9c0 .83.67 1.5 1.5 1.5h11c.83 0 1.5-.67 1.5-1.5v-9c0-.83-.67-1.5-1.5-1.5zM13 12.5c0 .28-.22.5-.5.5h-11c-.28 0-.5-.22-.5-.5v-9c0-.28.22-.5.5-.5h11c.28 0 .5.22.5.5v9z"/>
          </svg>
        )}
      </div>
      
      <div className="flex items-center gap-1 flex-1">
        <input
          ref={inputRef}
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={handleKeyDown}
          onBlur={handleBlur}
          placeholder={type === 'file' ? 'e.g., test.py, test.js' : `New ${type} name`}
          className="flex-1 px-1 py-0.5 text-sm rounded bg-white focus:outline-none"
          style={{
            border: `1px solid #627899`,
            boxShadow: 'none'
          }}
          onFocus={(e) => {
            e.target.style.boxShadow = `0 0 0 1px #627899`;
          }}
        />
      </div>
    </div>
  );
};

export default InlineCreateInput;
