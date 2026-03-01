import React, { useRef, useEffect } from 'react';
import { useUIStore } from '@/workspaces/designWorkspace/store/useUI.store';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';
import { PenOption } from '@/workspaces/designWorkspace/types';
import { ChevronDown } from 'lucide-react';
import { ToolbarShapeMenuOption } from '@/workspaces/designWorkspace/components/toolbar/MenuOption/ToolBarMenuOption';
import PenIcon from '@/shared/icons/PenIcon';
import PencilIcon from '@/shared/icons/PencilIcon';

// Define your inclined options with icon (mock example icons)
const penOptions: PenOption[] = [
  { name: 'pen', label: 'Pen', icon: PenIcon, hotkeyTitle:"P" },
  { name: 'pencil', label: 'Pencil', icon: PencilIcon, hotkeyTitle:"Shift+P" },
];

export const ToolbarPenMenu: React.FC = () => {
  const inclinedMenuRef = useRef<HTMLDivElement>(null);
  const { showPenMenu, setShowPenMenu } = useUIStore();
  const { selectedTool, setSelectedTool } = useToolStore();

  const currentPen = selectedTool.type === 'pen' ? penOptions.find(opt => opt.name === selectedTool.option) || penOptions[0] : penOptions[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (inclinedMenuRef.current && !inclinedMenuRef.current.contains(e.target as Node)) {
        setShowPenMenu(false);
      }
    }

    if (showPenMenu) {
      window.addEventListener('mousedown', handleClick);
    }
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showPenMenu, setShowPenMenu]);
  const isPen = selectedTool.type === 'pen';
  return (
    <div className="relative flex items-center gap-1">
      <button
        className={`p-2 rounded-lg stroke-0 hover:bg-black/50 hover:text-white  transition cursor-pointer ${isPen && 'bg-black  text-white '}`}
        onClick={() => {
          setSelectedTool({ type: 'pen', option: currentPen.name });
          setShowPenMenu(!showPenMenu);
        }}
      >
        <span className={`flex items-center gap-1 `}>
          <currentPen.icon />
          <ChevronDown size={12} />
        </span>
      </button>
      {showPenMenu && (
        <div ref={inclinedMenuRef}
             className="absolute left-0 bottom-full mb-2 bg-white border rounded shadow z-50 min-w-[120px]">
          {penOptions.map(opt => {
              const isSuchPenSelected: boolean = selectedTool.type === 'pen' && selectedTool.option === opt.name;
              const handleOnClick = () => {
                setSelectedTool({ type: 'pen', option: opt.name });
                setShowPenMenu(false);
              };
              return (
                <ToolbarShapeMenuOption key={opt.name}
                                        Icon={opt.icon}
                                        label={opt.label}
                                        hotkey={opt.hotkeyTitle}
                                        onClick={handleOnClick}
                                        isSuchToolSelected={isSuchPenSelected} />
              );
            },
          )
          }
        </div>
      )}
    </div>
  );
};
