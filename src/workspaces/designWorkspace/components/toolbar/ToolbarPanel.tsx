import React, { useRef } from 'react';
import { toolsOptions } from '@/workspaces/designWorkspace/lib/toolbar/tools';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';
import { useUIStore } from '@/workspaces/designWorkspace/store/useUI.store';
import { Tool } from '@/workspaces/designWorkspace/types';
import { ToolbarMouseMenu } from '@/workspaces/designWorkspace/components/toolbar/MouseMenu/ToolBarMouseMenu';
import { ToolbarShapeMenu } from '@/workspaces/designWorkspace/components/toolbar/ShapeMenu/ToolbarShapeMenu';
import { ToolbarFrameMenu } from '@/workspaces/designWorkspace/components/toolbar/FrameMenu/ToolbarFrameMenu';
import {
    ToolbarInclinedMenu
} from '@/workspaces/designWorkspace/components/toolbar/InclinedMenu/ToolbarInclinedMenu';
import { ToolbarPenMenu } from '@/workspaces/designWorkspace/components/toolbar/PenMenu/ToolbarPenMenu';




export const ToolbarPanel: React.FC = ({}) => {
    const shapeMenuRef = useRef<HTMLDivElement>(null);
    const mouseMenuRef = useRef<HTMLDivElement>(null);
    const {selectedTool,setSelectedTool} = useToolStore()
    const {showShapeMenu,setShowShapeMenu,setShowMouseMenu,showMouseMenu} = useUIStore()
    const onToolSelect = (tool: Tool) => {
        setSelectedTool(tool);
    };

    React.useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (shapeMenuRef.current && !shapeMenuRef.current.contains(e.target as Node)) {
                setShowShapeMenu(false);
            }
            if (mouseMenuRef.current && !mouseMenuRef.current.contains(e.target as Node)) {
                setShowMouseMenu(false);
            }
        }
        if (showShapeMenu || showMouseMenu) {
            window.addEventListener('mousedown', handleClick);
        }
        return () => window.removeEventListener('mousedown', handleClick);
    }, [showShapeMenu, showMouseMenu, setShowMouseMenu, setShowShapeMenu]);

    return (
        <div className=" bg-white rounded-2xl shadow-xl border border-[#E8E8E8] flex items-center gap-3 px-6 py-3 z-30">
            {toolsOptions.map(({ name, icon: Icon }) => {
                if (name === 'mouse') return <ToolbarMouseMenu key={'mouse'}/>
                if (name === 'shapes') return <ToolbarShapeMenu key={'shapes'}/>
                if (name === 'frame') return <ToolbarFrameMenu key={'frame'}/>
                if (name === 'inclined') return <ToolbarInclinedMenu key={'inclined'}/>
                if (name === 'pen') return <ToolbarPenMenu key={'pen'}/>
                return (
                    <button
                        key={name}
                        className={`p-2 rounded-lg fill-black hover:bg-black/50 hover:text-white transition cursor-pointer ${selectedTool.type === name ? 'bg-black text-white stroke-white ' : ''}`}
                        onClick={() => onToolSelect({type: name})}>
                        <Icon/>
                    </button>
                );
            })}
        </div>
    );
}; 
