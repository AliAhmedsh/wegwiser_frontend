import { useState, useCallback, useRef } from 'react';
import type { KonvaEventObject } from 'konva/lib/Node';
import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { getIdForInstance } from '@/workspaces/designWorkspace/lib/helpers/getIdForInstance';
import type { CanvasInstance } from '@/workspaces/designWorkspace/types';
import { useToolStore } from '@/workspaces/designWorkspace/store/useTool.store';
import { useKeyShift } from '@/workspaces/designWorkspace/hooks/useKeyShift';
import { EllipseConfig } from 'konva/lib/shapes/Ellipse';
import { StarConfig } from 'konva/lib/shapes/Star';
import { RegularPolygonConfig } from 'konva/lib/shapes/RegularPolygon';
import { RectConfig } from 'konva/lib/shapes/Rect';
import { ArrowConfig } from 'konva/lib/shapes/Arrow';
import { getTransformedPointer } from '@/workspaces/designWorkspace/lib/helpers/getTransformedPointer';

export const useShapeInstance = () =>
  // stageRef: React.RefObject<Konva.Stage | null>
  {
    const { addInstance, updateInstance } = useCanvasLayersStore();
    const [startPoint, setStartPoint] = useState<{
      x: number;
      y: number;
    } | null>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [shapeId, setShapeId] = useState<string | null>(null);
    const { selectedTool } = useToolStore();
    const { isShiftPressed } = useKeyShift();
    const animationFrameRef = useRef<number | null>(null);

    const onMouseDown = useCallback(
      (e: KonvaEventObject<MouseEvent>) => {
        if (selectedTool.type !== 'shapes' && selectedTool.type !== 'inclined')
          return;

        const stage = e.target.getStage();
        if (!stage) return;

        const pos = getTransformedPointer(stage);
        if (!pos) return;

        setStartPoint(pos);
        setIsDrawing(true);

        const newId = getIdForInstance(selectedTool.option);
        setShapeId(newId);

        const commonConfig = {
          x: pos.x,
          y: pos.y,
          stroke: 'green',
          strokeWidth: 2,
        };

        let instance: CanvasInstance;

        switch (selectedTool.option) {
          case 'rectangle': {
            const config: RectConfig = {
              ...commonConfig,
              width: 0,
              height: 0,
            };
            instance = {
              id: newId,
              name: 'rectangle',
              type: 'rectangle',
              object: config,
            };
            break;
          }
          case 'ellipse': {
            const config: EllipseConfig = {
              ...commonConfig,
              radiusX: 0,
              radiusY: 0,
            };
            instance = {
              id: newId,
              name: 'ellipse',
              type: 'ellipse',
              object: config,
            };
            break;
          }
          case 'star': {
            const config: StarConfig = {
              ...commonConfig,
              numPoints: 5,
              innerRadius: 0,
              outerRadius: 0,
              fill: 'transparent',
              stroke: 'green',
              strokeWidth: 2,
            };
            instance = {
              id: newId,
              name: 'star',
              type: 'star',
              object: config,
            };
            break;
          }
          case 'polygon': {
            const config: RegularPolygonConfig = {
              ...commonConfig,
              sides: 6,
              radius: 0,
            };
            instance = {
              id: newId,
              name: 'polygon',
              type: 'polygon',
              object: config,
            };
            break;
          }
          case 'arrow': {
            const config: ArrowConfig = {
              ...commonConfig,
              points: [pos.x, pos.y, pos.x, pos.y],
              pointerLength: 10,
              pointerWidth: 10,
            };
            instance = {
              id: newId,
              name: 'arrow',
              type: 'arrow',
              object: config,
            };
            break;
          }

          default: {
            //it is never due to we must handle each. shapeType id switch block
            const _exhaustiveCheck = selectedTool;
            console.error(`Unhandled shape option: ${_exhaustiveCheck}`);
            return;
          }
        }
        addInstance(instance);
      },
      [selectedTool, addInstance]
    );

    const onMouseMove = useCallback(
      (e: KonvaEventObject<MouseEvent>) => {
        if (!isDrawing || !startPoint || !shapeId) return;

        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        animationFrameRef.current = requestAnimationFrame(() => {
          const stage = e.target.getStage();
          if (!stage) return;

          const pos = getTransformedPointer(stage);
          if (!pos) return;

          const width = pos.x - startPoint.x;
          const height = pos.y - startPoint.y;
          const radius = Math.sqrt(width * width + height * height) / 2;
          const ellipseShiftRadius = Math.sqrt(
            (width * width) / 4 + (height * height) / 4
          );

          updateInstance(shapeId, (instance) => {
            const { type } = instance;

            switch (type) {
              case 'rectangle': {
                const object: RectConfig = {
                  ...instance.object,
                  width,
                  height,
                };
                return { ...instance, object };
              }

              case 'ellipse': {
                const radiusX = !isShiftPressed
                  ? Math.abs(width / 2)
                  : ellipseShiftRadius;
                const radiusY = !isShiftPressed
                  ? Math.abs(height / 2)
                  : ellipseShiftRadius;
                const object: EllipseConfig = {
                  ...instance.object,
                  radiusX,
                  radiusY,
                  x: (startPoint.x + pos.x) / 2,
                  y: (startPoint.y + pos.y) / 2,
                };
                return { ...instance, object };
              }

              case 'star': {
                const object: StarConfig = {
                  ...instance.object,
                  x: (startPoint.x + pos.x) / 2,
                  y: (startPoint.y + pos.y) / 2,
                  outerRadius: Math.abs(radius),
                  innerRadius: Math.abs(radius) * 0.4, // Inner radius is 40% of outer radius for a nice star shape
                  fill: 'transparent',
                  stroke: 'green',
                  strokeWidth: 2,
                };
                return { ...instance, object };
              }

              case 'polygon': {
                const object: RegularPolygonConfig = {
                  ...instance.object,
                  sides: 6,
                  radius: Math.abs(radius),
                  x: (startPoint.x + pos.x) / 2,
                  y: (startPoint.y + pos.y) / 2,
                };
                return { ...instance, object };
              }
              case 'arrow': {
                const object: ArrowConfig = {
                  ...instance.object,
                  points: [startPoint.x, startPoint.y, pos.x, pos.y],
                };
                return { ...instance, object };
              }

              default: {
                return instance;
              }
            }
          });
        });
      },
      [isDrawing, startPoint, shapeId, updateInstance, isShiftPressed]
    );

    const onMouseUp = useCallback(() => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }

      setIsDrawing(false);
      setStartPoint(null);
      setShapeId(null);
    }, []);

    return {
      onMouseDown,
      onMouseMove,
      onMouseUp,
    };
  };
