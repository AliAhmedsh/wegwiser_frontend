import { CanvasInstance } from '@/workspaces/designWorkspace/types';
import { Group, Line, Rect, Ellipse, Arrow, Star, RegularPolygon, Image as KonvaImage } from 'react-konva';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import type { Node, NodeConfig } from 'konva/lib/Node';
import type { KonvaEventObject } from 'konva/lib/Node';
import {
  RenderTextInstance,
} from '@/workspaces/designWorkspace/components/layers/RenderSuchInstances/RenderTextInstance';
import { useTransformerHook } from '@/workspaces/designWorkspace/hooks/useTransformerHook';
import { RefObject, useEffect, useRef } from 'react';
import Konva from 'konva';
import { useSelectedInstances } from '@/workspaces/designWorkspace/store/selectedInstances.store';
import { useShapeRefsStore } from '@/workspaces/designWorkspace/store/shapeRefs.store';
import { useContextMenuStore } from '@/workspaces/designWorkspace/store/contextMenu.store';

interface Props extends Pick<ReturnType<typeof useTransformerHook>, 'rectRefs'> {
  instance: CanvasInstance;
}

export const RenderInsctance: React.FC<Props> = ({ instance, rectRefs }) => {
  // Validate instance before rendering to prevent React DevTools errors
  if (!instance || !instance.id || !instance.type) {
    console.warn('[RenderInstance] Invalid instance:', instance);
    return null;
  }
  
  const { selectedTool } = useToolStore();
  const { updateInstance } = useCanvasLayersStore();
  const { setSelectedInstancesIds, selectedInstancesIds } = useSelectedInstances();
  const canDrag = selectedTool.type === 'mouse' && selectedTool.option === 'move';
  const ref = useRef<Konva.Shape>(null);
  const {setShapeRef} = useShapeRefsStore()
  const {setMenuPosition,setShowMenu,setSelectedId} = useContextMenuStore()
  
  useEffect(() => {
    if (ref.current) {
      rectRefs.current.set(instance.id, ref.current);
      setShapeRef(instance.id, ref as RefObject<Konva.Shape>);
    }
    
    // Cleanup: remove ref when component unmounts or instance changes
    return () => {
      if (instance.id) {
        rectRefs.current.delete(instance.id);
      }
    };
  }, [ref, rectRefs, instance.id, setShapeRef]);

  const handleDragEnd = (e: KonvaEventObject<DragEvent, Node<NodeConfig>>) => {
    const node = e.target;
    const x = node.x();
    const y = node.y();
    updateInstance(instance.id, (inst) => {
      return ({ ...inst, object: { ...inst.object, x, y } } as CanvasInstance);
    });

  };
  const onTransformEnd = (e: KonvaEventObject<Event>) => {
    const node = e.target as Node & {
      x: () => number;
      y: () => number;
      scaleX: () => number;
      scaleY: () => number;
      rotation: () => number;
      width?: () => number;
      height?: () => number;
    };
    const newProps: Partial<typeof instance.object> = {
      x: node.x(),
      y: node.y(),
      scale: node.scale(),
      scaleX: node.scaleX(),
      scaleY: node.scaleY(),
      rotation: node.rotation(),
    };

    updateInstance(instance.id, (inst) => ({
      ...inst,
      object: {
        ...inst.object,
        ...newProps,
      },
    } as CanvasInstance));
  };
  //we must select it there and prevent selecting if there is selection logic in useTransform hook
  const onClick = () => {
    // Only handle click if mouse tool is not in move mode (let transformer hook handle it)
    if (selectedTool.type === 'mouse' && selectedTool.option === 'move') {
      return; // Let the transformer hook handle selection
    }
    if (selectedInstancesIds.length > 0) return;
    setSelectedInstancesIds([instance.id]);
  };
  const onContextMenu = (e:Konva.KonvaEventObject<PointerEvent>) => {
    e.evt.preventDefault();
    const stage = e.target.getStage();
    if(!stage) return
    const containerRect = stage.container().getBoundingClientRect();
    const pointer = stage.getPointerPosition()
    if(!pointer) return;
    setMenuPosition({
      x: containerRect.left + pointer.x,
      y: containerRect.top + pointer.y,
    });
    setSelectedId(instance.id);
    setShowMenu(true)
    e.cancelBubble = true;
  };
  const handlers = {
    onDragEnd: handleDragEnd,
    draggable: canDrag,
    onTransformEnd,
    onClick,
    onContextMenu
  };
  switch (instance.type) {
    case 'group':
      return (
        <Group key={`group-${instance.id}`}>
          {instance.children.toReversed().map((childInstance, idx) => (
            <RenderInsctance 
              key={`${childInstance.id}-${childInstance.type}-${idx}`} 
              instance={childInstance}
              rectRefs={rectRefs}
            />
          ))}
        </Group>
      );

    case 'rectangle':
      return <Rect key={`rect-${instance.id}`} {...instance.object} {...handlers}
                   ref={ref as React.RefObject<Konva.Rect>} />;

    case 'ellipse':
      return <Ellipse key={instance.id} {...instance.object} {...handlers}
                      ref={ref as React.RefObject<Konva.Ellipse>} />;

    case 'line':
      return <Line key={instance.id} {...instance.object} {...handlers}
                   hitStrokeWidth={10}
                   ref={ref as React.RefObject<Konva.Line>} />;

    case 'arrow':
      return <Arrow key={instance.id} {...instance.object} {...handlers}
                    hitStrokeWidth={10}
                    ref={ref as React.RefObject<Konva.Arrow>} />;

    case 'star':
      return <Star key={instance.id} {...instance.object} {...handlers}
                   ref={ref as React.RefObject<Konva.Star>} />;

    case 'polygon':
      return <RegularPolygon key={instance.id} {...instance.object} {...handlers}
                             ref={ref as React.RefObject<Konva.RegularPolygon>} />;

    case 'image':
      if (!instance.object.image) return null;
      return <KonvaImage key={instance.id} {...instance.object} image={instance.object.image} {...handlers}
                         ref={ref as React.RefObject<Konva.Image>} />;

    case 'text':
      // return <Text key={instance.id} {...instance.object} {...handlers}/>;
      return <RenderTextInstance instance={instance} {...instance.object} {...handlers}
                                 ref={ref as React.RefObject<Konva.Text>} />;

    case 'pen':
      return <Line key={instance.id} {...instance.object}
                   lineCap="round"
                   lineJoin="round"
                   tension={0.1}
                   {...handlers}
                   ref={ref as React.RefObject<Konva.Line>} />;

    default:
      return null;
  }
};

// Add displayName for React DevTools to help identify components
RenderInsctance.displayName = 'RenderInstance';