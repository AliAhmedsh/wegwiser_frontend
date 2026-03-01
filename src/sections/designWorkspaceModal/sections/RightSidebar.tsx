// import { PlayIcon } from 'lucide-react';
// import React, { useState } from 'react';
// import AIPartnerSidebar from './AIPartnerSidebar';
// import { AIMsg, AIMessages } from '../types';
// import type { CanvasShape, CanvasLine, Phone, CanvasPen } from '../types/canvasTypes';
// import Konva from 'konva';
// import { Stage, Layer, Rect as KRect, Circle as KCircle, Line as KLine, RegularPolygon, Star, Arrow } from 'react-konva';
// import { exportStageSVG } from 'react-konva-to-svg';
// import { useDesignWorkspaceStore } from '@/workspaces/designWorkspace/store/designWorkspace.store';
//
// interface RightSidebarProps {
//     aiMessages?: AIMsg[];
//     onAIPartnerOption?: (option: string) => void;
//     setAIMessages?: React.Dispatch<React.SetStateAction<AIMessages>>;
//     selectedObject: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null;
//     shapes: CanvasShape[];
//     setShapes: React.Dispatch<React.SetStateAction<CanvasShape[]>>;
//     lines: CanvasLine[];
//     setLines: React.Dispatch<React.SetStateAction<CanvasLine[]>>;
//     pens?: CanvasPen[];
//     setPens?: React.Dispatch<React.SetStateAction<CanvasPen[]>>;
//     stageRef: React.RefObject<Konva.Stage>;
// }
//
// export default function RightSidebar({ aiMessages, onAIPartnerOption, setAIMessages, selectedObject, shapes, setShapes, lines, setLines, pens, setPens, stageRef }: RightSidebarProps) {
//     const {showAIPartner,phones,setPhones} = useDesignWorkspaceStore();
//     const [openSections, setOpenSections] = useState<{ [key: string]: boolean }>({
//         Position: true,
//         Layout: false,
//         Appearence: false,
//         Typography: false,
//         'Fill & Stroke': true,
//         Effects: false,
//         Export: false,
//     });
//     const toggleSection = (name: string) => setOpenSections(s => ({ ...s, [name]: !s[name] }));
//     if (showAIPartner) {
//         return <AIPartnerSidebar messages={aiMessages || []} onOptionClick={onAIPartnerOption} setAIMessages={setAIMessages} />;
//     }
//     let objectData: CanvasShape | CanvasLine | Phone | CanvasPen | null = null;
//     let updateObject: ((field: string, value: number | string) => void) | null = null;
//     if (selectedObject?.type === 'shape') {
//         objectData = shapes.find(s => s.id === selectedObject.id) as CanvasShape | null;
//         updateObject = (field, value) => setShapes(shapes.map(s => s.id === selectedObject.id ? { ...s, [field]: value } : s));
//     } else if (selectedObject?.type === 'phone') {
//         objectData = phones.find(p => p.id === selectedObject.id) as Phone | null;
//         updateObject = (field, value) => setPhones(phones.map(p => p.id === selectedObject.id ? { ...p, [field]: value } : p));
//     } else if (selectedObject?.type === 'line') {
//         objectData = lines.find(l => l.id === selectedObject.id) as CanvasLine | null;
//         updateObject = (field, value) => {
//             if (!objectData) return;
//             if (field === 'color') {
//                 setLines(lines.map(l => l.id === selectedObject.id ? { ...l, color: String(value) } : l));
//                 return;
//             }
//             if (field === 'strokeWidth') {
//                 setLines(lines.map(l => l.id === selectedObject.id ? { ...l, strokeWidth: Number(value) } : l));
//                 return;
//             }
//             if (selectedObject?.type === 'line' && (objectData as CanvasLine).points) {
//                 const newPoints = [...(objectData as CanvasLine).points];
//                 if (field === 'x') { newPoints[0] = Number(value); }
//                 if (field === 'y') { newPoints[1] = Number(value); }
//                 if (field === 'x2') { newPoints[2] = Number(value); }
//                 if (field === 'y2') { newPoints[3] = Number(value); }
//                 setLines(lines.map(l => l.id === selectedObject.id ? { ...l, points: newPoints as [number, number, number, number] } : l));
//             }
//         };
//     } else if (selectedObject?.type === 'pen') {
//         objectData = (pens?.find(p => p.id === selectedObject.id) as CanvasPen) || null;
//         updateObject = (field, value) => {
//             if (!objectData) return;
//             if (field === 'color') {
//                 if (setPens) setPens((prev: CanvasPen[]) => prev.map((p: CanvasPen) => p.id === selectedObject.id ? { ...p, color: String(value) } : p));
//                 return;
//             }
//             if (field === 'strokeWidth') {
//                 if (setPens) setPens((prev: CanvasPen[]) => prev.map((p: CanvasPen) => p.id === selectedObject.id ? { ...p, strokeWidth: Number(value) } : p));
//                 return;
//             }
//         };
//     }
//     return (
//         <div className="w-72 h-full flex flex-col bg-[#EAEDF2] p-2">
//             <div className='bg-white h-full rounded-xl text-sm font-semibold text-black'>
//                 <div className="flex items-center gap-2 border-b border-[#E8E8E8] px-4">
//                     <button className="flex-1 font-semibold py-4">Design</button>
//                     <button className="flex-1 py-4">Prototype</button>
//                     <button>
//                         <PlayIcon size={14} color='white' className='bg-black w-6 h-6 rounded-full p-1' />
//                     </button>
//                 </div>
//
//                 <div className="flex-1 h-[90%] overflow-y-scroll">
//                     {/* Position */}
//                     <div className="p-4 border-b border-[#E8E8E8] font-semibold flex items-center justify-between cursor-pointer" onClick={() => toggleSection('Position')}>
//                         <span>Position</span>
//                         <span>{openSections.Position ? '▼' : '►'}</span>
//                     </div>
//                     {openSections.Position && objectData && (
//                         <div className="flex flex-col gap-2 mt-2 font-normal px-4 pb-2">
//                             <label className="flex items-center gap-2 text-xs">X:
//                                 {selectedObject?.type === 'shape' && (
//                                     <input type="number" value={(objectData as CanvasShape).x} onChange={e => updateObject && updateObject('x', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                 )}
//                                 {selectedObject?.type === 'phone' && (
//                                     <input type="number" value={(objectData as Phone).x} onChange={e => updateObject && updateObject('x', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                 )}
//                                 {selectedObject?.type === 'line' && (
//                                     <input type="number" value={(objectData as CanvasLine).points[0]} onChange={e => updateObject && updateObject('x', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                 )}
//                             </label>
//                             <label className="flex items-center gap-2 text-xs">Y:
//                                 {selectedObject?.type === 'shape' && (
//                                     <input type="number" value={(objectData as CanvasShape).y} onChange={e => updateObject && updateObject('y', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                 )}
//                                 {selectedObject?.type === 'phone' && (
//                                     <input type="number" value={(objectData as Phone).y} onChange={e => updateObject && updateObject('y', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                 )}
//                                 {selectedObject?.type === 'line' && (
//                                     <input type="number" value={(objectData as CanvasLine).points[1]} onChange={e => updateObject && updateObject('y', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                 )}
//                             </label>
//                             {selectedObject?.type === 'line' && (objectData as CanvasLine).points && (
//                                 <>
//                                     <label className="flex items-center gap-2 text-xs">X2:
//                                         <input type="number" value={(objectData as CanvasLine).points[2]} onChange={e => updateObject && updateObject('x2', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                     </label>
//                                     <label className="flex items-center gap-2 text-xs">Y2:
//                                         <input type="number" value={(objectData as CanvasLine).points[3]} onChange={e => updateObject && updateObject('y2', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                     </label>
//                                 </>
//                             )}
//                             {selectedObject?.type === 'shape' && (
//                                 <label className="flex items-center gap-2 text-xs">Size:
//                                     <input type="number" value={(objectData as CanvasShape).size} onChange={e => updateObject && updateObject('size', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                 </label>
//                             )}
//                             {selectedObject?.type === 'phone' && (
//                                 <>
//                                     <label className="flex items-center gap-2 text-xs">Width:
//                                         <input type="number" value={(objectData as Phone).width} onChange={e => updateObject && updateObject('width', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                     </label>
//                                     <label className="flex items-center gap-2 text-xs">Height:
//                                         <input type="number" value={(objectData as Phone).height} onChange={e => updateObject && updateObject('height', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                     </label>
//                                 </>
//                             )}
//                         </div>
//                     )}
//                     {/* Layout */}
//                     <div className="p-4 border-b border-[#E8E8E8] font-semibold flex items-center justify-between cursor-pointer" onClick={() => toggleSection('Layout')}>
//                         <span>Layout</span>
//                         <span>{openSections.Layout ? '▼' : '►'}</span>
//                     </div>
//                     {openSections.Layout && objectData && (
//                         <div className="mt-2 text-xs font-normal px-4 pb-2">
//                             <div>ID: {objectData.id}</div>
//                             <div>Type: {selectedObject?.type}</div>
//                         </div>
//                     )}
//                     {/* Appearence */}
//                     <div className="p-4 border-b border-[#E8E8E8] font-semibold flex items-center justify-between cursor-pointer" onClick={() => toggleSection('Appearence')}>
//                         <span>Appearence</span>
//                         <span>{openSections.Appearence ? '▼' : '►'}</span>
//                     </div>
//                     {openSections.Appearence && objectData && (
//                         <div className="mt-2 text-xs font-normal px-4 pb-2">
//                             {selectedObject?.type === 'shape' && (objectData as CanvasShape).color !== undefined && updateObject && (
//                                 <label className="flex items-center gap-2">Fill:
//                                     <input type="color" value={(objectData as CanvasShape).color} onChange={e => updateObject('color', e.target.value)} className="w-8 h-6 p-0 border-none bg-transparent" />
//                                 </label>
//                             )}
//                         </div>
//                     )}
//                     {/* Typography */}
//                     <div className="p-4 border-b border-[#E8E8E8] font-semibold flex items-center justify-between cursor-pointer" onClick={() => toggleSection('Typography')}>
//                         <span>Typography</span>
//                         <span>{openSections.Typography ? '▼' : '►'}</span>
//                     </div>
//                     {openSections.Typography && objectData && (
//                         <div className="mt-2 text-xs font-normal px-4 pb-2">(Typography info here)</div>
//                     )}
//                     {/* Fill & Stroke */}
//                     <div className="p-4 border-b border-[#E8E8E8] font-semibold flex items-center justify-between cursor-pointer" onClick={() => toggleSection('Fill & Stroke')}>
//                         <span>Fill & Stroke</span>
//                         <span>{openSections['Fill & Stroke'] ? '▼' : '►'}</span>
//                     </div>
//                     {openSections['Fill & Stroke'] && objectData && (
//                         <div className="mt-2 text-xs font-normal flex flex-col gap-2 px-4 pb-2">
//                             {/* Для shape — тільки Fill */}
//                             {selectedObject?.type === 'shape' && (objectData as CanvasShape).color !== undefined && updateObject && (
//                                 <label className="flex items-center gap-2">Fill:
//                                     <input type="color" value={(objectData as CanvasShape).color} onChange={e => updateObject('color', e.target.value)} className="w-8 h-6 p-0 border-none bg-transparent" />
//                                 </label>
//                             )}
//                             {/* Для line/pen — Stroke */}
//                             {selectedObject?.type === 'line' && (objectData as CanvasLine).color !== undefined && updateObject && (
//                                 <label className="flex items-center gap-2">Stroke Color:
//                                     <input type="color" value={(objectData as CanvasLine).color} onChange={e => updateObject('color', e.target.value)} className="w-8 h-6 p-0 border-none bg-transparent" />
//                                 </label>
//                             )}
//                             {selectedObject?.type === 'pen' && (objectData as CanvasPen).color !== undefined && updateObject && (
//                                 <label className="flex items-center gap-2">Stroke Color:
//                                     <input type="color" value={(objectData as CanvasPen).color} onChange={e => updateObject('color', e.target.value)} className="w-8 h-6 p-0 border-none bg-transparent" />
//                                 </label>
//                             )}
//                             {selectedObject?.type === 'line' && (objectData as CanvasLine).strokeWidth !== undefined && updateObject && (
//                                 <label className="flex items-center gap-2">Stroke Width:
//                                     <input type="number" value={(objectData as CanvasLine).strokeWidth} min={1} max={20} onChange={e => updateObject('strokeWidth', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                 </label>
//                             )}
//                             {selectedObject?.type === 'pen' && (objectData as CanvasPen).strokeWidth !== undefined && updateObject && (
//                                 <label className="flex items-center gap-2">Stroke Width:
//                                     <input type="number" value={(objectData as CanvasPen).strokeWidth} min={1} max={20} onChange={e => updateObject('strokeWidth', Number(e.target.value))} className="border rounded px-1 py-0.5 w-16" />
//                                 </label>
//                             )}
//                         </div>
//                     )}
//                     {/* Effects */}
//                     <div className="p-4 border-b border-[#E8E8E8] font-semibold flex items-center justify-between cursor-pointer" onClick={() => toggleSection('Effects')}>
//                         <span>Effects</span>
//                         <span>{openSections.Effects ? '▼' : '►'}</span>
//                     </div>
//                     {openSections.Effects && objectData && (
//                         <div className="mt-2 text-xs font-normal px-4 pb-2">(Effects info here)</div>
//                     )}
//                     {/* Export */}
//                     <div className="p-4 border-b border-[#E8E8E8] font-semibold flex items-center justify-between cursor-pointer" onClick={() => toggleSection('Export')}>
//                         <span>Export</span>
//                         <span>{openSections.Export ? '▼' : '►'}</span>
//                     </div>
//                     {openSections.Export && objectData && (
//                         <div className="flex flex-col gap-2 mt-2 px-4 pb-2">
//                             <button
//                                 className="bg-black text-white rounded px-3 py-1 text-xs font-semibold hover:bg-[#222]"
//                                 onClick={() => handleExport('png')}
//                             >
//                                 Export as PNG
//                             </button>
//                             <button
//                                 className="bg-black text-white rounded px-3 py-1 text-xs font-semibold hover:bg-[#222]"
//                                 onClick={() => handleExport('jpg')}
//                             >
//                                 Export as JPG
//                             </button>
//                             <button
//                                 className="bg-black text-white rounded px-3 py-1 text-xs font-semibold hover:bg-[#222]"
//                                 onClick={handleExportSVG}
//                             >
//                                 Export as SVG
//                             </button>
//                             <PreviewExportObject
//                                 selectedObject={selectedObject}
//                                 shapes={shapes}
//                                 lines={lines}
//                                 phones={phones}
//                                 pens={pens}
//                             />
//                         </div>
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
//
//     function handleExport(format: 'png' | 'jpg') {
//         if (!stageRef?.current || !selectedObject) return;
//         // Знаходимо потрібний Konva.Node по id
//         const node = stageRef.current.findOne(`#${selectedObject.id}`);
//         if (!node) {
//             alert('Cannot find object on canvas');
//             return;
//         }
//         // Визначаємо формат
//         const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
//         const quality = format === 'jpg' ? 0.95 : undefined;
//         // Робимо dataURL тільки для цього об'єкта
//         const dataURL = node.toDataURL({ pixelRatio: 2, mimeType, quality });
//         // Створюємо посилання для завантаження
//         const link = document.createElement('a');
//         link.download = `${selectedObject.id}.${format}`;
//         link.href = dataURL;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//     }
//
//     async function handleExportSVG() {
//         if (!selectedObject) return;
//         // Створюємо тимчасовий Stage/Layers з PreviewExportObject
//         const container = document.createElement('div');
//         container.style.position = 'fixed';
//         container.style.left = '-9999px';
//         document.body.appendChild(container);
//         const width = 200, height = 200;
//         const stage = new Konva.Stage({ container, width, height });
//         const layer = new Konva.Layer();
//         stage.add(layer);
//         // Відрендерити потрібний об'єкт (shape, line, pen, phone)
//         let obj: CanvasShape | CanvasLine | Phone | CanvasPen | undefined = undefined;
//         if (selectedObject.type === 'shape') obj = shapes.find((s: CanvasShape) => s.id === selectedObject.id);
//         if (selectedObject.type === 'line') obj = lines.find((l: CanvasLine) => l.id === selectedObject.id);
//         if (selectedObject.type === 'phone') obj = phones.find((p: Phone) => p.id === selectedObject.id);
//         if (selectedObject.type === 'pen') obj = pens?.find((p: CanvasPen) => p.id === selectedObject.id);
//         if (!obj) { document.body.removeChild(container); return; }
//         // Type guards
//         function isShape(o: any): o is CanvasShape { return o && typeof o.x === 'number' && typeof o.size === 'number' && typeof o.color === 'string'; }
//         function isLine(o: any): o is CanvasLine { return o && Array.isArray(o.points); }
//         function isPhone(o: any): o is Phone { return o && typeof o.x === 'number' && typeof o.width === 'number'; }
//         function isPen(o: any): o is CanvasPen { return o && Array.isArray(o.points) && typeof o.strokeWidth === 'number'; }
//         // Вираховуємо bounds
//         let minX = 0, minY = 0, maxX = 100, maxY = 100;
//         if (isShape(obj)) {
//             minX = obj.x; minY = obj.y; maxX = obj.x + obj.size; maxY = obj.y + obj.size;
//         } else if (isLine(obj)) {
//             minX = Math.min(obj.points[0], obj.points[2]);
//             minY = Math.min(obj.points[1], obj.points[3]);
//             maxX = Math.max(obj.points[0], obj.points[2]);
//             maxY = Math.max(obj.points[1], obj.points[3]);
//         } else if (isPhone(obj)) {
//             minX = obj.x; minY = obj.y; maxX = obj.x + obj.width; maxY = obj.y + obj.height;
//         } else if (isPen(obj)) {
//             const xs = obj.points.filter((_: number, i: number) => i % 2 === 0);
//             const ys = obj.points.filter((_: number, i: number) => i % 2 === 1);
//             minX = Math.min(...xs); maxX = Math.max(...xs); minY = Math.min(...ys); maxY = Math.max(...ys);
//         }
//         const padding = 16;
//         const w = Math.max(40, maxX - minX + padding * 2);
//         const h = Math.max(40, maxY - minY + padding * 2);
//         stage.width(w); stage.height(h);
//         // Додаємо Konva-об'єкт у layer (аналогічно PreviewExportObject)
//         let node: Konva.Node | null = null;
//         if (isShape(obj)) {
//             if (obj.type === 'square') node = new Konva.Rect({ x: obj.x - minX + padding, y: obj.y - minY + padding, width: obj.size, height: obj.size, fill: obj.color, cornerRadius: 8 });
//             if (obj.type === 'circle') node = new Konva.Circle({ x: obj.x + obj.size / 2 - minX + padding, y: obj.y + obj.size / 2 - minY + padding, radius: obj.size / 2, fill: obj.color });
//             if (obj.type === 'triangle') node = new Konva.RegularPolygon({ x: obj.x + obj.size / 2 - minX + padding, y: obj.y + obj.size / 2 - minY + padding, sides: 3, radius: obj.size / 2, fill: obj.color, rotation: -90 });
//             if (obj.type === 'diamond') node = new Konva.RegularPolygon({ x: obj.x + obj.size / 2 - minX + padding, y: obj.y + obj.size / 2 - minY + padding, sides: 4, radius: obj.size / 2, fill: obj.color, rotation: 45 });
//         } else if (isLine(obj)) {
//             if (obj.shapeType === 'rectangle') {
//                 const [x1, y1, x2, y2] = obj.points;
//                 node = new Konva.Rect({ x: x1 - minX + padding, y: y1 - minY + padding, width: x2 - x1, height: y2 - y1, stroke: obj.color, strokeWidth: obj.strokeWidth });
//             } else if (obj.shapeType === 'ellipse') {
//                 const [x1, y1, x2, y2] = obj.points;
//                 const rx = Math.abs(x2 - x1) / 2;
//                 const ry = Math.abs(y2 - y1) / 2;
//                 node = new Konva.Ellipse({ x: x1 + rx - minX + padding, y: y1 + ry - minY + padding, radiusX: rx, radiusY: ry, stroke: obj.color, strokeWidth: obj.strokeWidth });
//             } else if (obj.shapeType === 'polygon') {
//                 const [x1, y1, x2, y2] = obj.points;
//                 const sides = obj.polygonSides || 5;
//                 const cx = (x1 + x2) / 2 - minX + padding;
//                 const cy = (y1 + y2) / 2 - minY + padding;
//                 const rx = Math.abs(x2 - x1) / 2;
//                 const ry = Math.abs(y2 - y1) / 2;
//                 const points: number[] = [];
//                 for (let i = 0; i < sides; i++) {
//                     const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
//                     points.push(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
//                 }
//                 node = new Konva.Line({ points: [...points, points[0], points[1]], stroke: obj.color, strokeWidth: obj.strokeWidth, closed: true });
//             } else if (obj.shapeType === 'star') {
//                 const [x1, y1, x2, y2] = obj.points;
//                 const cx = (x1 + x2) / 2 - minX + padding;
//                 const cy = (y1 + y2) / 2 - minY + padding;
//                 const rx = Math.abs(x2 - x1) / 2;
//                 const ry = Math.abs(y2 - y1) / 2;
//                 node = new Konva.Star({ x: cx, y: cy, numPoints: 5, innerRadius: Math.min(rx, ry) / 2, outerRadius: Math.max(rx, ry), stroke: obj.color, strokeWidth: obj.strokeWidth });
//             } else if (obj.shapeType === 'arrow') {
//                 const [x1, y1, x2, y2] = obj.points;
//                 node = new Konva.Arrow({ points: [x1 - minX + padding, y1 - minY + padding, x2 - minX + padding, y2 - minY + padding], stroke: obj.color, strokeWidth: obj.strokeWidth, pointerLength: 18, pointerWidth: 18 });
//             } else {
//                 const [x1, y1, x2, y2] = obj.points;
//                 node = new Konva.Line({ points: [x1 - minX + padding, y1 - minY + padding, x2 - minX + padding, y2 - minY + padding], stroke: obj.color, strokeWidth: obj.strokeWidth, lineCap: 'round', lineJoin: 'round' });
//             }
//         } else if (isPhone(obj)) {
//             node = new Konva.Rect({ x: obj.x - minX + padding, y: obj.y - minY + padding, width: obj.width, height: obj.height, fill: '#0A0D14', cornerRadius: 12 });
//         } else if (isPen(obj)) {
//             node = new Konva.Line({ points: obj.points.map((v: number, i: number) => v - (i % 2 === 0 ? minX - padding : minY - padding)), stroke: obj.color, strokeWidth: obj.strokeWidth, lineCap: 'round', lineJoin: 'round' });
//         }
//         if (node) layer.add(node as Konva.Shape | Konva.Group);
//         await new Promise(resolve => setTimeout(resolve, 10)); // Дати Konva промалювати DOM
//         const svgText = await exportStageSVG(stage, false);
//         // Завантажити SVG
//         const blob = new Blob([svgText], { type: 'image/svg+xml' });
//         const url = URL.createObjectURL(blob);
//         const link = document.createElement('a');
//         link.href = url;
//         link.download = `${selectedObject.id}.svg`;
//         document.body.appendChild(link);
//         link.click();
//         document.body.removeChild(link);
//         URL.revokeObjectURL(url);
//         document.body.removeChild(container);
//     }
// }
//
// function PreviewExportObject({ selectedObject, shapes, lines, phones, pens }: {
//     selectedObject: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null;
//     shapes: CanvasShape[];
//     lines: CanvasLine[];
//     phones: Phone[];
//     pens?: CanvasPen[];
// }) {
//     if (!selectedObject) return null;
//     let obj: CanvasShape | CanvasLine | Phone | CanvasPen | undefined = undefined;
//     if (selectedObject.type === 'shape') obj = shapes.find((s: CanvasShape) => s.id === selectedObject.id);
//     if (selectedObject.type === 'line') obj = lines.find((l: CanvasLine) => l.id === selectedObject.id);
//     if (selectedObject.type === 'phone') obj = phones.find((p: Phone) => p.id === selectedObject.id);
//     if (selectedObject.type === 'pen') obj = pens?.find((p: CanvasPen) => p.id === selectedObject.id);
//     if (!obj) return null;
//
//     // Type guards
//     function isShape(o: any): o is CanvasShape {
//         return o && typeof o.x === 'number' && typeof o.size === 'number' && typeof o.color === 'string';
//     }
//     function isLine(o: any): o is CanvasLine {
//         return o && Array.isArray(o.points);
//     }
//     function isPhone(o: any): o is Phone {
//         return o && typeof o.x === 'number' && typeof o.width === 'number';
//     }
//     function isPen(o: any): o is CanvasPen {
//         return o && Array.isArray(o.points) && typeof o.strokeWidth === 'number';
//     }
//
//     let minX = 0, minY = 0, maxX = 100, maxY = 100;
//     if (isShape(obj)) {
//         minX = obj.x;
//         minY = obj.y;
//         maxX = obj.x + obj.size;
//         maxY = obj.y + obj.size;
//     } else if (isLine(obj)) {
//         minX = Math.min(obj.points[0], obj.points[2]);
//         minY = Math.min(obj.points[1], obj.points[3]);
//         maxX = Math.max(obj.points[0], obj.points[2]);
//         maxY = Math.max(obj.points[1], obj.points[3]);
//         if (obj.shapeType === 'ellipse' || obj.shapeType === 'rectangle' || obj.shapeType === 'polygon' || obj.shapeType === 'star') {
//             minX = Math.min(obj.points[0], obj.points[2]);
//             minY = Math.min(obj.points[1], obj.points[3]);
//             maxX = Math.max(obj.points[0], obj.points[2]);
//             maxY = Math.max(obj.points[1], obj.points[3]);
//         }
//     } else if (isPhone(obj)) {
//         minX = obj.x;
//         minY = obj.y;
//         maxX = obj.x + obj.width;
//         maxY = obj.y + obj.height;
//     } else if (isPen(obj)) {
//         const xs = obj.points.filter((_: number, i: number) => i % 2 === 0);
//         const ys = obj.points.filter((_: number, i: number) => i % 2 === 1);
//         minX = Math.min(...xs);
//         maxX = Math.max(...xs);
//         minY = Math.min(...ys);
//         maxY = Math.max(...ys);
//     }
//     const padding = 16;
//     const width = Math.max(40, maxX - minX + padding * 2);
//     const height = Math.max(40, maxY - minY + padding * 2);
//     const offsetX = minX - padding;
//     const offsetY = minY - padding;
//
//     return (
//         <div style={{ background: 'white', borderRadius: 8, boxShadow: '0 1px 4px #0001', marginTop: 8, alignSelf: 'center', width: width, height: height }}>
//             <Stage width={width} height={height} style={{ background: 'transparent' }}>
//                 <Layer>
//                     {isShape(obj) && renderShapePreview(obj, -offsetX, -offsetY)}
//                     {isLine(obj) && renderLinePreview(obj, -offsetX, -offsetY)}
//                     {isPhone(obj) && renderPhonePreview(obj, -offsetX, -offsetY)}
//                     {isPen(obj) && renderPenPreview(obj, -offsetX, -offsetY)}
//                 </Layer>
//             </Stage>
//         </div>
//     );
// }
//
// function renderShapePreview(shape: CanvasShape, dx: number, dy: number) {
//     if (shape.type === 'square') return <KRect x={shape.x + dx} y={shape.y + dy} width={shape.size} height={shape.size} fill={shape.color} cornerRadius={8} />;
//     if (shape.type === 'circle') return <KCircle x={shape.x + shape.size / 2 + dx} y={shape.y + shape.size / 2 + dy} radius={shape.size / 2} fill={shape.color} />;
//     if (shape.type === 'triangle') return <RegularPolygon x={shape.x + shape.size / 2 + dx} y={shape.y + shape.size / 2 + dy} sides={3} radius={shape.size / 2} fill={shape.color} rotation={-90} />;
//     if (shape.type === 'diamond') return <RegularPolygon x={shape.x + shape.size / 2 + dx} y={shape.y + shape.size / 2 + dy} sides={4} radius={shape.size / 2} fill={shape.color} rotation={45} />;
//     return null;
// }
// function renderLinePreview(line: CanvasLine, dx: number, dy: number) {
//     if (line.shapeType === 'rectangle') {
//         const [x1, y1, x2, y2] = line.points;
//         return <KRect x={x1 + dx} y={y1 + dy} width={x2 - x1} height={y2 - y1} stroke={line.color} strokeWidth={line.strokeWidth} />;
//     }
//     if (line.shapeType === 'ellipse') {
//         const [x1, y1, x2, y2] = line.points;
//         const rx = Math.abs(x2 - x1) / 2;
//         const ry = Math.abs(y2 - y1) / 2;
//         return <KCircle x={x1 + rx + dx} y={y1 + ry + dy} radius={Math.max(rx, ry)} stroke={line.color} strokeWidth={line.strokeWidth} />;
//     }
//     if (line.shapeType === 'polygon') {
//         const [x1, y1, x2, y2] = line.points;
//         const sides = line.polygonSides || 5;
//         const cx = (x1 + x2) / 2 + dx;
//         const cy = (y1 + y2) / 2 + dy;
//         const rx = Math.abs(x2 - x1) / 2;
//         const ry = Math.abs(y2 - y1) / 2;
//         return <LinePolygonPreview cx={cx} cy={cy} rx={rx} ry={ry} sides={sides} color={line.color} strokeWidth={line.strokeWidth} />;
//     }
//     if (line.shapeType === 'star') {
//         const [x1, y1, x2, y2] = line.points;
//         const cx = (x1 + x2) / 2 + dx;
//         const cy = (y1 + y2) / 2 + dy;
//         const rx = Math.abs(x2 - x1) / 2;
//         const ry = Math.abs(y2 - y1) / 2;
//         return <Star x={cx} y={cy} numPoints={5} innerRadius={Math.min(rx, ry) / 2} outerRadius={Math.max(rx, ry)} stroke={line.color} strokeWidth={line.strokeWidth} />;
//     }
//     if (line.shapeType === 'arrow') {
//         const [x1, y1, x2, y2] = line.points;
//         return <Arrow points={[x1 + dx, y1 + dy, x2 + dx, y2 + dy]} stroke={line.color} strokeWidth={line.strokeWidth} pointerLength={18} pointerWidth={18} />;
//     }
//     // Default: simple line
//     const [x1, y1, x2, y2] = line.points;
//     return <KLine points={[x1 + dx, y1 + dy, x2 + dx, y2 + dy]} stroke={line.color} strokeWidth={line.strokeWidth} lineCap="round" lineJoin="round" />;
// }
// function LinePolygonPreview({ cx, cy, rx, ry, sides, color, strokeWidth }: { cx: number; cy: number; rx: number; ry: number; sides: number; color: string; strokeWidth: number }) {
//     const points = [];
//     for (let i = 0; i < sides; i++) {
//         const angle = (2 * Math.PI * i) / sides - Math.PI / 2;
//         points.push(cx + rx * Math.cos(angle), cy + ry * Math.sin(angle));
//     }
//     return <KLine points={[...points, points[0], points[1]]} stroke={color} strokeWidth={strokeWidth} closed />;
// }
// function renderPhonePreview(phone: Phone, dx: number, dy: number) {
//     return <KRect x={phone.x + dx} y={phone.y + dy} width={phone.width} height={phone.height} fill="#0A0D14" cornerRadius={12} />;
// }
// function renderPenPreview(pen: CanvasPen, dx: number, dy: number) {
//     return <KLine points={pen.points.map((v, i) => v + (i % 2 === 0 ? dx : dy))} stroke={pen.color} strokeWidth={pen.strokeWidth} lineCap="round" lineJoin="round" />;
// }
