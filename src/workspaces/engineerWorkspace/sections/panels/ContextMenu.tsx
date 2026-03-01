import React, { useEffect, useRef } from 'react';
import { WorkspaceFile } from '../../store/store';

interface ContextMenuProps {
  x: number;
  y: number;
  onClose: () => void;
  onNewFile: () => void;
  onNewFolder: () => void;
  onRename?: () => void;
  onDelete?: () => void;
  selectedItem?: WorkspaceFile | null;
}

const ContextMenu: React.FC<ContextMenuProps> = ({
  x,
  y,
  onClose,
  onNewFile,
  onNewFolder,
  onRename,
  onDelete,
  selectedItem,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
    };
  }, [onClose]);

 
  const [position, setPosition] = React.useState({ x, y });

  React.useEffect(() => {
    if (menuRef.current) {
      const menu = menuRef.current;
      const menuRect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      
      let adjustedX = x;
      let adjustedY = y;
      
   
      if (x < 0) {
        adjustedX = 5; 
      }
      

      if (x + menuRect.width > viewportWidth) {
        adjustedX = viewportWidth - menuRect.width - 5;
      }
      
      
      if (y < 0) {
        adjustedY = 5;
      }
      
 
      if (y + menuRect.height > viewportHeight) {
        adjustedY = viewportHeight - menuRect.height - 5;
      }
      
      setPosition({ x: adjustedX, y: adjustedY });
    }
  }, [x, y]);

  return (
    <div
      ref={menuRef}
      className="fixed z-50 bg-white border border-[rgba(83,83,84,0.2)] rounded-[12px] shadow-xl py-2 min-w-[180px] backdrop-blur-sm"
      style={{
        left: position.x,
        top: position.y,
        boxShadow: '0px 8px 32px rgba(0, 0, 0, 0.12), 0px 2px 16px rgba(0, 0, 0, 0.08), 0px 0px 0px 1px rgba(255, 255, 255, 0.05)'
      }}
    >
      <div className="text-[#181818] text-sm">
        {/* New File */}
        <div
          className="px-4 py-2.5 hover:bg-[#f8f9fa] cursor-pointer flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] rounded-[8px] mx-1"
          onClick={onNewFile}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14,2 14,8 20,8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10,9 9,9 8,9"/>
          </svg>
          <span className="font-medium text-[#2d3748]">New File...</span>
        </div>

        <div
          className="px-4 py-2.5 hover:bg-[#f8f9fa] cursor-pointer flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] rounded-[8px] mx-1"
          onClick={onNewFolder}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
            <path d="M12 11v6"/>
            <path d="M9 14h6"/>
          </svg>
          <span className="font-medium text-[#2d3748]">New Folder...</span>
        </div>

      
        <div className="border-t border-[rgba(83,83,84,0.15)] my-2 mx-3"></div>

       
        {selectedItem && (
          <div
            className="px-4 py-2.5 hover:bg-[#f8f9fa] cursor-pointer flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] rounded-[8px] mx-1"
            onClick={onRename}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#4a5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            <span className="font-medium text-[#2d3748]">Rename</span>
          </div>
        )}

       
        {selectedItem && (
          <div
            className="px-4 py-2.5 hover:bg-[#fef2f2] cursor-pointer flex items-center gap-3 transition-all duration-200 hover:scale-[1.02] rounded-[8px] mx-1 group"
            onClick={onDelete}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:stroke-red-600">
              <polyline points="3,6 5,6 21,6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
            <span className="font-medium text-[#ef4444] group-hover:text-red-600">Delete</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContextMenu;
