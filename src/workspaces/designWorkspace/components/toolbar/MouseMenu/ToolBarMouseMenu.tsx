import React, { useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { mouseOptions } from '@/workspaces/designWorkspace/lib/toolbar/mouse';
import { useUIStore } from '@/workspaces/designWorkspace/store/useUI.store';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';
import { ToolbarShapeMenuOption } from '@/workspaces/designWorkspace/components/toolbar/MenuOption/ToolBarMenuOption';

export const ToolbarMouseMenu: React.FC = () => {
  const mouseMenuRef = useRef<HTMLDivElement>(null);
  const { selectedTool, setSelectedTool } = useToolStore();
  const { showMouseMenu, setShowMouseMenu } = useUIStore();

  const currentMouseOption = selectedTool.type === "mouse" ? mouseOptions.find(opt => opt.name === selectedTool.option)??mouseOptions[0] : mouseOptions[0];

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (mouseMenuRef.current && !mouseMenuRef.current.contains(e.target as Node)) {
        setShowMouseMenu(false);
      }
    }

    if (showMouseMenu) {
      window.addEventListener('mousedown', handleClick);
    }
    return () => window.removeEventListener('mousedown', handleClick);
  }, [showMouseMenu, setShowMouseMenu]);

  return (
    <div className="relative flex items-center gap-1">
      <button
        className={`flex justify-center items-center p-2 rounded-lg hover:bg-black/50 hover:text-white transition cursor-pointer ${selectedTool.type === 'mouse' ? 'bg-black text-white' : ''}`}
        onClick={() => {
          setShowMouseMenu(!showMouseMenu);
          if(selectedTool.type !== 'mouse') setSelectedTool({type:'mouse', option: 'move'});
        }}
      >
        <currentMouseOption.icon className="w-5 h-5" />
        <ChevronDown size={12} />
      </button>
      {showMouseMenu && (
        <div ref={mouseMenuRef}
             className="absolute left-0 bottom-full mb-2 bg-white border rounded shadow z-50 min-w-[180px] py-2 px-2 flex flex-col gap-1">
          {mouseOptions.map(opt => {

            const isSuchMouseSelected:boolean = selectedTool.type === 'mouse' && selectedTool.option === opt.name ;
            const handleOnClick = () => {
              setSelectedTool({ type: 'mouse', option: opt.name });
              setShowMouseMenu(false);
            };
            return (
              <ToolbarShapeMenuOption key={opt.name}
                                      Icon={opt.icon}
                                      label={opt.label}
                                      hotkey={opt.hotkeyTitle}
                                      onClick={handleOnClick}
                                      isSuchToolSelected={isSuchMouseSelected} />
            );
          })}
        </div>
      )}
    </div>
  );
};
