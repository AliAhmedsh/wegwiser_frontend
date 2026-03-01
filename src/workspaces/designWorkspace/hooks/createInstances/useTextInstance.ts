import  { useState, useCallback } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { getIdForInstance } from '@/workspaces/designWorkspace/lib/helpers/getIdForInstance';
import { CanvasTextInstance } from '@/workspaces/designWorkspace/types';
import { TextConfig } from 'konva/lib/shapes/Text';
import { getTransformedPointer } from '@/workspaces/designWorkspace/lib/helpers/getTransformedPointer';

export const useTextInstance = (
) => {
  const { addInstance, updateInstance } = useCanvasLayersStore();
  const [editingTextId, setEditingTextId] = useState<string | null>(null);

  // Create text
  const onMouseDown = useCallback((e: KonvaEventObject<MouseEvent>) => {
    const stage = e.target.getStage();
    if (!stage) return;
    const pos = getTransformedPointer(stage);
    if (!pos) return;

    const newId = getIdForInstance('text');
    const textConfig: TextConfig = {
      x: pos.x,
      y: pos.y,
      width: 200,
      text: 'text',
      fontSize: 20,
      fontFamily: 'Arial',
      fill: 'black',
      draggable: true,
    };

    const instance: CanvasTextInstance = {
      id: newId,
      name: 'text',
      type: 'text',
      editing: true,
      object: textConfig,
    };
    setEditingTextId(instance.id);
    addInstance(instance);
  }, [addInstance]);

  // Select text to start editing (e.g., on double click)
  const onTextDoubleClick = useCallback((id: string) => {
    setEditingTextId(id);
  }, []);

  // Update text content
  const updateTextContent = useCallback((id: string, newText: string) => {
    updateInstance(id, (instance) => {
      if (instance.type === 'text') {
        return {
          ...instance,
          object: {
            ...instance.object,
            text: newText,
          },
        };
      }
      return instance;
    });
    setEditingTextId(null);
  }, [updateInstance]);

  const onMouseUp = useCallback(() => {
  }, []);

  return {
    onMouseDown,
    onMouseUp,
    onTextDoubleClick,
    updateTextContent,
    editingTextId,
    setEditingTextId
  };
};
