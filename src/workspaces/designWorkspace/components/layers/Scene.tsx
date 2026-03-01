'use client';
import React, { useMemo } from 'react';
import { Layer, Transformer } from 'react-konva';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import type Konva from 'konva';
import { RenderInsctance } from '@/workspaces/designWorkspace/components/layers/RenderInsctance';
import { useKeyShift } from '@/workspaces/designWorkspace/hooks/useKeyShift';
import { useTransformerHook } from '@/workspaces/designWorkspace/hooks/useTransformerHook';
import SelectionRectangle from '@/workspaces/designWorkspace/components/layers/SelectionRectangle';

interface Props extends ReturnType<typeof useTransformerHook>{
  stageRef: React.RefObject<Konva.Stage | null>;
  transformerRef: React.RefObject<Konva.Transformer | null>;
}

const Scene: React.FC<Props> = ({transformerRef,selectionRectangle, rectRefs}) => {
  const { layers } = useCanvasLayersStore();
  const {isShiftPressed} = useKeyShift();
  
  const reversedLayers = useMemo(() => {
    return layers.toReversed();
  }, [layers]);
  
  const renderedInstances = useMemo(() => {
    return reversedLayers.map((instance) => (
      <RenderInsctance 
        key={`${instance.id}-${instance.type}`} 
        instance={instance} 
        rectRefs={rectRefs} 
      />
    ));
  }, [reversedLayers, rectRefs]);
  
  return (
    <Layer>
      {renderedInstances}
      <SelectionRectangle selectionRectangle={selectionRectangle}/>
      <Transformer 
        ref={transformerRef} 
        ignoreStroke={true} 
        keepRatio={isShiftPressed}
        boundBoxFunc={(oldBox, newBox) => {
          // Prevent errors by validating nodes
          try {
            // Allow resize if new box is valid
            if (newBox.width > 0 && newBox.height > 0) {
              return newBox;
            }
            return oldBox;
          } catch (error) {
            console.warn('[Transformer] Error in boundBoxFunc:', error);
            return oldBox;
          }
        }}
      />
    </Layer>
  );
};

// Add displayName for React DevTools
Scene.displayName = 'Scene';

export default Scene;
