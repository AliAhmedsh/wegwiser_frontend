import React, { useRef, useEffect } from 'react';
import { useUIStore } from '@/workspaces/designWorkspace/store/useUI.store';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';
import { InclinedOption } from '@/workspaces/designWorkspace/types';
import { ChevronDown, CircleIcon, HexagonIcon, SquareIcon, StarIcon } from 'lucide-react';
import { ToolbarShapeMenuOption } from '@/workspaces/designWorkspace/components/toolbar/MenuOption/ToolBarMenuOption';
import LineIcon from '@/shared/icons/LineIcon';
import ArrowIcon from '@/shared/icons/ArrowIcon';
import ImageIcon from '@/shared/icons/ImageIcon';

// Define your inclined options with icon (mock example icons)
export const inclinedOptions: InclinedOption[] = [
  { name: 'line', label: 'Line', icon: LineIcon, hotkeyTitle: 'L' },
  { name: 'rectangle', label: 'Rectangle', icon: SquareIcon, hotkeyTitle : 'R' },
  { name: 'arrow', label: 'Arrow', icon: ArrowIcon, hotkeyTitle: 'Shift+L' },
  { name: 'ellipse', label: 'Ellipse', icon: CircleIcon, hotkeyTitle : 'O' },
  { name: 'polygon', label: 'Polygon', icon: HexagonIcon},
  { name: 'star', label: 'Star', icon: StarIcon },
  { name: 'image', label: 'Image/Video', icon: ImageIcon, hotkeyTitle: 'Ctrl+Shift+K' },
];

export const ToolbarInclinedMenu: React.FC = () => {
  const inclinedMenuRef = useRef<HTMLDivElement>(null);
  const { showInclinedMenu, setShowInclinedMenu } = useUIStore();
  const { selectedTool, setSelectedTool } = useToolStore();

  const currentInclined = selectedTool.type === 'inclined' ? inclinedOptions.find(opt => opt.name === selectedTool.option) || inclinedOptions[0] : inclinedOptions[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (inclinedMenuRef.current && !inclinedMenuRef.current.contains(e.target as Node)) {
        setShowInclinedMenu(false);
      }
    }

    if (showInclinedMenu) {
      window.addEventListener('mousedown', handleClick);
    }
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showInclinedMenu, setShowInclinedMenu]);
  const isInclined = selectedTool.type === 'inclined';
  return (
    <div className="relative flex items-center gap-1">
      <button
        className={`p-2 rounded-lg stroke-0 hover:bg-black/50 hover:text-white  transition cursor-pointer ${isInclined && 'bg-black  text-white '}`}
        onClick={() => {
          setSelectedTool({ type: 'inclined', option: currentInclined.name });
          setShowInclinedMenu(!showInclinedMenu);
        }}
      >
        <span className={`flex items-center gap-1 `}>
          <currentInclined.icon />
          <ChevronDown size={12} />
        </span>
      </button>
      {showInclinedMenu && (
        <div ref={inclinedMenuRef}
             className="absolute left-0 bottom-full mb-2 bg-white border rounded shadow z-50 min-w-[120px]">
          {inclinedOptions.map(opt => {
            const isSuchInlinedSelected:boolean = selectedTool.type === 'inclined' && selectedTool.option === opt.name ;
            const handleOnClick = () => {
              setSelectedTool({ type: 'inclined', option: opt.name });
              setShowInclinedMenu(false);
            };
            return (
              <ToolbarShapeMenuOption key={opt.name}
                                      Icon={opt.icon}
                                      label={opt.label}
                                      hotkey={opt.hotkeyTitle}
                                      onClick={handleOnClick}
                                      isSuchToolSelected={isSuchInlinedSelected} />
            );
            },
          )
          }
        </div>
      )}
    </div>
  );
};
