import React, { useRef, useEffect } from 'react';
import { shapeOptions } from '@/workspaces/designWorkspace/lib/toolbar/shapes';
import { useUIStore } from '@/workspaces/designWorkspace/store/useUI.store';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';
import { isShapeTool } from '@/workspaces/designWorkspace/types/toolbar/typeGuards';
import { ToolbarShapeMenuOption } from '@/workspaces/designWorkspace/components/toolbar/MenuOption/ToolBarMenuOption';

export const ToolbarShapeMenu: React.FC = () => {
  const shapeMenuRef = useRef<HTMLDivElement>(null);
  const { showShapeMenu, setShowShapeMenu } = useUIStore();
  const { selectedTool, setSelectedTool } = useToolStore();
  const currentShape = isShapeTool(selectedTool) && shapeOptions.find(opt => opt.name === selectedTool.option) || shapeOptions[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (shapeMenuRef.current && !shapeMenuRef.current.contains(e.target as Node)) {
        setShowShapeMenu(false);
      }
    }

    if (showShapeMenu) {
      window.addEventListener('mousedown', handleClick);
    }
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showShapeMenu, setShowShapeMenu]);

  return (
    <div className="relative flex items-center gap-1">
      <button
        className={`p-2 rounded-lg hover:bg-black/50 hover:text-white transition cursor-pointer ${selectedTool.type === 'shapes' ? 'bg-black text-white' : ''}`}
        onClick={() => {
          setSelectedTool({ type: 'shapes', option: currentShape.name });
          setShowShapeMenu(!showShapeMenu);
        }}
      >
        <span className="flex items-center gap-1">
          <currentShape.icon className="w-5 h-5" />
        </span>
      </button>
      {showShapeMenu &&
        <div ref={shapeMenuRef}
             className="absolute left-0 bottom-full mb-2 bg-white border rounded shadow z-50 min-w-[120px]">
          {shapeOptions.map(opt => {
              const isSuchShapeSelected: boolean = selectedTool.type === 'shapes' && selectedTool.option === opt.name;
              const handleOnClick = () => {
                setSelectedTool({ type: 'shapes', option: opt.name });
                setShowShapeMenu(false);
              };
              return (
                <ToolbarShapeMenuOption key={opt.name}
                                        Icon={opt.icon}
                                        label={opt.label}
                                        hotkey={opt.hotkeyTitle}
                                        onClick={handleOnClick}
                                        isSuchToolSelected={isSuchShapeSelected} />
              );
            },
          )
          }

        </div>}
    </div>
  );
};
