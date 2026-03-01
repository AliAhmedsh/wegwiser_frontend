import { useState, useCallback, useRef } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { CanvasLineInstance } from '@/workspaces/designWorkspace/types';
import { isCanvasLineInstance } from '@/workspaces/designWorkspace/types/canvasTypeGuard';
import { getIdForInstance } from '@/workspaces/designWorkspace/lib/helpers/getIdForInstance';
import { getTransformedPointer } from '@/workspaces/designWorkspace/lib/helpers/getTransformedPointer';

export const useLineInstance = () => {
  const { addInstance, updateInstance } = useCanvasLayersStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [lineInstance, setLineInstance] = useState<CanvasLineInstance | null>(
    null
  );
  const animationFrameRef = useRef<number | null>(null);

  const onMouseDown = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pos = getTransformedPointer(stage);
      if (!pos) return;

      const startPoints = [pos.x, pos.y];

      const newInstance: CanvasLineInstance = {
        id: getIdForInstance('line'),
        type: 'line',
        name: 'line',
        object: {
          points: startPoints,
          stroke: 'green',
          strokeWidth: 3,
        },
      };

      setLineInstance(newInstance);
      setIsDrawing(true);
      addInstance(newInstance);
    },
    [addInstance]
  );

  const onMouseMove = useCallback(
    (e: KonvaEventObject<MouseEvent>) => {
      if (!isDrawing || !lineInstance) return;

      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }

      animationFrameRef.current = requestAnimationFrame(() => {
        const stage = e.target.getStage();
        if (!stage) return;

        const pos = getTransformedPointer(stage);
        if (!pos) return;

        const points = lineInstance.object.points;
        if (!points || points.length < 2) return;

        const updatedPoints = [points[0], points[1], pos.x, pos.y];
        const updatedInstance: CanvasLineInstance = {
          ...lineInstance,
          object: {
            ...lineInstance.object,
            points: updatedPoints,
          },
        };
        setLineInstance(updatedInstance);

        updateInstance(lineInstance.id, (instance) => {
          if (isCanvasLineInstance(instance)) {
            return updatedInstance;
          }
          return instance;
        });
      });
    },
    [isDrawing, lineInstance, updateInstance]
  );

  const onMouseUp = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsDrawing(false);
    setLineInstance(null);
  }, []);

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
};
