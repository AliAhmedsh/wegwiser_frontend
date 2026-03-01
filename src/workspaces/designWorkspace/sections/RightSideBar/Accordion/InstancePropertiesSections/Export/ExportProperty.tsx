import React from 'react';
import { Button } from '@/workspaces/designWorkspace/components/ui/button';
import { useSelectedInstances } from '@/workspaces/designWorkspace/store/selectedInstances.store';
import { useShapeRefsStore } from '@/workspaces/designWorkspace/store/shapeRefs.store';
import { useDesignWorkspaceStore } from '@/workspaces/designWorkspace/store/designWorkspace.store';

function downloadURI(uri: string, name: string): void {
  const link = document.createElement('a');
  link.download = name;
  link.href = uri;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


const ExportProperty: React.FC = () => {
  const { selectedInstancesIds } = useSelectedInstances();
  const { getRefById } = useShapeRefsStore();
  const { stageRef } = useDesignWorkspaceStore();
  const selectedCount = selectedInstancesIds.length;
  const exportSelectedShapes = () => {
    if (stageRef?.current) {
      switch (selectedCount) {
        case 0: {
          const uri = stageRef.current.toDataURL();
          downloadURI(uri, 'stage.png');
          break;
        }
        case 1: {
          const ref = getRefById(selectedInstancesIds[0]);
          const uri = ref?.current?.toDataURL();
          if (uri) downloadURI(uri, ref?.current.name() ?? "shape");
          break;
        }
        default: {
          const ref = getRefById(selectedInstancesIds[0]);
          const uri = ref?.current?.parent?.toDataURL();
          if (uri) downloadURI(uri, ref?.current.name() ?? "shape");
        }
      }
    }
  };

  return (
    <div className="w-full">
      <Button onClick={exportSelectedShapes}>{`Export ${selectedCount === 0 ? 'stage' : 'selected'}`}</Button>
    </div>
  );
};

export default ExportProperty;
