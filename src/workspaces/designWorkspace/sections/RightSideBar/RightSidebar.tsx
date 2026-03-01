import React from 'react';
import type Konva from 'konva';
import InstanceProperties from '@/workspaces/designWorkspace/sections/RightSideBar/InstanceProperties';
import { useSelectedInstances } from '@/workspaces/designWorkspace/store/selectedInstances.store';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';

interface Props {
  stageRef: React.RefObject<Konva.Stage | null>;
}

const RightSidebar: React.FC<Props> = ({}) => {
  const { selectedInstancesIds } = useSelectedInstances();
  const { getInstanceById } = useCanvasLayersStore();
  return (
    <div className="h-full bg-[#D5DBE3] flex flex-col p-2 w-[340px] flex-shrink-0 rounded-xl">
      <div className="bg-white h-full rounded-xl">
        <InstanceProperties instance={getInstanceById(selectedInstancesIds[0])} />
      </div>
    </div>
  );
};

export default RightSidebar;
