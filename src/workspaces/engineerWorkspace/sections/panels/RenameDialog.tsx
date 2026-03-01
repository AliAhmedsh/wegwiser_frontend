import ConfirmBtn from '@/shared/ui/confirmBtn';
import React, { useEffect, useRef, useState } from 'react';
import { WorkspaceFile } from '../../store/store';

interface RenameDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (newName: string) => void;
  file: WorkspaceFile | null;
}

const RenameDialog: React.FC<RenameDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  file,
}) => {
  const [newName, setNewName] = useState('');
  const [error, setError] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && file) {
     
      const nameWithoutExt = file.name.includes('.') 
        ? file.name.substring(0, file.name.lastIndexOf('.'))
        : file.name;
      setNewName(nameWithoutExt);
      setError('');
      
      setTimeout(() => {
        if (inputRef.current) {
          inputRef.current.focus();
          inputRef.current.select();
        }
      }, 100);
    }
  }, [isOpen, file]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newName.trim()) {
      setError('File name cannot be empty');
      return;
    }

    if (newName.trim() === file?.name) {
      onClose();
      return;
    }


    const invalidChars = /[<>:"/\\|?*]/;
    if (invalidChars.test(newName)) {
      setError('File name contains invalid characters');
      return;
    }


    const fullName = file?.name.includes('.') 
      ? `${newName.trim()}.${file.name.split('.').pop()}`
      : newName.trim();

    onConfirm(fullName);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen || !file) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 transition-opacity duration-300">
      <div 
        className="bg-white p-6 rounded-[12px] shadow-2xl max-w-[400px] w-[90%] animate-fade-in"
        style={{
          boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12), 0px 2px 8px rgba(0, 0, 0, 0.08)'
        }}
      >
        <div className="text-center mb-6">
          <h2 className="text-[18px] font-semibold text-[#181818] mb-2">
            Rename File
          </h2>
          <p className="text-[14px] text-[#666666]">
            Enter a new name for <span className="font-medium text-[#535354]">"{file.name}"</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[13px] font-medium text-[#535354] mb-2">
              File Name
            </label>
            <input
              ref={inputRef}
              type="text"
              value={newName}
              onChange={(e) => {
                setNewName(e.target.value);
                setError('');
              }}
              onKeyDown={handleKeyDown}
              className="w-full h-10 px-3 py-2 text-sm border border-[rgba(83,83,84,0.3)] rounded-[8px] focus:outline-none focus:ring-2 focus:ring-[#007ACC] focus:border-transparent transition-all duration-200"
              placeholder="Enter file name"
              autoComplete="off"
            />
            {error && (
              <p className="text-[12px] text-red-500 mt-1">{error}</p>
            )}
          </div>

          <div className="flex gap-3 pt-2">
            <div className="flex-1">
              <ConfirmBtn
                text="Cancel"
                onClick={onClose}
                isWhite
                className="h-[40px]"
                style={{
                  boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
                }}
              />
            </div>
            <div className="flex-1">
              <ConfirmBtn
                text="Rename"
                onClick={handleSubmit}
                className="h-[40px]"
                style={{
                  boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
                }}
              />
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RenameDialog;
