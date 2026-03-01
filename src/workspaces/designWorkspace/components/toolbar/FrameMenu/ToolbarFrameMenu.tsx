import React, { useRef, useEffect } from 'react';
import { useUIStore } from '@/workspaces/designWorkspace/store/useUI.store';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';
import { FrameOption } from '@/workspaces/designWorkspace/types';
import { ChevronDown } from 'lucide-react';
import { ToolbarShapeMenuOption } from '@/workspaces/designWorkspace/components/toolbar/MenuOption/ToolBarMenuOption';
import SliceIcon from '@/shared/icons/SliceIcon';
import FrameIcon from '@/shared/icons/FrameIcon';
import SectionIcon from '@/shared/icons/SectionIcon';

// Define your frame options with icon (mock example icons)
export const frameOptions: FrameOption[] = [
  { name: 'frame', label: 'Frame', icon: FrameIcon, hotkeyTitle:"F" },
  { name: 'section', label: 'Section', icon: SectionIcon, hotkeyTitle:"Shift+S" },
  { name: 'slice', label: 'Slice', icon: SliceIcon, hotkeyTitle:"K" },
];

export const ToolbarFrameMenu: React.FC = () => {
  const frameMenuRef = useRef<HTMLDivElement>(null);
  const { showFrameMenu, setShowFrameMenu } = useUIStore();
  const { selectedTool, setSelectedTool } = useToolStore();

  const currentFrame = selectedTool.type === 'frame' ? frameOptions.find(opt => opt.name === selectedTool.option) || frameOptions[0] : frameOptions[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (frameMenuRef.current && !frameMenuRef.current.contains(e.target as Node)) {
        setShowFrameMenu(false);
      }
    }

    if (showFrameMenu) {
      window.addEventListener('mousedown', handleClick);
    }
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showFrameMenu, setShowFrameMenu]);

  return (
    <div className="relative flex items-center gap-1">
      <button
        className={`p-2 rounded-lg hover:bg-black/50 hover:text-white transition cursor-pointer ${selectedTool.type === 'frame' ? 'bg-black text-white' : ''}`}
        onClick={() => {
          setSelectedTool({ type: 'frame', option: currentFrame.name });
          setShowFrameMenu(!showFrameMenu);
        }}
      >
        <span className="flex items-center gap-1">
          <currentFrame.icon />
          <ChevronDown size={12} />
        </span>
      </button>
      {showFrameMenu && (
        <div ref={frameMenuRef} className="absolute left-0 bottom-full mb-2 bg-white border rounded shadow z-50 min-w-[120px]">
          {frameOptions.map(opt => {
            const isSuchFrameSelected:boolean = selectedTool.type === 'frame' && selectedTool.option === opt.name ;
              const handleOnClick = () => {
                setSelectedTool({ type: 'frame', option: opt.name });
                setShowFrameMenu(false);
              };
              return (
                <ToolbarShapeMenuOption key={opt.name}
                                        Icon={opt.icon}
                                        label={opt.label}
                                        hotkey={opt.hotkeyTitle}
                                        onClick={handleOnClick}
                                        isSuchToolSelected={isSuchFrameSelected} />
              );
          }
          )}
        </div>
      )}
    </div>
  );
};
