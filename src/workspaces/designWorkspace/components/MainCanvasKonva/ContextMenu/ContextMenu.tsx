import React, { useEffect } from 'react';
import { useContextMenuStore } from '@/workspaces/designWorkspace/store/contextMenu.store';
import { useDesignWorkspaceStore } from '@/workspaces/designWorkspace/store/designWorkspace.store';
import { Button } from '@/workspaces/designWorkspace/components/ui/button';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { useSelectedInstances } from '@/workspaces/designWorkspace/store/selectedInstances.store';


const ContextMenu: React.FC = ({}) => {
  const {showMenu,setShowMenu, menuPosition,selectedId} = useContextMenuStore()
  const {setSelectedInstancesIds} = useSelectedInstances()
  const {stageRef} = useDesignWorkspaceStore()
  const {deleteInstance} = useCanvasLayersStore()
  const shiftStage = stageRef?.current?.position() ?? {x: 0, y: 0};
  useEffect(() => {
    // Hide menu on window click
    const handleWindowClick = () => {
      setShowMenu(false);
    };
    window.addEventListener('click', handleWindowClick);

    return () => {
      window.removeEventListener('click', handleWindowClick);
    };
  }, [setShowMenu]);
  const handleDelete = () => {
    if(selectedId) {
      deleteInstance(selectedId);
      setSelectedInstancesIds([]);
    }
  };
  return (
    showMenu && (
      <div className={"rounded-xl bg-white flex flex-col"} style={{ position: 'fixed', top:shiftStage.y +  menuPosition.y, left:shiftStage.x + menuPosition.x }}>
        <Button onClick={handleDelete} className={'rounded-none'}>Delete</Button>
      </div>
    )
  );
};

export default ContextMenu;
