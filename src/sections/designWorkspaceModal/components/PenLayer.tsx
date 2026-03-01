// import React, { useRef } from 'react';
// import { Line, Circle } from 'react-konva';
// import type { KonvaEventObject } from 'konva/lib/Node';
// import type { CanvasPen } from '../types/canvasTypes';
//
// interface PenLayerProps {
//     pens: CanvasPen[];
//     drawingPen?: CanvasPen | null;
//     selectedObject: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null;
//     setSelectedObject: (obj: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null) => void;
//     setPens: React.Dispatch<React.SetStateAction<CanvasPen[]>>;
//     zoom: number;
//     selectedMouseTool: 'move' | 'hand' | 'scale';
// }
//
// function getLayerCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
//     if ('touches' in e && e.touches.length > 0) {
//         // @ts-expect-error Konva adds layerX/layerY to TouchEvent
//         return { x: e.touches[0].layerX, y: e.touches[0].layerY };
//     }
//     return { x: (e as unknown as MouseEvent).layerX, y: (e as unknown as MouseEvent).layerY };
// }
//
// export const PenLayer: React.FC<PenLayerProps> = ({ pens, drawingPen, selectedObject, setSelectedObject, setPens, zoom, selectedMouseTool }) => {
//     const dragPenId = useRef<string | null>(null);
//     const dragStart = useRef<{ x: number; y: number; points: number[] } | null>(null);
//
//     const handlePenMouseDown = (e: KonvaEventObject<MouseEvent | TouchEvent>, pen: CanvasPen) => {
//         if (selectedMouseTool === 'hand') return;
//         if (e.target.className === 'Circle') return;
//         const { x, y } = getLayerCoords(e.evt);
//         dragPenId.current = pen.id;
//         dragStart.current = {
//             x,
//             y,
//             points: [...pen.points],
//         };
//         setSelectedObject({ type: 'pen', id: pen.id });
//     };
//
//     const handleStageMouseMove = (e: MouseEvent | TouchEvent) => {
//         if (!dragPenId.current || !dragStart.current) return;
//         const { x, y } = getLayerCoords(e);
//         const dx = (x - dragStart.current.x) / zoom;
//         const dy = (y - dragStart.current.y) / zoom;
//         setPens(prev => prev.map(p =>
//             p.id === dragPenId.current
//                 ? { ...p, points: dragStart.current!.points.map((val, idx) => idx % 2 === 0 ? val + dx : val + dy) }
//                 : p
//         ));
//     };
//
//     const handleStageMouseUp = () => {
//         dragPenId.current = null;
//         dragStart.current = null;
//     };
//
//     React.useEffect(() => {
//         const move = (e: MouseEvent | TouchEvent) => handleStageMouseMove(e);
//         const up = () => handleStageMouseUp();
//         if (dragPenId.current) {
//             window.addEventListener('mousemove', move);
//             window.addEventListener('mouseup', up);
//             window.addEventListener('touchmove', move);
//             window.addEventListener('touchend', up);
//         }
//         return () => {
//             window.removeEventListener('mousemove', move);
//             window.removeEventListener('mouseup', up);
//             window.removeEventListener('touchmove', move);
//             window.removeEventListener('touchend', up);
//         };
//     });
//
//     return (
//         <>
//             {drawingPen && (
//                 <Line
//                     points={drawingPen.points}
//                     stroke={drawingPen.color}
//                     strokeWidth={drawingPen.strokeWidth}
//                     lineCap="round"
//                     lineJoin="round"
//                     dash={[8, 8]}
//                     opacity={0.5}
//                     listening={false}
//                 />
//             )}
//             {pens.map(pen => {
//                 const isSelected = selectedObject?.type === 'pen' && selectedObject.id === pen.id;
//                 return (
//                     <React.Fragment key={pen.id}>
//                         <Line
//                             id={pen.id}
//                             points={pen.points}
//                             stroke={pen.color}
//                             strokeWidth={pen.strokeWidth}
//                             lineCap="round"
//                             lineJoin="round"
//                             listening={true}
//                             onMouseDown={e => { e.cancelBubble = true; handlePenMouseDown(e, pen); }}
//                             onTap={e => { e.cancelBubble = true; handlePenMouseDown(e as KonvaEventObject<MouseEvent | TouchEvent>, pen); }}
//                         />
//                         {isSelected && pen.points.length >= 4 && (
//                             <>
//                                 {/* Start handle */}
//                                 <Circle
//                                     x={pen.points[0]}
//                                     y={pen.points[1]}
//                                     radius={10}
//                                     fill="#fff"
//                                     stroke="#AB55DC"
//                                     strokeWidth={3}
//                                     draggable
//                                     onDragMove={e => {
//                                         const { x, y } = e.target.position();
//                                         const dx = x - pen.points[0];
//                                         const dy = y - pen.points[1];
//                                         setPens(prev => prev.map(p => p.id === pen.id ? { ...p, points: p.points.map((val, idx) => idx % 2 === 0 ? val + dx : val + dy) } : p));
//                                     }}
//                                     onMouseDown={e => e.cancelBubble = true}
//                                     onTouchStart={e => e.cancelBubble = true}
//                                     cursor="pointer"
//                                 />
//
//                                 <Circle
//                                     x={pen.points[pen.points.length - 2]}
//                                     y={pen.points[pen.points.length - 1]}
//                                     radius={10}
//                                     fill="#fff"
//                                     stroke="#AB55DC"
//                                     strokeWidth={3}
//                                     draggable
//                                     onDragMove={e => {
//                                         const { x, y } = e.target.position();
//                                         setPens(prev => prev.map(p => {
//                                             if (p.id !== pen.id) return p;
//                                             const newPoints = [...p.points];
//                                             newPoints[newPoints.length - 2] = x;
//                                             newPoints[newPoints.length - 1] = y;
//                                             return { ...p, points: newPoints };
//                                         }));
//                                     }}
//                                     onMouseDown={e => e.cancelBubble = true}
//                                     onTouchStart={e => e.cancelBubble = true}
//                                     cursor="pointer"
//                                 />
//                             </>
//                         )}
//                     </React.Fragment>
//                 );
//             })}
//         </>
//     );
// };
