// import { useState, useRef, useCallback } from 'react';
// import type { CanvasPen, SelectionObject } from '../types/canvasTypes';
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
// export function usePen(
//   stageRef: React.RefObject<Konva.Stage | null>,
//   zoom: number,
//   pan: { x: number; y: number },
//   onPenDrawEnd?: (pen: CanvasPen) => void
// ) {
//   const [pens, setPens] = useState<CanvasPen[]>([]);
//   const [drawingPen, setDrawingPen] = useState<CanvasPen | null>(null);
//   const [selectedObject, setSelectedObject] = useState<SelectionObject>(null);
//
//   // Drag state for moving the whole pen stroke
//   const dragPenId = useRef<string | null>(null);
//   const dragStart = useRef<{
//     pointer: { x: number; y: number };
//     points: number[];
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
//   // Почати малювання pen
//   const handleStageMouseDown =
//     (tool: string) => (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
//       if (tool === 'pen') {
//         const pointer = getPointer();
//         if (!pointer) return;
//         const newPen: CanvasPen = {
//           id: `pen-${Date.now()}`,
//           type: 'pen',
//           points: [pointer.x, pointer.y],
//           color: '#181818',
//           strokeWidth: 3,
//         };
//         setDrawingPen(newPen);
//         setSelectedObject(null);
//         return;
//       }
//       // Drag всієї pen-кривої
//       if (selectedObject?.type === 'pen') {
//         const pen = pens.find((p) => p.id === selectedObject.id);
//         if (!pen) return;
//         if (e.target.className === 'Circle') return;
//         const pointer = getPointer();
//         if (!pointer) return;
//         dragPenId.current = pen.id;
//         dragStart.current = {
//           pointer,
//           points: [...pen.points],
//         };
//       }
//     };
//
//   // Малювання pen (додавання точок)
//   const handleStageMouseMove =
//     (tool: string) => (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
//       if (tool === 'pen' && drawingPen) {
//         const pointer = getPointer();
//         if (!pointer) return;
//         setDrawingPen({
//           ...drawingPen,
//           points: [...drawingPen.points, pointer.x, pointer.y],
//         });
//         return;
//       }
//       // Drag всієї pen-кривої
//       if (dragPenId.current && dragStart.current) {
//         // Використовуємо getLayerCoords для MouseEvent | TouchEvent
//         const evt = e.evt as MouseEvent | TouchEvent;
//         const { x, y } = getLayerCoords(evt);
//         const dx = x - dragStart.current.pointer.x;
//         const dy = y - dragStart.current.pointer.y;
//         setPens((prev) =>
//           prev.map((p) =>
//             p.id === dragPenId.current
//               ? {
//                   ...p,
//                   points: p.points.map((val, idx) =>
//                     idx % 2 === 0 ? val + dx : val + dy
//                   ),
//                 }
//               : p
//           )
//         );
//       }
//     };
//
//   // Завершити малювання pen
//   const handleStageMouseUp = (tool: string) => () => {
//     if (tool === 'pen' && drawingPen) {
//       if (onPenDrawEnd) {
//         onPenDrawEnd(drawingPen);
//       } else {
//         setPens((prev) => [...prev, drawingPen]);
//       }
//       setDrawingPen(null);
//       setSelectedObject({ type: 'pen', id: drawingPen.id });
//       dragPenId.current = null;
//       dragStart.current = null;
//       return;
//     }
//     dragPenId.current = null;
//     dragStart.current = null;
//   };
//
//   // Видалення pen stroke
//   const deleteSelected = () => {
//     if (selectedObject?.type === 'pen') {
//       setPens((prev) => prev.filter((p) => p.id !== selectedObject.id));
//       setSelectedObject(null);
//     }
//   };
//
//   return {
//     pens,
//     setPens,
//     drawingPen,
//     selectedObject,
//     setSelectedObject,
//     handleStageMouseDown,
//     handleStageMouseMove,
//     handleStageMouseUp,
//     deleteSelected,
//   };
// }
