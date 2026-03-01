"use client"
import { useCanvasAutoSave } from '@/entities/designWorkspace/hooks/useCanvasAutoSave';
import { useDesignWorkspaceStore as useDesignWorkspaceAPIStore } from '@/entities/designWorkspace/store/designWorkspaceStore';
import Scene from '@/workspaces/designWorkspace/components/layers/Scene';
import ContextMenu from '@/workspaces/designWorkspace/components/MainCanvasKonva/ContextMenu/ContextMenu';
import ZoomWidget from '@/workspaces/designWorkspace/components/MainCanvasKonva/ZoomWidget/ZoomWidget';
import { useArrowInstance } from '@/workspaces/designWorkspace/hooks/createInstances/useCreateArrow';
import { useShapeInstance } from '@/workspaces/designWorkspace/hooks/createInstances/useCreateInstance';
import { useLineInstance } from '@/workspaces/designWorkspace/hooks/createInstances/useCreateLine';
import { usePenInstance } from '@/workspaces/designWorkspace/hooks/createInstances/usePenInstance';
import { useTextInstance } from '@/workspaces/designWorkspace/hooks/createInstances/useTextInstance';
import { useKanvasHotkeys } from '@/workspaces/designWorkspace/hooks/hotKeys/useSetupHotkeys';
import { useTransformerHook } from '@/workspaces/designWorkspace/hooks/useTransformerHook';
import { useDesignWorkspaceStore } from '@/workspaces/designWorkspace/store/designWorkspace.store';
import { useSelectedInstances } from '@/workspaces/designWorkspace/store/selectedInstances.store';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import type Konva from 'konva';
import { KonvaEventObject } from 'konva/lib/Node';
import React, { useEffect } from 'react';
import { Stage } from 'react-konva';
import { useStagePan } from '../../hooks/useStagePan';
import { ToolbarPanel } from '../toolbar/ToolbarPanel';

interface MainCanvasKonvaProps {
  stageRef: React.RefObject<Konva.Stage | null>;
}

export default function MainCanvasKonva({ stageRef }: MainCanvasKonvaProps) {
  const pan = useStagePan();
  const { setupKanvasHotkeys, removeKanvasHotkeys } = useKanvasHotkeys();
  const { stageSize, zoom, setZoom, setStageRef, registerSetStagePos } = useDesignWorkspaceStore()
  
  // Register setStagePos function so it can be used from store
  React.useEffect(() => {
    registerSetStagePos(pan.setStagePos);
  }, [pan.setStagePos, registerSetStagePos]);
  const { selectedLayerId, currentPageId } = useDesignWorkspaceAPIStore();
  const { selectedTool } = useToolStore()
  const { removeSelectedInstance, selectedInstancesIds, setSelectedInstancesIds } = useSelectedInstances()
  const { deleteInstance } = useCanvasLayersStore()
  const penInstance = usePenInstance();
  const lineInstance = useLineInstance();
  const arrowInstance = useArrowInstance();
  const shapeInstance = useShapeInstance();
  const textInstance = useTextInstance();
  const transfromer = useTransformerHook(stageRef);

  // Enable auto-save for the selected layer or page
  useCanvasAutoSave({
    layerId: selectedLayerId || undefined,
    pageId: currentPageId || undefined,
    enabled: !!(selectedLayerId || currentPageId), // Enable if either layer or page is selected
    debounceMs: 2000, // Save 2 seconds after last change
  });
  const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
    if (e.evt.ctrlKey || e.evt.metaKey) {
      e.evt.preventDefault();
      const scaleBy = 1.05;
      const stage = stageRef.current;
      if (!stage) return;
      const oldScale = zoom;
      const pointer = stage.getPointerPosition();
      if (!pointer) return;
      const mousePointTo = {
        x: (pointer.x - pan.stagePos.x) / oldScale,
        y: (pointer.y - pan.stagePos.y) / oldScale,
      };
      let newZoom = oldScale;
      if (e.evt.deltaY < 0) {
        newZoom = Math.min(2, oldScale * scaleBy);
      } else {
        newZoom = Math.max(0.1, oldScale / scaleBy);
      }
      setZoom(newZoom);
      pan.setStagePos({
        x: pointer.x - mousePointTo.x * newZoom,
        y: pointer.y - mousePointTo.y * newZoom,
      });
    }
  };
  useEffect(() => {
    setupKanvasHotkeys();
    return () => {
      removeKanvasHotkeys();
    }
  }, [removeKanvasHotkeys, setupKanvasHotkeys])

  // Handle Delete/Backspace key to delete selected instances
  useEffect(() => {
    const handleDeleteKey = (e: KeyboardEvent) => {
      // Check if Delete or Backspace key is pressed
      if ((e.key === 'Delete' || e.key === 'Backspace') && selectedInstancesIds.length > 0) {
        // Prevent default behavior (e.g., navigating back in browser)
        e.preventDefault();
        
        // Check if user is typing in an input field or textarea
        const target = e.target as HTMLElement;
        if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable) {
          return;
        }

        // Delete all selected instances
        selectedInstancesIds.forEach(id => {
          deleteInstance(id);
        });
        
        // Clear selection after deletion
        setSelectedInstancesIds([]);
      }
    };

    window.addEventListener('keydown', handleDeleteKey);
    return () => {
      window.removeEventListener('keydown', handleDeleteKey);
    };
  }, [selectedInstancesIds, deleteInstance, setSelectedInstancesIds])

  useEffect(() => {
    setStageRef(stageRef);
  }, [stageRef, setStageRef]);

  const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
    if (e.target === stageRef.current) removeSelectedInstance();
    if (selectedTool.type === 'mouse' && selectedTool.option === "hand") pan.onPanStart(e.evt.x, e.evt.y);
    if (selectedTool.type === 'pen' && selectedTool.option === "pen") penInstance.onMouseDown(e)
    if (selectedTool.type === 'pen' && selectedTool.option === "pencil") penInstance.onMouseDown(e)
    if (selectedTool.type === 'shapes') shapeInstance.onMouseDown(e);
    if (selectedTool.type === 'inclined' && selectedTool.option === 'line') lineInstance.onMouseDown(e);
    if (selectedTool.type === 'inclined' && selectedTool.option === 'arrow') arrowInstance.onMouseDown(e);
    if (selectedTool.type === 'inclined' && ['rectangle', 'ellipse', 'star', 'polygon'].includes(selectedTool.option)) shapeInstance.onMouseDown(e);
    if (selectedTool.type === 'text') textInstance.onMouseDown(e)
  };


  const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
    pan.onPanMove(e.evt.x, e.evt.y);
    if (selectedTool.type === 'pen' && selectedTool.option === "pen") penInstance.onMouseMove(e);
    if (selectedTool.type === 'pen' && selectedTool.option === "pencil") penInstance.onMouseMove(e);
    if (selectedTool.type === 'shapes') shapeInstance.onMouseMove(e);
    if (selectedTool.type === 'inclined' && selectedTool.option === 'line') lineInstance.onMouseMove(e);
    if (selectedTool.type === 'inclined' && selectedTool.option === 'arrow') arrowInstance.onMouseMove(e);
    if (selectedTool.type === 'inclined' && ['rectangle', 'ellipse', 'star', 'polygon'].includes(selectedTool.option)) shapeInstance.onMouseMove(e);
  };

  const handleStageMouseUp = () => {
    if (selectedTool.type === 'mouse' && selectedTool.option === 'hand') pan.onPanEnd();
    if (selectedTool.type === 'pen' && selectedTool.option === "pen") penInstance.onMouseUp();
    if (selectedTool.type === 'pen' && selectedTool.option === "pencil") penInstance.onMouseUp();
    if (selectedTool.type === 'shapes') shapeInstance.onMouseUp();
    if (selectedTool.type === 'inclined' && selectedTool.option === 'line') lineInstance.onMouseUp();
    if (selectedTool.type === 'inclined' && selectedTool.option === 'arrow') arrowInstance.onMouseUp();
    if (selectedTool.type === 'inclined' && ['rectangle', 'ellipse', 'star', 'polygon'].includes(selectedTool.option)) shapeInstance.onMouseUp();
  };

  return (
    <>
      <div className="flex flex-col h-full w-full p-4 items-center justify-between relative">
        <ZoomWidget {...pan} stageRef={stageRef} />
        <Stage
          ref={stageRef}
          width={stageSize.width}
          height={stageSize.height}
          scaleX={zoom}
          scaleY={zoom}
          x={pan.stagePos.x}
          y={pan.stagePos.y}
          className="bg-[#F8F8F8] rounded-2xl border border-[#E8E8E8] shadow-lg"
          style={{ cursor: selectedTool.type === 'mouse' && selectedTool.option === "hand" ? (pan.isPanning ? 'grabbing' : 'grab') : 'crosshair', background: '#F8F8F8' }}
          onMouseDown={handleStageMouseDown}
          onMouseMove={handleStageMouseMove}
          onMouseUp={handleStageMouseUp}
          onWheel={handleWheel}
        >
          <Scene stageRef={stageRef} {...transfromer} transformerRef={transfromer.transformerRef} />
        </Stage>
        <ContextMenu />
        <ToolbarPanel />
      </div>
    </>
  );
} 