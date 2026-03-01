'use client';
import { useEffect, useRef, useState } from 'react';
import { CanvasInstance, DndItemData, isDndItem } from '@/workspaces/designWorkspace/types';
import { useCanvasLayersStore } from '../../../../store/useCanvasLayers.store';
import { draggable, dropTargetForElements } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import { DropIndicator } from '@atlaskit/pragmatic-drag-and-drop-react-drop-indicator/box';
import IconNameLayer from '@/workspaces/designWorkspace/sections/LeftSideBar/Layers/dnd/IconNameLayer';
import GroupChildrenMapper from '@/workspaces/designWorkspace/sections/LeftSideBar/Layers/dnd/GroupChildrenMapper';
import {
  attachClosestEdge,
  type Edge,
  extractClosestEdge,
} from '@atlaskit/pragmatic-drag-and-drop-hitbox/closest-edge';
import { isCanvasGroup } from '@/workspaces/designWorkspace/types/canvasTypeGuard';
import { useSelectedInstances } from '@/workspaces/designWorkspace/store/selectedInstances.store';

interface LayerItemProps {
  instance: CanvasInstance;
  parentId?: string | null;
}

export function LayerItem({ instance }: LayerItemProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isDragOver, setIsDragOver] = useState<boolean>(false);
  const { insertAfter, insertInto, insertBefore } = useCanvasLayersStore();
  const [closestEdge, setClosestEdge] = useState<Edge | null>(null);
  const { setSelectedInstancesIds, selectedInstancesIds } = useSelectedInstances();
  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.shiftKey) {
      setSelectedInstancesIds([...selectedInstancesIds,instance.id])
    }else {
      setSelectedInstancesIds([instance.id])
    }
  };
  // Make this draggable
  useEffect(() => {
    if (!ref.current) return;
    return draggable({
      element: ref.current,
      getInitialData: () => ({
        ...instance,
      }),
      onDrop: ({ location }) => {
        if (location.current.dropTargets.length < 1) return;
        const targetData: unknown = location.current.dropTargets[0].data;
        if (isDndItem(targetData)) {
          const draggedId = instance.id;
          if (draggedId === targetData.id) return;//drop onto self
          const edge: Edge | null = extractClosestEdge(targetData);
          if (isCanvasGroup(targetData as CanvasInstance)) {//TODO
            insertInto(draggedId, targetData.id);
          } else {
            if (edge === 'top') insertBefore(draggedId, targetData.id);
            if (edge === 'bottom') insertAfter(draggedId, targetData.id);
          }
        }
      },
    });
  }, [instance.id, insertAfter, insertInto, insertBefore, instance]);

  useEffect(() => {
    if (!ref.current) return;

    return dropTargetForElements({
      element: ref.current,
      getData: ({ input, element }) => {
        const data: DndItemData = {
          id: instance.id,
          type: instance.type,
          name: instance.name,
        };
        if (instance.type === 'group') return {
          id: instance.id,
          type: instance.type,
          name: instance.name,
        };//we dont need to attach dnd indicator to group
        return attachClosestEdge(data, {
          input,
          element,
          allowedEdges: ['top', 'bottom'],
        });
      },
      onDragEnter: () => {
        setIsDragOver(true);
      },
      onDrag: ({ self }) => {
        const selfData = self.data;
        setClosestEdge(extractClosestEdge(selfData));
      },
      onDragLeave: () => {
        setIsDragOver(false);
        setClosestEdge(null);
      },
      onDrop: () => {
        setIsDragOver(false);
        setClosestEdge(null);
      },

    });
  }, [instance.id, instance.type, instance.name]);

  const isSelected = selectedInstancesIds.includes(instance.id);
  return (
    <div
      onClick={handleClick}
      ref={ref}
      className={`relative  cursor-grab px-3 py-3 text-nowrap outline-2 rounded-lg ${(isDragOver && instance.type === 'group') ? 'outline-blue-500 ' : 'outline-transparent'} ${isSelected && 'bg-gray-100'}`}
    >
      <IconNameLayer instance={instance} />
      {instance.type === 'group' && <GroupChildrenMapper instance={instance} />}
      {closestEdge && <DropIndicator edge={closestEdge} />}
    </div>
  );
}
