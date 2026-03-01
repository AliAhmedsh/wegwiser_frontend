import { useState, useCallback, useRef } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { CanvasArrowInstance } from '@/workspaces/designWorkspace/types';
import { isCanvasArrowInstance } from '@/workspaces/designWorkspace/types/canvasTypeGuard';
import { getIdForInstance } from '@/workspaces/designWorkspace/lib/helpers/getIdForInstance';
import { getTransformedPointer } from '@/workspaces/designWorkspace/lib/helpers/getTransformedPointer';

export const useArrowInstance = () => {
  const { addInstance, updateInstance } = useCanvasLayersStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [arrowInstance, setArrowInstance] = useState<CanvasArrowInstance | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const onMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getTransformedPointer(stage);
    if (!pos) return;

    const startPoints = [pos.x, pos.y, pos.x, pos.y];

    const newInstance: CanvasArrowInstance = {
      id: getIdForInstance('arrow'),
      type: 'arrow',
      name: 'arrow',
      object: {
        points: startPoints,
        stroke: 'green',
        strokeWidth: 3,
        fill: 'green',
        pointerLength: 10,
        pointerWidth: 10,
      },
    };

    setArrowInstance(newInstance);
    setIsDrawing(true);
    addInstance(newInstance);
  }, [addInstance]);

  const onMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !arrowInstance) return;

    // Cancel previous animation frame if it exists
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    // Use requestAnimationFrame for smoother updates
    animationFrameRef.current = requestAnimationFrame(() => {
      const stage = e.target.getStage();
      if (!stage) return;

      const pos = getTransformedPointer(stage);
      if (!pos) return;

      const points = arrowInstance.object.points;
      if (!points || points.length < 4) return;

      const updatedPoints = [points[0], points[1], pos.x, pos.y];
      const updatedInstance: CanvasArrowInstance = {
        ...arrowInstance,
        object: {
          ...arrowInstance.object,
          points: updatedPoints,
        },
      };
      setArrowInstance(updatedInstance);

      updateInstance(arrowInstance.id, (instance) => {
        if (isCanvasArrowInstance(instance)) {
          return updatedInstance;
        }
        return instance;
      });
    });
  }, [isDrawing, arrowInstance, updateInstance]);

  const onMouseUp = useCallback(() => {
    // Cancel any pending animation frame
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    
    setIsDrawing(false);
    setArrowInstance(null);
  }, []);

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
};
