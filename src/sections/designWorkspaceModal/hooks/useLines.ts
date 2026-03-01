// import { useState, useRef, useCallback } from 'react';
// import type { CanvasLine, SelectionObject } from '../types/canvasTypes';
// import type { KonvaEventObject } from 'konva/lib/Node';
// import type Konva from 'konva';
//
// function getLayerCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
//   if ('touches' in e && e.touches.length > 0) {
//     // @ts-expect-error Konva adds layerX/layerY to TouchEvent
//     return { x: e.touches[0].layerX, y: e.touches[0].layerY };
//   }
//   return {
//     x: (e as unknown as MouseEvent).layerX,
//     y: (e as unknown as MouseEvent).layerY,
//   };
// }
//
// export function useLines(
//   stageRef: React.RefObject<Konva.Stage | null>,
//   zoom: number,
//   pan: { x: number; y: number }
// ) {
//   const [lines, setLines] = useState<CanvasLine[]>([]);
//   const [drawingLine, setDrawingLine] = useState<CanvasLine | null>(null);
//   const [selectedObject, setSelectedObject] = useState<SelectionObject>(null);
//
//   // Drag state for moving the whole line
//   const dragLineId = useRef<string | null>(null);
//   const dragStart = useRef<{
//     pointer: { x: number; y: number };
//     points: [number, number, number, number];
//   } | null>(null);
//
//   const getPointer = useCallback(() => {
//     const pointer = stageRef.current?.getPointerPosition();
//     if (!pointer) return null;
//     return {
//       x: (pointer.x - pan.x) / zoom,
//       y: (pointer.y - pan.y) / zoom,
//     };
//   }, [stageRef, pan, zoom]);
//
//   const handleStageMouseDown =
//     (
//       tool: string,
//       selectedShapeTool:
//         | 'line'
//         | 'rectangle'
//         | 'ellipse'
//         | 'polygon'
//         | 'star'
//         | 'arrow',
//       polygonSides = 5
//     ) =>
//     (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
//       if (tool === 'inclined') {
//         const pointer = getPointer();
//         if (!pointer) return;
//         const newLine: CanvasLine = {
//           id: `line-${Date.now()}`,
//           type: 'line',
//           points: [pointer.x, pointer.y, pointer.x, pointer.y],
//           color: '#181818',
//           strokeWidth: 3,
//           shapeType: selectedShapeTool,
//           polygonSides,
//         };
//         setDrawingLine(newLine);
//         setSelectedObject(null);
//         return;
//       }
//       // Drag всієї лінії
//       if (selectedObject?.type === 'line') {
//         const line = lines.find((l) => l.id === selectedObject.id);
//         if (!line) return;
//         if (e.target.className === 'Circle') return;
//         const pointer = getPointer();
//         if (!pointer) return;
//         dragLineId.current = line.id;
//         dragStart.current = {
//           pointer,
//           points: [...line.points],
//         };
//       }
//     };
//
//   const handleStageMouseMove =
//     (
//       tool: string,
//       selectedShapeTool:
//         | 'line'
//         | 'rectangle'
//         | 'ellipse'
//         | 'polygon'
//         | 'star'
//         | 'arrow',
//       polygonSides = 5,
//       isShiftPressed = false
//     ) =>
//     (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
//       if (tool === 'inclined' && drawingLine) {
//         const pointer = getPointer();
//         if (!pointer) return;
//         const x1 = drawingLine.points[0];
//         const y1 = drawingLine.points[1];
//         let x2 = pointer.x;
//         let y2 = pointer.y;
//         // Shift для ідеальних форм
//         if (selectedShapeTool === 'line' && isShiftPressed) {
//           const dx = x2 - x1;
//           const dy = y2 - y1;
//           const angle = Math.atan2(dy, dx);
//           const snap = Math.PI / 4;
//           const snapped = Math.round(angle / snap) * snap;
//           const length = Math.sqrt(dx * dx + dy * dy);
//           x2 = x1 + length * Math.cos(snapped);
//           y2 = y1 + length * Math.sin(snapped);
//         }
//         if (
//           (selectedShapeTool === 'rectangle' ||
//             selectedShapeTool === 'ellipse' ||
//             selectedShapeTool === 'polygon' ||
//             selectedShapeTool === 'star' ||
//             selectedShapeTool === 'arrow') &&
//           isShiftPressed
//         ) {
//           const size = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
//           x2 = x1 + (x2 - x1 >= 0 ? size : -size);
//           y2 = y1 + (y2 - y1 >= 0 ? size : -size);
//         }
//         setDrawingLine({
//           ...drawingLine,
//           points: [x1, y1, x2, y2],
//           shapeType: selectedShapeTool,
//           polygonSides,
//         });
//         return;
//       }
//       // Drag всієї лінії
//       if (dragLineId.current && dragStart.current) {
//         const evt = e.evt as MouseEvent | TouchEvent;
//         const { x, y } = getLayerCoords(evt);
//         const dx = x - dragStart.current.pointer.x;
//         const dy = y - dragStart.current.pointer.y;
//         setLines((prev) =>
//           prev.map((l) =>
//             l.id === dragLineId.current
//               ? {
//                   ...l,
//                   points: [
//                     dragStart.current!.points[0] + dx,
//                     dragStart.current!.points[1] + dy,
//                     dragStart.current!.points[2] + dx,
//                     dragStart.current!.points[3] + dy,
//                   ],
//                 }
//               : l
//           )
//         );
//       }
//     };
//
//   const handleStageMouseUp =
//     (
//       tool: string
//       // selectedShapeTool: 'line' | 'rectangle' | 'ellipse' | 'polygon'
//     ) =>
//     () => {
//       if (tool === 'inclined' && drawingLine) {
//         setLines((prev) => [...prev, drawingLine]);
//         setDrawingLine(null);
//         setSelectedObject({ type: 'line', id: drawingLine.id });
//         dragLineId.current = null;
//         dragStart.current = null;
//         return;
//       }
//       dragLineId.current = null;
//       dragStart.current = null;
//     };
//
//   return {
//     lines,
//     setLines,
//     drawingLine,
//     selectedObject,
//     setSelectedObject,
//     handleStageMouseDown,
//     handleStageMouseMove,
//     handleStageMouseUp,
//   };
// }
