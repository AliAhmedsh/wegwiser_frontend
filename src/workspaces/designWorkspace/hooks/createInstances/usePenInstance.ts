import  { useState, useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { CanvasPenInstance } from '@/workspaces/designWorkspace/types';
import { isCanvasPenInstance } from '@/workspaces/designWorkspace/types/canvasTypeGuard';
import { getIdForInstance } from '@/workspaces/designWorkspace/lib/helpers/getIdForInstance';
import { getTransformedPointer } from '@/workspaces/designWorkspace/lib/helpers/getTransformedPointer';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';

export const usePenInstance = () => {
  const { addInstance, updateInstance } = useCanvasLayersStore();
  const { selectedTool } = useToolStore();
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentPenId, setCurrentPenId] = useState<string>('');

  const getPenProperties = () => {
    if (selectedTool.type === 'pen' && 'option' in selectedTool && selectedTool.option === 'pencil') {
      return {
        stroke: '#2C2C2C',
        strokeWidth: 2,
        lineCap: 'round' as const,
        lineJoin: 'round' as const,
        opacity: 0.8,
      };
    } else {
      return {
        stroke: '#000000',
        strokeWidth: 3,
        lineCap: 'round' as const,
        lineJoin: 'round' as const,
        opacity: 1,
      };
    }
  };

  const onMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getTransformedPointer(stage);
    if (!pos) return;

    const start: [number, number] = [pos.x, pos.y];
    setIsDrawing(true);

    const newPenId = getIdForInstance('pen');
    setCurrentPenId(newPenId);

    const penProperties = getPenProperties();
    const isPencil = selectedTool.type === 'pen' && 'option' in selectedTool && selectedTool.option === 'pencil';
    const newPen: CanvasPenInstance = {
      id: newPenId,
      type: 'pen',
      name: isPencil ? 'pencil' : 'pen',
      object: {
        points: start,
        ...penProperties,
      },
    };

    addInstance(newPen);
  }, [addInstance, selectedTool]);

  const onMouseMove = useCallback((e: KonvaEventObject<MouseEvent>) => {
    if (!isDrawing || !currentPenId) return;

    const stage = e.target.getStage();
    if (!stage) return;

    const pos = getTransformedPointer(stage);
    if (!pos) return;

    const x = pos.x;
    const y = pos.y;

    updateInstance(currentPenId, (instance) => {
      if (isCanvasPenInstance(instance)) {
        const points = instance.object.points;
        if (points && points.length >= 2) {
          const lastX = points[points.length - 2];
          const lastY = points[points.length - 1];
          const dx = x - lastX;
          const dy = y - lastY;

          // Different distance thresholds for pen vs pencil
          const isPencil = selectedTool.type === 'pen' && 'option' in selectedTool && selectedTool.option === 'pencil';
          const distanceThreshold = isPencil ? 3 : 5;

          if (Math.sqrt(dx * dx + dy * dy) > distanceThreshold) {
            const newPoints = [...points, x, y];
            return {
              ...instance,
              object: {
                ...instance.object,
                points: newPoints,
              },
            };
          }
        } else if (points) {
          const newPoints = [...points, x, y];
          return {
            ...instance,
            object: {
              ...instance.object,
              points: newPoints,
            },
          };
        }
      }
      return instance;
    });
  }, [isDrawing, currentPenId, updateInstance, selectedTool]);

  const onMouseUp = useCallback(() => {
    setIsDrawing(false);
    setCurrentPenId('');
  }, []);

  return {
    onMouseDown,
    onMouseMove,
    onMouseUp,
  };
};
