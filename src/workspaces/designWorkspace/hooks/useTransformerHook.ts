import Konva from 'konva';
import React, { useEffect, useRef, useState } from 'react';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { getClientRectFromInstance } from '@/workspaces/designWorkspace/lib/helpers/getClientRectFromInstance';
import { CanvasInstance } from '@/workspaces/designWorkspace/types';
import { useSelectedInstances } from '@/workspaces/designWorkspace/store/selectedInstances.store';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';
import {
  getTransformedPointer,
} from '@/workspaces/designWorkspace/lib/helpers/getTransformedPointer';

type ShapeRefMap = Map<string, Konva.Shape>;


export const useTransformerHook = (stageRef: React.RefObject<Konva.Stage | null>) => {
  const transformerRef = useRef<Konva.Transformer | null>(null);
  const [selectionRectangle, setSelectionRectangle] = useState({
    visible: false,
    x1: 0,
    y1: 0,
    x2: 0,
    y2: 0,
  });
  const { setSelectedInstancesIds, selectedInstancesIds } = useSelectedInstances();
  const { layers } = useCanvasLayersStore();
  const isSelecting = useRef<boolean>(false);
  const rectRefs = useRef<ShapeRefMap>(new Map());
  const { selectedTool } = useToolStore();
  
  // Cleanup stale refs when layers change
  useEffect(() => {
    const currentLayerIds = new Set<string>();
    
    // Collect all instance IDs from layers (including nested groups)
    const collectIds = (instances: CanvasInstance[]) => {
      instances.forEach(inst => {
        currentLayerIds.add(inst.id);
        if (inst.type === 'group') {
          collectIds(inst.children);
        }
      });
    };
    
    collectIds(layers);
    
    // Remove refs for instances that no longer exist
    const staleIds: string[] = [];
    rectRefs.current.forEach((node, id) => {
      if (!currentLayerIds.has(id)) {
        staleIds.push(id);
      }
    });
    
    if (staleIds.length > 0) {
      console.log('[Transformer] Cleaning up stale refs:', staleIds);
      staleIds.forEach(id => {
        rectRefs.current.delete(id);
      });
      
      // If any selected instance was removed, clear selection
      const removedSelected = selectedInstancesIds.filter(id => staleIds.includes(id));
      if (removedSelected.length > 0) {
        const newSelected = selectedInstancesIds.filter(id => !staleIds.includes(id));
        setSelectedInstancesIds(newSelected);
        if (transformerRef.current) {
          transformerRef.current.nodes([]);
        }
      }
    }
  }, [layers, selectedInstancesIds, setSelectedInstancesIds]);
  useEffect(() => {
    if(!transformerRef.current) return;
    if (selectedInstancesIds.length === 0) {
      transformerRef.current.nodes([])
      return;
    }
    if (rectRefs.current && selectedInstancesIds.length > 0) {
      const validNodes = selectedInstancesIds.reduce<Konva.Node[]>((acc, id) => {
        const node = rectRefs.current.get(id);
        // Check for null/undefined and ensure node is still attached to stage
        if (node !== undefined && node !== null) {
          try {
            // Check if node is still attached to stage
            const stage = node.getStage();
            if (!stage) {
              // Node is detached, remove from refs
              rectRefs.current.delete(id);
              return acc;
            }
            
            // Verify node is still valid by checking getAbsoluteTransform
            const transform = node.getAbsoluteTransform();
            if (!transform) {
              // Transform is null, skip this node
              console.warn(`[Transformer] Node ${id} has null transform, skipping`);
              return acc;
            }
            
            // Additional check: verify node is still in the DOM
            if (node.isListening() !== false) {
              acc.push(node);
            }
          } catch (error) {
            // Node is invalid, remove from refs and skip it
            console.warn(`[Transformer] Skipping invalid node for id: ${id}`, error);
            rectRefs.current.delete(id);
          }
        } else {
          // Node is null/undefined, remove from refs
          rectRefs.current.delete(id);
        }
        return acc;
      }, []);
      
      // Only set nodes if we have valid nodes, otherwise clear selection
      if (validNodes.length > 0) {
        try {
          transformerRef.current.nodes(validNodes);
        } catch (error) {
          console.error('[Transformer] Error setting nodes:', error);
          // Clear transformer nodes on error
          transformerRef.current.nodes([]);
          setSelectedInstancesIds([]);
        }
      } else {
        // Clear selection if no valid nodes found
        transformerRef.current.nodes([]);
        setSelectedInstancesIds([]);
      }
    }
  }, [selectedInstancesIds, setSelectedInstancesIds, layers]);
  useEffect(() => {
    if (!(selectedTool.type === 'mouse' && selectedTool.option === 'move')) return;
    const stage = stageRef.current;
    if (!stage) return;
    const handleMouseDown = (e: Konva.KonvaEventObject<MouseEvent>) => {
      const currentTarget = e.target;
      if (currentTarget === stageRef.current) {
        if(e.evt.shiftKey) return;
        isSelecting.current = true;
        const pos = getTransformedPointer(stage);
        if (pos) {
          setSelectionRectangle({
            visible: true,
            x1: pos.x,
            y1: pos.y,
            x2: pos.x,
            y2: pos.y,
          });
        }
        return;
      }
      // Find the instance ID from the clicked node
      let clickedInstanceId: string | null = null;
      rectRefs.current.forEach((node, instanceId) => {
        if (node === currentTarget || node.id() === currentTarget.id()) {
          clickedInstanceId = instanceId;
        }
      });

      if (!clickedInstanceId) return; // If we can't find the instance ID, skip

      const isShapeAlreadySelected = selectedInstancesIds.includes(clickedInstanceId);
      const isShiftPressed = e.evt.shiftKey;
      if (currentTarget.parent == transformerRef.current) return;//prevent transformer instance selecting
      
      if (isShiftPressed) {
        if (isShapeAlreadySelected) {
          // Remove from selection
          const newIds = selectedInstancesIds.filter(id => id !== clickedInstanceId);
          setSelectedInstancesIds(newIds);
        } else {
          // Add to selection
          setSelectedInstancesIds([...selectedInstancesIds, clickedInstanceId]);
        }
      } else {
        if (isShapeAlreadySelected) return;//return for prevent selecting when we need to transform
        // Set only this shape as selected
        setSelectedInstancesIds([clickedInstanceId]);
      }

    };

    const handleMouseMove = () => {
      if (!isSelecting.current) return;
      const pos = getTransformedPointer(stage);
      if (pos) {
        setSelectionRectangle(prev => ({
          ...prev,
          x2: pos.x,
          y2: pos.y,
        }));
      }
    };

    const handleMouseUp = () => {
      if (!isSelecting.current) return;
      isSelecting.current = false;

      const selBox = {
        x: Math.min(selectionRectangle.x1, selectionRectangle.x2),
        y: Math.min(selectionRectangle.y1, selectionRectangle.y2),
        width: Math.abs(selectionRectangle.x2 - selectionRectangle.x1),
        height: Math.abs(selectionRectangle.y2 - selectionRectangle.y1),
      };

      const getAllInstances = (instances: CanvasInstance[]): CanvasInstance[] => {
        return instances.flatMap((inst) =>
          inst.type === 'group' ? getAllInstances(inst.children) : [inst],
        );
      };

      const allLayers: CanvasInstance[] = getAllInstances(layers);
      const selected = allLayers
        .filter(instance => instance.type !== 'group')
        .filter(instance =>
          Konva.Util.haveIntersection(selBox, getClientRectFromInstance(instance)),
        );
      setSelectedInstancesIds(selected.map(i => i.id));
      console.log(selected.map(i => i.id));
      setTimeout(() => {
        setSelectionRectangle(prev => ({
          ...prev,
          visible: false,
        }));
      });
    };

    // Register events
    stage.on('mousedown', handleMouseDown);
    stage.on('mousemove', handleMouseMove);
    stage.on('mouseup', handleMouseUp);

    // Cleanup on unmount or dependency change
    return () => {
      stage.off('mousedown', handleMouseDown);
      stage.off('mousemove', handleMouseMove);
      stage.off('mouseup', handleMouseUp);
    };
  }, [stageRef, layers, selectionRectangle, selectedTool, setSelectedInstancesIds]);


  return {
    transformerRef,
    rectRefs,
    selectionRectangle,
  };
};
