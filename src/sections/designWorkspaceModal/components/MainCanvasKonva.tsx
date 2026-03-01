// import React, { useState, useRef, useEffect } from 'react';
// import { Stage, Layer, Rect } from 'react-konva';
// import { usePhoneResize } from '../hooks/usePhoneResize';
// import { usePhoneDrag } from '../hooks/usePhoneDrag';
// import { useStagePan } from '../hooks/useStagePan';
// import type { AIMessages } from '../types/designWorkspaceTypes';
// import { ToolbarPanel } from './ToolbarPanel';
// import { ShapePickerPanel } from './ShapePickerPanel';
// import { KonvaEventObject } from 'konva/lib/Node';
// import { useShapeDrag } from '../hooks/useShapeDrag';
// import { PhonesLayer } from './PhonesLayer';
// import { ShapesLayer } from './ShapesLayer';
// import { TextLayer } from './TextLayer';
// import type { ShapeResizeCorner } from './ShapeResizeHandles';
// import type { ResizeCorner } from '../hooks/usePhoneResize';
// import { LinesLayer } from './LinesLayer';
// import type { CanvasShape, CanvasLine, CanvasText, Phone, ActiveResize, CanvasPen } from '../types/canvasTypes';
// import { useLines } from '../hooks/useLines';
// import { usePen } from '../hooks/usePen';
// import { PenLayer } from './PenLayer';
// import type Konva from 'konva';
//
// interface MainCanvasKonvaProps {
//     setShowAIPartner: React.Dispatch<React.SetStateAction<boolean>>;
//     setAIMessages: React.Dispatch<React.SetStateAction<AIMessages>>;
//     stageSize: { width: number; height: number };
//     selectedObject: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null;
//     setSelectedObject: (obj: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null) => void;
//     shapes: CanvasShape[];
//     setShapes: React.Dispatch<React.SetStateAction<CanvasShape[]>>;
//     lines: CanvasLine[];
//     setLines: React.Dispatch<React.SetStateAction<CanvasLine[]>>;
//     phones: Phone[];
//     setPhones: React.Dispatch<React.SetStateAction<Phone[]>>;
//     pens?: CanvasPen[];
//     setPens?: React.Dispatch<React.SetStateAction<CanvasPen[]>>;
//     stageRef: React.RefObject<Konva.Stage>;
//     selectedMouseTool: 'move' | 'hand' | 'scale';
//     setSelectedMouseTool: React.Dispatch<React.SetStateAction<'move' | 'hand' | 'scale'>>;
// }
//
// export default function MainCanvasKonva({ setShowAIPartner, setAIMessages, stageSize, selectedObject, setSelectedObject, shapes, setShapes, lines, setLines, phones, setPhones, pens, setPens, stageRef, selectedMouseTool, setSelectedMouseTool }: MainCanvasKonvaProps) {
//     const [hoveredId, setHoveredId] = useState<string | null>(null);
//     const [zoom, setZoom] = useState(1);
//     const [selectedTool, setSelectedTool] = useState<string>('mouse');
//     const [showShapePicker, setShowShapePicker] = useState(false);
//     const [selectedShape, setSelectedShape] = useState<'square' | 'triangle' | 'circle' | 'diamond' | undefined>(undefined);
//     const [selectedColor, setSelectedColor] = useState<string>('#AB55DC');
//     const [activeResize, setActiveResize] = useState<ActiveResize | null>(null);
//     const [texts, setTexts] = useState<CanvasText[]>([]);
//     const [editingTextId, setEditingTextId] = useState<string | null>(null);
//     const [selectedId, setSelectedId] = useState<string | null>(null);
//     const [selectedShapeTool, setSelectedShapeTool] = useState<'line' | 'rectangle' | 'ellipse' | 'polygon'>('line');
//     const [isShiftPressed, setIsShiftPressed] = useState(false);
//     const [polygonSides, setPolygonSides] = useState(5);
//     const [selectionRect, setSelectionRect] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
//     const selectionStart = useRef<{ x: number, y: number } | null>(null);
//
//     const resize = usePhoneResize();
//     const drag = usePhoneDrag();
//     const pan = useStagePan();
//     const shapeDrag = useShapeDrag();
//     const penApi = usePen(stageRef, zoom, pan.stagePos);
//     const linesApi = useLines(stageRef, zoom, pan.stagePos);
//
//     const aiOptions = [
//         'Create style guide',
//         'Create moodboard',
//         'Suggest alternate color palette',
//         'Generate wireframes',
//     ];
//     const handleDivClick = () => {
//         setShowAIPartner(true);
//         setAIMessages((prev: AIMessages) => [
//             ...prev,
//             {
//                 id: Date.now().toString(),
//                 kind: 'options',
//                 text: 'Looks like you have selected the home screen of a fitness application. What would you like help with?',
//                 options: aiOptions,
//             },
//         ]);
//     };
//
//     const handleZoomIn = () => {
//         const stage = stageRef.current;
//         if (!stage) return;
//         const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
//         const oldScale = zoom;
//         const scaleBy = 1.1;
//         const newZoom = Math.min(2, oldScale * scaleBy);
//         setZoom(newZoom);
//         const mousePointTo = {
//             x: (center.x - pan.stagePos.x) / oldScale,
//             y: (center.y - pan.stagePos.y) / oldScale,
//         };
//         pan.setStagePos({
//             x: center.x - mousePointTo.x * newZoom,
//             y: center.y - mousePointTo.y * newZoom,
//         });
//     };
//     const handleZoomOut = () => {
//         const stage = stageRef.current;
//         if (!stage) return;
//         const center = { x: stageSize.width / 2, y: stageSize.height / 2 };
//         const oldScale = zoom;
//         const scaleBy = 1.1;
//         const newZoom = Math.max(0.1, oldScale / scaleBy);
//         setZoom(newZoom);
//         const mousePointTo = {
//             x: (center.x - pan.stagePos.x) / oldScale,
//             y: (center.y - pan.stagePos.y) / oldScale,
//         };
//         pan.setStagePos({
//             x: center.x - mousePointTo.x * newZoom,
//             y: center.y - mousePointTo.y * newZoom,
//         });
//     };
//     const handleWheel = (e: KonvaEventObject<WheelEvent>) => {
//         if (e.evt.ctrlKey || e.evt.metaKey) {
//             e.evt.preventDefault();
//             const scaleBy = 1.05;
//             const stage = stageRef.current;
//             if (!stage) return;
//             const oldScale = zoom;
//             const pointer = stage.getPointerPosition();
//             if (!pointer) return;
//             const mousePointTo = {
//                 x: (pointer.x - pan.stagePos.x) / oldScale,
//                 y: (pointer.y - pan.stagePos.y) / oldScale,
//             };
//             let newZoom = oldScale;
//             if (e.evt.deltaY < 0) {
//                 newZoom = Math.min(2, oldScale * scaleBy);
//             } else {
//                 newZoom = Math.max(0.1, oldScale / scaleBy);
//             }
//             setZoom(newZoom);
//             pan.setStagePos({
//                 x: pointer.x - mousePointTo.x * newZoom,
//                 y: pointer.y - mousePointTo.y * newZoom,
//             });
//         }
//     };
//
//     const getPointer = () => {
//         const pointer = stageRef.current?.getPointerPosition();
//         if (!pointer) return null;
//         return {
//             x: (pointer.x - pan.stagePos.x) / zoom,
//             y: (pointer.y - pan.stagePos.y) / zoom,
//         };
//     };
//
//     const isAnyDrag = penApi.drawingPen || linesApi.drawingLine || activeResize || resize.resizing || pan.isPanning;
//
//     const handleStageMouseDown = (e: KonvaEventObject<MouseEvent>) => {
//         if (selectedTool === 'inclined') {
//             const pointer = getPointer();
//             if (!pointer) return;
//             const newLine: CanvasLine = {
//                 id: `line-${Date.now()}`,
//                 type: 'line',
//                 points: [pointer.x, pointer.y, pointer.x, pointer.y],
//                 color: '#181818',
//                 strokeWidth: 3,
//             };
//             setSelectedObject({ type: 'line', id: newLine.id });
//             return;
//         }
//         if (activeResize) return;
//         if (resize.resizing) return;
//         if (selectedTool === 'mouse') {
//             if (selectedMouseTool === 'hand') {
//                 if (e.target === e.target.getStage() && !isAnyDrag) {
//                     pan.onPanStart(e.evt.clientX, e.evt.clientY);
//                 }
//                 return;
//             }
//             if (e.target === e.target.getStage()) {
//                 penApi.setSelectedObject(null);
//                 linesApi.setSelectedObject(null);
//                 setSelectedObject(null);
//             }
//         }
//         if (selectedTool === 'mouse' && selectedMouseTool === 'move') {
//             if (e.target === e.target.getStage()) {
//                 const stage = stageRef.current;
//                 if (!stage) return;
//                 const pointer = stage.getPointerPosition();
//                 if (!pointer) return;
//                 const start = { x: (pointer.x - pan.stagePos.x) / zoom, y: (pointer.y - pan.stagePos.y) / zoom };
//                 selectionStart.current = start;
//                 setSelectionRect({ x: start.x, y: start.y, width: 0, height: 0 });
//             }
//         }
//     };
//     const handleStageMouseMove = (e: KonvaEventObject<MouseEvent>) => {
//         if (activeResize?.type === 'shape') {
//             const pointer = stageRef.current?.getPointerPosition();
//             if (!pointer) return;
//             setShapes(prev => prev.map(shape => {
//                 if (shape.id !== activeResize.id) return shape;
//                 const dx = pointer.x - activeResize.startPointer.x;
//                 const dy = pointer.y - activeResize.startPointer.y;
//                 const newSize = Math.max(20, activeResize.startSize + Math.max(dx, dy));
//                 return { ...shape, size: newSize };
//             }));
//             return;
//         }
//         if (resize.resizing && resize.resizeStart) {
//             const pointer = stageRef.current?.getPointerPosition();
//             if (!pointer) return;
//             setPhones((prev) =>
//                 prev.map((phone) => {
//                     if (phone.id === resize.resizing?.id && resize.resizeStart) {
//                         const { x, y, width, height, phoneX, phoneY } = resize.resizeStart;
//                         let newX = phoneX;
//                         let newY = phoneY;
//                         let newWidth = width;
//                         let newHeight = height;
//                         const dx = pointer.x - x;
//                         const dy = pointer.y - y;
//                         switch (resize.resizing.corner) {
//                             case 'nw':
//                                 newX = phoneX + dx;
//                                 newY = phoneY + dy;
//                                 newWidth = Math.max(60, width - dx);
//                                 newHeight = Math.max(120, height - dy);
//                                 break;
//                             case 'ne':
//                                 newY = phoneY + dy;
//                                 newWidth = Math.max(60, width + dx);
//                                 newHeight = Math.max(120, height - dy);
//                                 break;
//                             case 'sw':
//                                 newX = phoneX + dx;
//                                 newWidth = Math.max(60, width - dx);
//                                 newHeight = Math.max(120, height + dy);
//                                 break;
//                             case 'se':
//                                 newWidth = Math.max(60, width + dx);
//                                 newHeight = Math.max(120, height + dy);
//                                 break;
//                         }
//                         return { ...phone, x: newX, y: newY, width: newWidth, height: newHeight };
//                     }
//                     return phone;
//                 })
//             );
//             return;
//         }
//         if (pan.isPanning && selectedTool === 'mouse') {
//             pan.onPanMove(e.evt.clientX, e.evt.clientY);
//         }
//         if (selectionStart.current && selectedMouseTool === 'move') {
//             const stage = stageRef.current;
//             if (!stage) return;
//             const pointer = stage.getPointerPosition();
//             if (!pointer) return;
//             const curr = { x: (pointer.x - pan.stagePos.x) / zoom, y: (pointer.y - pan.stagePos.y) / zoom };
//             const x = Math.min(selectionStart.current.x, curr.x);
//             const y = Math.min(selectionStart.current.y, curr.y);
//             const width = Math.abs(curr.x - selectionStart.current.x);
//             const height = Math.abs(curr.y - selectionStart.current.y);
//             setSelectionRect({ x, y, width, height });
//         }
//     };
//     const handleStageMouseUp = () => {
//         if (selectedTool === 'inclined' && selectedObject && selectedObject.type === 'line') {
//             setShapes(prev => prev.filter(s => s.id !== selectedObject.id));
//             setSelectedObject(null);
//             return;
//         }
//         setActiveResize(null);
//         if (selectedTool === 'mouse') pan.onPanEnd();
//         resize.endResize();
//         if (selectionRect && selectedMouseTool === 'move') {
//             console.log('selectionRect (canvas-coords):', selectionRect);
//             shapes.forEach(shape => {
//                 console.log('shape', shape.id, 'x:', shape.x, 'y:', shape.y, 'size:', shape.size);
//             });
//             const selectedShapes = shapes.filter(shape =>
//                 shape.x + shape.size > selectionRect.x &&
//                 shape.x < selectionRect.x + selectionRect.width &&
//                 shape.y + shape.size > selectionRect.y &&
//                 shape.y < selectionRect.y + selectionRect.height
//             );
//             console.log('Selected shapes:', selectedShapes);
//             setSelectionRect(null);
//             selectionStart.current = null;
//         }
//     };
//
//     const handlePhoneDragEnd = (id: string) => (e: KonvaEventObject<DragEvent>) => {
//         setPhones(prev => prev.map(p => p.id === id ? { ...p, x: e.target.x(), y: e.target.y() } : p));
//         drag.onDragEnd();
//     };
//
//     const handlePhoneHover = (id: string, hovered: boolean) => {
//         if (selectedMouseTool !== 'move') return;
//         setHoveredId(hovered ? id : null);
//     };
//
//     const handleToolSelect = (tool: string) => {
//         setSelectedTool(tool);
//         if (tool === 'shapes') {
//             setShowShapePicker(true);
//         } else {
//             setShowShapePicker(false);
//         }
//     };
//     const handleAddPhone = () => {
//         setPhones(prev => [
//             ...prev,
//             {
//                 id: `phone-${Date.now()}`,
//                 x: 150 + prev.length * 40,
//                 y: 120 + prev.length * 40,
//                 width: 130,
//                 height: 260,
//             },
//         ]);
//         setShowShapePicker(false);
//     };
//     const handleCloseShapePicker = () => setShowShapePicker(false);
//
//     const handleShapeSelect = (shape: string) => {
//         const validShape = shape as 'square' | 'triangle' | 'circle' | 'diamond';
//         setSelectedShape(validShape);
//
//         const centerX = stageSize.width / 2 / zoom - pan.stagePos.x / zoom;
//         const centerY = stageSize.height / 2 / zoom - pan.stagePos.y / zoom;
//         setShapes(prev => [
//             ...prev,
//             {
//                 id: `${validShape}-${Date.now()}`,
//                 type: validShape,
//                 x: centerX - 40,
//                 y: centerY - 40,
//                 size: 80,
//                 color: selectedColor,
//             },
//         ]);
//         setShowShapePicker(false);
//     };
//
//     const handleShapeStartResize = (id: string, corner: ShapeResizeCorner, pointer: { x: number; y: number }, shape: CanvasShape) => {
//         setActiveResize({
//             id,
//             type: 'shape',
//             corner,
//             startPointer: pointer,
//             startSize: shape.size,
//         });
//     };
//     const handlePhoneStartResize = (id: string, corner: ResizeCorner, pointer: { x: number; y: number }, phone: Phone) => {
//         resize.startResize(id, corner, pointer, phone);
//     };
//
//     const handleStageClick = () => {
//         if (selectedTool === 'text') {
//             const pointer = stageRef.current?.getPointerPosition();
//             if (!pointer) return;
//             const id = `text-${Date.now()}`;
//             setTexts(prev => [
//                 ...prev,
//                 {
//                     id,
//                     type: 'text',
//                     x: pointer.x,
//                     y: pointer.y,
//                     width: 120,
//                     height: 40,
//                     value: '',
//                     fontSize: 24,
//                     color: '#181818',
//                 }
//             ]);
//             setEditingTextId(id);
//             setSelectedTool('mouse');
//         }
//     };
//
//     useEffect(() => {
//         const handleKeyDown = (e: KeyboardEvent) => {
//             if ((e.key === 'Delete' || e.key === 'Backspace')) {
//                 if (selectedObject?.type === 'pen') {
//                     if (setPens) setPens(prev => prev.filter(p => p.id !== selectedObject.id));
//                     setSelectedObject(null);
//                     return;
//                 }
//                 if (selectedObject?.type === 'line') {
//                     setLines(prev => prev.filter(l => l.id !== selectedObject.id));
//                     setSelectedObject(null);
//                     return;
//                 }
//                 if (selectedObject?.type === 'shape') {
//                     setShapes(prev => prev.filter(s => s.id !== selectedObject.id));
//                     setSelectedObject(null);
//                     return;
//                 }
//                 if (selectedObject?.type === 'phone') {
//                     setPhones(prev => prev.filter(p => p.id !== selectedObject.id));
//                     setSelectedObject(null);
//                     return;
//                 }
//             }
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         return () => window.removeEventListener('keydown', handleKeyDown);
//     }, [selectedObject, setPens, setLines, setShapes, setPhones, setSelectedObject]);
//
//     useEffect(() => {
//         const handleKeyDown = (e: KeyboardEvent) => {
//             if (e.key === 'Shift') setIsShiftPressed(true);
//         };
//         const handleKeyUp = (e: KeyboardEvent) => {
//             if (e.key === 'Shift') setIsShiftPressed(false);
//         };
//         window.addEventListener('keydown', handleKeyDown);
//         window.addEventListener('keyup', handleKeyUp);
//         return () => {
//             window.removeEventListener('keydown', handleKeyDown);
//             window.removeEventListener('keyup', handleKeyUp);
//         };
//     }, []);
//
//     // Sync penApi.pens and linesApi.lines with top-level state for sidebar
//     useEffect(() => {
//         if (setPens) setPens(penApi.pens);
//     }, [penApi.pens, setPens]);
//     useEffect(() => {
//         setLines(linesApi.lines);
//     }, [linesApi.lines, setLines]);
//
//     return (
//         <div className="flex-1 flex items-center justify-center relative" style={{ minWidth: 600, minHeight: 400 }}>
//             {/* Top-right zoom panel */}
//             <div className="absolute top-4 right-4 bg-white rounded px-2 py-1 text-xs font-semibold flex items-center gap-1 z-30 shadow">
//                 <span>{Math.round(zoom * 100)}%</span>
//                 <button className="px-1" onClick={handleZoomOut}>-</button>
//                 <button className="px-1" onClick={handleZoomIn}>+</button>
//             </div>
//             {showShapePicker && (
//                 <ShapePickerPanel
//                     onAddPhone={handleAddPhone}
//                     onClose={handleCloseShapePicker}
//                     onShapeSelect={handleShapeSelect}
//                     selectedShape={selectedShape}
//                     selectedColor={selectedColor}
//                     onColorSelect={setSelectedColor}
//                 />
//             )}
//             <Stage
//                 ref={stageRef}
//                 width={stageSize.width}
//                 height={stageSize.height}
//                 scaleX={zoom}
//                 scaleY={zoom}
//                 x={pan.stagePos.x}
//                 y={pan.stagePos.y}
//                 className="bg-[#F8F8F8] rounded-2xl border border-[#E8E8E8] shadow-lg"
//                 style={{ cursor: selectedTool === 'mouse' ? (pan.isPanning ? 'grabbing' : 'default') : 'crosshair', background: '#F8F8F8' }}
//                 onMouseDown={e => {
//                     if (e.target === e.target.getStage()) setSelectedId(null);
//                     handleStageClick();
//                     penApi.handleStageMouseDown(selectedTool)(e);
//                     linesApi.handleStageMouseDown(selectedTool, selectedShapeTool, polygonSides)(e);
//                     handleStageMouseDown(e);
//                 }}
//                 onMouseMove={e => {
//                     penApi.handleStageMouseMove(selectedTool)(e);
//                     linesApi.handleStageMouseMove(selectedTool, selectedShapeTool, polygonSides, isShiftPressed)(e);
//                     handleStageMouseMove(e);
//                 }}
//                 onMouseUp={() => {
//                     penApi.handleStageMouseUp(selectedTool)();
//                     linesApi.handleStageMouseUp(selectedTool)();
//                     handleStageMouseUp();
//                 }}
//                 onWheel={handleWheel}
//             >
//                 <Layer>
//                     {pens && setPens && (
//                         <PenLayer
//                             pens={pens}
//                             drawingPen={penApi.drawingPen}
//                             selectedObject={selectedObject}
//                             setSelectedObject={setSelectedObject}
//                             setPens={setPens}
//                             zoom={zoom}
//                             selectedMouseTool={selectedMouseTool}
//                         />
//                     )}
//                     <LinesLayer
//                         lines={lines}
//                         drawingLine={linesApi.drawingLine}
//                         selectedObject={selectedObject}
//                         setSelectedObject={setSelectedObject}
//                         setLines={setLines}
//                         zoom={zoom}
//                         selectedShapeTool={selectedShapeTool}
//                         polygonSides={polygonSides}
//                         isShiftPressed={isShiftPressed}
//                         selectedMouseTool={selectedMouseTool}
//                     />
//                     <PhonesLayer
//                         phones={phones}
//                         hoveredId={hoveredId}
//                         setHoveredId={setHoveredId}
//                         handlePhoneDragEnd={handlePhoneDragEnd}
//                         handleDivClick={handleDivClick}
//                         handlePhoneHover={handlePhoneHover}
//                         onStartResize={handlePhoneStartResize}
//                         activeResize={activeResize}
//                         selectedObject={selectedObject}
//                         setSelectedObject={setSelectedObject}
//                         selectedMouseTool={selectedMouseTool}
//                     />
//                     <ShapesLayer
//                         shapes={shapes}
//                         hoveredId={hoveredId}
//                         setHoveredId={setHoveredId}
//                         shapeDrag={shapeDrag}
//                         onStartResize={handleShapeStartResize}
//                         activeResize={activeResize}
//                         setShapes={setShapes}
//                         selectedObject={selectedObject}
//                         setSelectedObject={setSelectedObject}
//                         selectedMouseTool={selectedMouseTool}
//                     />
//                     <TextLayer
//                         texts={texts}
//                         setTexts={setTexts}
//                         editingTextId={editingTextId}
//                         setEditingTextId={setEditingTextId}
//                         selectedId={selectedId}
//                         setSelectedId={setSelectedId}
//                     />
//                     {selectionRect && (
//                         <Rect
//                             x={selectionRect.x}
//                             y={selectionRect.y}
//                             width={selectionRect.width}
//                             height={selectionRect.height}
//                             fill="rgba(171,85,220,0.08)"
//                             stroke="#AB55DC"
//                             dash={[4, 4]}
//                             listening={false}
//                         />
//                     )}
//                 </Layer>
//             </Stage>
//             {editingTextId && (() => {
//                 const textObj = texts.find(t => t.id === editingTextId);
//                 if (!textObj) return null;
//                 return (
//                     <input
//                         style={{
//                             position: 'absolute',
//                             left: textObj.x * zoom + pan.stagePos.x,
//                             top: textObj.y * zoom + pan.stagePos.y,
//                             width: textObj.width * zoom,
//                             height: textObj.height * zoom,
//                             fontSize: textObj.fontSize * zoom,
//                             border: '1px solid #AB55DC',
//                             borderRadius: 4,
//                             padding: 2,
//                             background: 'white',
//                             zIndex: 100,
//                         }}
//                         value={textObj.value}
//                         onChange={e => setTexts(prev => prev.map(t => t.id === textObj.id ? { ...t, value: e.target.value } : t))}
//                         onBlur={() => setEditingTextId(null)}
//                         onKeyDown={e => { if (e.key === 'Enter') setEditingTextId(null); }}
//                         autoFocus
//                     />
//                 );
//             })()}
//             <ToolbarPanel
//                 selectedTool={selectedTool}
//                 onToolSelect={handleToolSelect}
//                 selectedShapeTool={selectedShapeTool}
//                 onShapeToolSelect={setSelectedShapeTool as (tool: 'line' | 'rectangle' | 'ellipse' | 'polygon' | 'star' | 'arrow') => void}
//                 polygonSides={polygonSides}
//                 onPolygonSidesChange={s => setPolygonSides(Math.max(3, Math.min(12, s)))}
//                 selectedMouseTool={selectedMouseTool}
//                 setSelectedMouseTool={setSelectedMouseTool}
//             />
//         </div>
//     );
// }
