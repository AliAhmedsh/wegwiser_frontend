// import React, { useRef } from 'react';
// import { Line, Circle, Rect, Ellipse, Group, Star, Arrow } from 'react-konva';
//
// interface CanvasLine {
//     id: string;
//     type: 'line';
//     points: [number, number, number, number];
//     color: string;
//     strokeWidth: number;
//     shapeType?: 'line' | 'rectangle' | 'ellipse' | 'polygon' | 'star' | 'arrow';
//     polygonSides?: number;
// }
//
// interface LinesLayerProps {
//     lines: CanvasLine[];
//     drawingLine?: CanvasLine | null;
//     selectedObject: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null;
//     setSelectedObject: (obj: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null) => void;
//     setLines: React.Dispatch<React.SetStateAction<CanvasLine[]>>;
//     zoom: number;
//     selectedShapeTool: 'line' | 'rectangle' | 'ellipse' | 'polygon' | 'star' | 'arrow';
//     polygonSides?: number;
//     isShiftPressed?: boolean;
//     selectedMouseTool: 'move' | 'hand' | 'scale';
// }
//
// // Тип для Konva event target
// interface KonvaTarget extends EventTarget {
//     getStage?: () => { getPointerPosition: () => { x: number; y: number } };
// }
//
// function getLayerCoords(e: MouseEvent | TouchEvent): { x: number; y: number } {
//     if ('touches' in e && e.touches.length > 0) {
//         // @ts-expect-error Konva adds layerX/layerY to TouchEvent
//         return { x: e.touches[0].layerX, y: e.touches[0].layerY };
//     }
//     // e не TouchEvent, отже це MouseEvent, але TypeScript не знає про layerX
//     const evt = e as unknown as { layerX: number, layerY: number };
//     return { x: evt.layerX, y: evt.layerY };
// }
//
// export const LinesLayer: React.FC<LinesLayerProps> = ({ lines, drawingLine, selectedObject, setSelectedObject, setLines, zoom, selectedShapeTool, polygonSides = 5, isShiftPressed, selectedMouseTool }) => {
//     // Drag state for moving the whole line
//     const dragLineId = useRef<string | null>(null);
//     const dragStart = useRef<{ x: number; y: number; points: [number, number, number, number] } | null>(null);
//
//     const handleStageMouseMove = React.useCallback((e: MouseEvent | TouchEvent) => {
//         if (!dragLineId.current || !dragStart.current) return;
//         let x = 0;
//         let y = 0;
//         // Використовуємо координати Konva для точного drag
//         if ('target' in e) {
//             const target = e.target as KonvaTarget;
//             if (target && typeof target.getStage === 'function') {
//                 const stage = target.getStage();
//                 const pointer = stage?.getPointerPosition();
//                 if (pointer) {
//                     x = pointer.x;
//                     y = pointer.y;
//                 }
//             }
//         }
//         if (!x && !y) {
//             const coords = getLayerCoords(e);
//             x = coords.x;
//             y = coords.y;
//         }
//         const dx = (x - dragStart.current.x) / zoom;
//         const dy = (y - dragStart.current.y) / zoom;
//         setLines(prev => prev.map(l =>
//             l.id === dragLineId.current
//                 ? { ...l, points: [dragStart.current!.points[0] + dx, dragStart.current!.points[1] + dy, dragStart.current!.points[2] + dx, dragStart.current!.points[3] + dy] }
//                 : l
//         ));
//     }, [setLines, zoom]);
//
//     const handleStageMouseUp = () => {
//         dragLineId.current = null;
//         dragStart.current = null;
//     };
//
//     React.useEffect(() => {
//         const move = (e: MouseEvent | TouchEvent) => handleStageMouseMove(e);
//         const up = () => handleStageMouseUp();
//         window.addEventListener('mousemove', move);
//         window.addEventListener('mouseup', up);
//         window.addEventListener('touchmove', move);
//         window.addEventListener('touchend', up);
//
//         return () => {
//             window.removeEventListener('mousemove', move);
//             window.removeEventListener('mouseup', up);
//             window.removeEventListener('touchmove', move);
//             window.removeEventListener('touchend', up);
//         };
//     }, [handleStageMouseMove]);
//
//     // Preview for drawing shape
//     function renderPreview() {
//         if (!drawingLine) return null;
//         const [x1, y1, x2Init, y2Init] = drawingLine.points;
//         let x2 = x2Init;
//         let y2 = y2Init;
//         if (selectedShapeTool === 'line' && isShiftPressed) {
//             // Привʼязка до 0°, 45°, 90°
//             const dx = x2 - x1;
//             const dy = y2 - y1;
//             const angle = Math.atan2(dy, dx);
//             const snap = Math.PI / 4; // 45°
//             const snapped = Math.round(angle / snap) * snap;
//             const length = Math.sqrt(dx * dx + dy * dy);
//             x2 = x1 + length * Math.cos(snapped);
//             y2 = y1 + length * Math.sin(snapped);
//         }
//         if (selectedShapeTool === 'rectangle' && isShiftPressed) {
//             // Квадрат
//             const size = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
//             x2 = x1 + (x2 - x1 >= 0 ? size : -size);
//             y2 = y1 + (y2 - y1 >= 0 ? size : -size);
//         }
//         if (selectedShapeTool === 'ellipse' && isShiftPressed) {
//             // Коло
//             const size = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
//             x2 = x1 + (x2 - x1 >= 0 ? size : -size);
//             y2 = y1 + (y2 - y1 >= 0 ? size : -size);
//         }
//         if (selectedShapeTool === 'polygon' && isShiftPressed) {
//             // Правильний багатокутник (радіуси однакові)
//             const size = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
//             x2 = x1 + (x2 - x1 >= 0 ? size : -size);
//             y2 = y1 + (y2 - y1 >= 0 ? size : -size);
//         }
//         if (selectedShapeTool === 'star') {
//             const cx = (x1 + x2) / 2;
//             const cy = (y1 + y2) / 2;
//             const rx = Math.abs(x2 - x1) / 2;
//             const ry = Math.abs(y2 - y1) / 2;
//             return (
//                 <Star
//                     x={cx}
//                     y={cy}
//                     numPoints={5}
//                     innerRadius={Math.min(rx, ry) / 2}
//                     outerRadius={Math.max(rx, ry)}
//                     stroke={drawingLine.color}
//                     strokeWidth={drawingLine.strokeWidth}
//                     dash={[8, 8]}
//                     opacity={0.7}
//                     listening={false}
//                 />
//             );
//         }
//         if (selectedShapeTool === 'arrow') {
//             return (
//                 <Arrow
//                     points={[x1, y1, x2, y2]}
//                     stroke={drawingLine.color}
//                     strokeWidth={drawingLine.strokeWidth}
//                     pointerLength={18}
//                     pointerWidth={18}
//                     dash={[8, 8]}
//                     opacity={0.7}
//                     listening={false}
//                 />
//             );
//         }
//         if (selectedShapeTool === 'line') {
//             return (
//                 <Line
//                     points={[x1, y1, x2, y2]}
//                     stroke={drawingLine.color}
//                     strokeWidth={drawingLine.strokeWidth}
//                     lineCap="round"
//                     lineJoin="round"
//                     dash={[8, 8]}
//                     opacity={0.7}
//                     listening={false}
//                 />
//             );
//         }
//         if (selectedShapeTool === 'rectangle') {
//             const width = x2 - x1;
//             const height = y2 - y1;
//             return (
//                 <Rect
//                     x={x1}
//                     y={y1}
//                     width={width}
//                     height={height}
//                     stroke={drawingLine.color}
//                     strokeWidth={drawingLine.strokeWidth}
//                     dash={[8, 8]}
//                     opacity={0.7}
//                     listening={false}
//                 />
//             );
//         }
//         if (selectedShapeTool === 'ellipse') {
//             const rx = Math.abs(x2 - x1) / 2;
//             const ry = Math.abs(y2 - y1) / 2;
//             return (
//                 <Ellipse
//                     x={x1 + rx}
//                     y={y1 + ry}
//                     radiusX={rx}
//                     radiusY={ry}
//                     stroke={drawingLine.color}
//                     strokeWidth={drawingLine.strokeWidth}
//                     dash={[8, 8]}
//                     opacity={0.7}
//                     listening={false}
//                 />
//             );
//         }
//         if (selectedShapeTool === 'polygon') {
//             const cx = (x1 + x2) / 2;
//             const cy = (y1 + y2) / 2;
//             const rx = Math.abs(x2 - x1) / 2;
//             const ry = Math.abs(y2 - y1) / 2;
//             const points: number[] = [];
//             for (let i = 0; i < polygonSides; i++) {
//                 const angle = (2 * Math.PI * i) / polygonSides - Math.PI / 2;
//                 points.push(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
//             }
//             return (
//                 <Line
//                     points={[...points, points[0], points[1]]}
//                     stroke={drawingLine.color}
//                     strokeWidth={drawingLine.strokeWidth}
//                     dash={[8, 8]}
//                     opacity={0.7}
//                     listening={false}
//                     closed
//                 />
//             );
//         }
//         return null;
//     }
//
//     return (
//         <>
//             {renderPreview()}
//             {lines.map(line => {
//                 const isSelected = selectedObject?.type === 'line' && selectedObject.id === line.id;
//                 const [x1, y1, x2, y2] = line.points;
//                 const shapeType = line.shapeType || 'line';
//                 // Rectangle
//                 if (shapeType === 'rectangle') {
//                     const width = x2 - x1;
//                     const height = y2 - y1;
//                     return (
//                         <Group
//                             key={line.id}
//                             x={x1}
//                             y={y1}
//                             draggable={selectedMouseTool !== 'hand'}
//                             onDragMove={e => {
//                                 const { x, y } = e.target.position();
//                                 setLines(prev => prev.map(l => l.id === line.id ? { ...l, points: [x, y, x + width, y + height] } : l));
//                             }}
//                             onClick={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                             onTap={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                         >
//                             <Rect
//                                 id={line.id}
//                                 x={0}
//                                 y={0}
//                                 width={width}
//                                 height={height}
//                                 stroke={line.color}
//                                 strokeWidth={line.strokeWidth}
//                                 listening={true}
//                             />
//                         </Group>
//                     );
//                 }
//                 // Ellipse
//                 if (shapeType === 'ellipse') {
//                     const rx = Math.abs(x2 - x1) / 2;
//                     const ry = Math.abs(y2 - y1) / 2;
//                     return (
//                         <Group
//                             key={line.id}
//                             x={x1 + rx}
//                             y={y1 + ry}
//                             draggable={selectedMouseTool !== 'hand'}
//                             onDragMove={e => {
//                                 const { x, y } = e.target.position();
//                                 setLines(prev => prev.map(l => l.id === line.id ? { ...l, points: [x - rx, y - ry, x + rx, y + ry] } : l));
//                             }}
//                             onClick={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                             onTap={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                         >
//                             <Ellipse
//                                 id={line.id}
//                                 x={0}
//                                 y={0}
//                                 radiusX={rx}
//                                 radiusY={ry}
//                                 stroke={line.color}
//                                 strokeWidth={line.strokeWidth}
//                                 listening={true}
//                             />
//                         </Group>
//                     );
//                 }
//                 // Polygon
//                 if (shapeType === 'polygon') {
//                     const sides = line.polygonSides || 5;
//                     const cx = (x1 + x2) / 2;
//                     const cy = (y1 + y2) / 2;
//                     const rx = Math.abs(x2 - x1) / 2;
//                     const ry = Math.abs(y2 - y1) / 2;
//                     const points: number[] = [];
//                     for (let i = 0; i < sides; i++) {
//                         const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
//                         points.push(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
//                     }
//                     return (
//                         <Group
//                             key={line.id}
//                             x={cx}
//                             y={cy}
//                             draggable={selectedMouseTool !== 'hand'}
//                             onDragMove={e => {
//                                 const { x, y } = e.target.position();
//                                 const dx = x - cx;
//                                 const dy = y - cy;
//                                 setLines(prev => prev.map(l => l.id === line.id ? { ...l, points: [x1 + dx, y1 + dy, x2 + dx, y2 + dy] } : l));
//                             }}
//                             onClick={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                             onTap={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                         >
//                             <Line
//                                 id={line.id}
//                                 points={points.map((val, idx) => idx % 2 === 0 ? val - cx : val - cy).concat([points[0] - cx, points[1] - cy])}
//                                 stroke={line.color}
//                                 strokeWidth={line.strokeWidth}
//                                 closed
//                                 listening={true}
//                             />
//                         </Group>
//                     );
//                 }
//                 // Star
//                 if (shapeType === 'star') {
//                     const cx = (x1 + x2) / 2;
//                     const cy = (y1 + y2) / 2;
//                     const rx = Math.abs(x2 - x1) / 2;
//                     const ry = Math.abs(y2 - y1) / 2;
//                     return (
//                         <Group
//                             key={line.id}
//                             x={cx}
//                             y={cy}
//                             draggable={selectedMouseTool !== 'hand'}
//                             onDragMove={e => {
//                                 const { x, y } = e.target.position();
//                                 const dx = x - cx;
//                                 const dy = y - cy;
//                                 setLines(prev => prev.map(l => l.id === line.id ? { ...l, points: [x1 + dx, y1 + dy, x2 + dx, y2 + dy] } : l));
//                             }}
//                             onClick={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                             onTap={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                         >
//                             <Star
//                                 id={line.id}
//                                 x={0}
//                                 y={0}
//                                 numPoints={5}
//                                 innerRadius={Math.min(rx, ry) / 2}
//                                 outerRadius={Math.max(rx, ry)}
//                                 stroke={line.color}
//                                 strokeWidth={line.strokeWidth}
//                                 listening={true}
//                             />
//                         </Group>
//                     );
//                 }
//                 // Arrow
//                 if (shapeType === 'arrow') {
//                     return (
//                         <Group
//                             key={line.id}
//                             x={0}
//                             y={0}
//                             draggable={selectedMouseTool !== 'hand'}
//                             onDragMove={e => {
//                                 const { x, y } = e.target.position();
//                                 const dx = x - x1;
//                                 const dy = y - y1;
//                                 setLines(prev => prev.map(l => l.id === line.id ? { ...l, points: [x, y, x2 + dx, y2 + dy] } : l));
//                             }}
//                             onClick={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                             onTap={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                         >
//                             <Arrow
//                                 id={line.id}
//                                 points={[x1, y1, x2, y2]}
//                                 stroke={line.color}
//                                 strokeWidth={line.strokeWidth}
//                                 pointerLength={18}
//                                 pointerWidth={18}
//                                 listening={true}
//                             />
//                         </Group>
//                     );
//                 }
//                 // line (default)
//                 return (
//                     <Group
//                         key={line.id}
//                         x={x1}
//                         y={y1}
//                         draggable={selectedMouseTool !== 'hand'}
//                         onDragMove={e => {
//                             const { x, y } = e.target.position();
//                             const dx = x - x1;
//                             const dy = y - y1;
//                             setLines(prev => prev.map(l => l.id === line.id ? { ...l, points: [x, y, x2 + dx, y2 + dy] } : l));
//                         }}
//                         onClick={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                         onTap={e => { e.cancelBubble = true; setSelectedObject({ type: 'line', id: line.id }); }}
//                     >
//                         <Line
//                             id={line.id}
//                             points={[0, 0, x2 - x1, y2 - y1]}
//                             stroke={line.color}
//                             strokeWidth={line.strokeWidth}
//                             lineCap="round"
//                             lineJoin="round"
//                             listening={true}
//                         />
//                         {isSelected && (
//                             <>
//                                 {/* Start handle */}
//                                 <Circle
//                                     x={0}
//                                     y={0}
//                                     radius={10}
//                                     fill="#fff"
//                                     stroke="#AB55DC"
//                                     strokeWidth={3}
//                                     draggable
//                                     onDragMove={e => {
//                                         const { x, y } = e.target.position();
//                                         setLines(prev => prev.map(l => l.id === line.id ? { ...l, points: [x, y, l.points[2], l.points[3]] } : l));
//                                     }}
//                                     onMouseDown={e => e.cancelBubble = true}
//                                     onTouchStart={e => e.cancelBubble = true}
//                                     cursor="pointer"
//                                 />
//                                 {/* End handle */}
//                                 <Circle
//                                     x={x2 - x1}
//                                     y={y2 - y1}
//                                     radius={10}
//                                     fill="#fff"
//                                     stroke="#AB55DC"
//                                     strokeWidth={3}
//                                     draggable
//                                     onDragMove={e => {
//                                         const { x, y } = e.target.position();
//                                         setLines(prev => prev.map(l => l.id === line.id ? { ...l, points: [l.points[0], l.points[1], x + x1, y + y1] } : l));
//                                     }}
//                                     onMouseDown={e => e.cancelBubble = true}
//                                     onTouchStart={e => e.cancelBubble = true}
//                                     cursor="pointer"
//                                 />
//                             </>
//                         )}
//                     </Group>
//                 );
//             })}
//         </>
//     );
// };
