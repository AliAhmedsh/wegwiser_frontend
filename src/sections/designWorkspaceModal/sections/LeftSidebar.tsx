// import ArrowDownIcon from '@/shared/icons/ArrowDownIcon';
// import LeftSideBarIcon from '@/shared/icons/LeftSideBarIcon';
// import ListBuletsIcon from '@/shared/icons/ListBulletsIcon';
// import SearchIcon from '@/shared/icons/SearchIcon';
// import React from 'react';
// import type { CanvasShape, CanvasLine, Phone, CanvasPen, SelectionObject } from '../types/canvasTypes';
// import {
//     DndContext,
//     closestCenter,
//     PointerSensor,
//     useSensor,
//     useSensors,
// } from '@dnd-kit/core';
// import {
//     arrayMove,
//     SortableContext,
//     useSortable,
//     verticalListSortingStrategy,
// } from '@dnd-kit/sortable';
// import { CSS } from '@dnd-kit/utilities';
// import type { DragEndEvent } from '@dnd-kit/core';
//
// interface LeftSidebarProps {
//     shapes: CanvasShape[];
//     lines: CanvasLine[];
//     phones: Phone[];
//     pens?: CanvasPen[];
//     selectedObject: SelectionObject;
//     setSelectedObject: (obj: SelectionObject) => void;
//     setShapes: React.Dispatch<React.SetStateAction<CanvasShape[]>>;
//     setLines: React.Dispatch<React.SetStateAction<CanvasLine[]>>;
//     setPhones: React.Dispatch<React.SetStateAction<Phone[]>>;
//     setPens?: React.Dispatch<React.SetStateAction<CanvasPen[]>>;
// }
//
// type LayerObject = {
//     objectType: 'shape' | 'line' | 'pen' | 'phone';
//     id: string;
//     icon: React.ReactNode;
//     name: string;
// } & (CanvasShape | CanvasLine | CanvasPen | Phone);
//
// export default function LeftSidebar({ shapes, lines, phones, pens = [], selectedObject, setSelectedObject, setShapes, setLines, setPhones, setPens }: LeftSidebarProps) {
//     // Helper to get display name
//     const getName = (obj: LayerObject) => {
//         if (obj.objectType === 'shape' && 'type' in obj) return `${obj.type} (${obj.id.slice(-4)})`;
//         if (obj.objectType === 'line') return `Line (${obj.id.slice(-4)})`;
//         if (obj.objectType === 'pen') return `Pen (${obj.id.slice(-4)})`;
//         if (obj.objectType === 'phone') return `Phone (${obj.id.slice(-4)})`;
//         return obj.id;
//     };
//     // Helper to get icon
//     const getIcon = (obj: LayerObject) => {
//         if (obj.objectType === 'shape') return <ListBuletsIcon size={12} />;
//         if (obj.objectType === 'line') return <span className="inline-block w-2 h-2 bg-[#AB55DC] rounded-full" />;
//         if (obj.objectType === 'pen') return <span className="inline-block w-2 h-2 bg-[#0099FF] rounded-full" />;
//         if (obj.objectType === 'phone') return <span className="inline-block w-2 h-2 bg-[#FFB800] rounded-full" />;
//         return <ListBuletsIcon size={12} />;
//     };
//     // Compose all objects into a flat list with icon/name
//     // (allObjects більше не використовується, видаляю)
//
//     // dnd-kit sensors
//     const sensors = useSensors(useSensor(PointerSensor));
//     // локальний порядок для drag-and-drop
//     const [objects, setObjects] = React.useState<LayerObject[]>([]);
//     React.useEffect(() => {
//         const newObjects: LayerObject[] = [
//             ...shapes.map(s => ({ ...s, objectType: 'shape' as const, icon: getIcon({ ...s, objectType: 'shape' as const, icon: <></>, name: '' }), name: getName({ ...s, objectType: 'shape' as const, icon: <></>, name: '' }) })),
//             ...lines.map(l => ({ ...l, objectType: 'line' as const, icon: getIcon({ ...l, objectType: 'line' as const, icon: <></>, name: '' }), name: getName({ ...l, objectType: 'line' as const, icon: <></>, name: '' }) })),
//             ...pens.map(p => ({ ...p, objectType: 'pen' as const, icon: getIcon({ ...p, objectType: 'pen' as const, icon: <></>, name: '' }), name: getName({ ...p, objectType: 'pen' as const, icon: <></>, name: '' }) })),
//             ...phones.map(ph => ({ ...ph, objectType: 'phone' as const, icon: getIcon({ ...ph, objectType: 'phone' as const, icon: <></>, name: '' }), name: getName({ ...ph, objectType: 'phone' as const, icon: <></>, name: '' }) })),
//         ];
//         setObjects(newObjects);
//     }, [shapes, lines, pens, phones]);
//
//     const handleDragEnd = (event: DragEndEvent) => {
//         const { active, over } = event;
//         if (!over) return;
//         const activeId = String(active.id);
//         const overId = String(over.id);
//         if (activeId !== overId) {
//             const oldIndex = objects.findIndex(obj => obj.id === activeId);
//             const newIndex = objects.findIndex(obj => obj.id === overId);
//             const newObjects = arrayMove(objects, oldIndex, newIndex);
//             setObjects(newObjects);
//             // Оновлюємо глобальні масиви
//             const newShapes: CanvasShape[] = [];
//             const newPhones: Phone[] = [];
//             const newLines: CanvasLine[] = [];
//             const newPens: CanvasPen[] = [];
//             newObjects.forEach(obj => {
//                 if (obj.objectType === 'shape') {
//                     newShapes.push(obj as CanvasShape);
//                 } else if (obj.objectType === 'phone') {
//                     newPhones.push(obj as Phone);
//                 } else if (obj.objectType === 'line') {
//                     newLines.push(obj as CanvasLine);
//                 } else if (obj.objectType === 'pen') {
//                     newPens.push(obj as CanvasPen);
//                 }
//             });
//             setShapes(newShapes);
//             setPhones(newPhones);
//             setLines(newLines);
//             if (setPens) setPens(newPens);
//         }
//     };
//
//     function SortableLayerItem({ obj, isSelected, onClick }: { obj: LayerObject, isSelected: boolean, onClick: () => void }) {
//         const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: obj.id });
//         const style: React.CSSProperties = {
//             transform: CSS.Transform.toString(transform),
//             transition,
//             background: isSelected ? '#f3f4f6' : '#fff',
//             opacity: isDragging ? 0.5 : 1,
//             cursor: 'pointer',
//             borderRadius: 6,
//             fontWeight: isSelected ? 700 : 400,
//             padding: '4px 8px',
//             display: 'flex',
//             alignItems: 'center',
//             gap: 8,
//             userSelect: 'none',
//         };
//         return (
//             <li
//                 ref={setNodeRef}
//                 style={style}
//                 {...attributes}
//                 onClick={onClick}
//             >
//                 <span
//                     {...listeners}
//                     style={{
//                         marginRight: 8,
//                         cursor: 'grab',
//                         display: 'inline-flex',
//                         alignItems: 'center',
//                         padding: 2,
//                     }}
//                     onClick={e => e.stopPropagation()}
//                 >
//                     <svg width={14} height={14} viewBox="0 0 14 14"><circle cx={3} cy={3} r={1.5} /><circle cx={3} cy={7} r={1.5} /><circle cx={3} cy={11} r={1.5} /><circle cx={11} cy={3} r={1.5} /><circle cx={11} cy={7} r={1.5} /><circle cx={11} cy={11} r={1.5} /></svg>
//                 </span>
//                 {obj.icon} {obj.name}
//             </li>
//         );
//     }
//
//     return (
//         <div className="w-64 h-full bg-[#EAEDF2] flex flex-col border-r border-[#E8E8E8] p-2">
//             <div className='bg-white h-full rounded-xl'>
//                 <div className="p-4 border-b border-[#E8E8E8]">
//                     <div className="font-semibold text-sm flex items-center gap-2">
//                         <button className="inline-block w-5 h-5 rounded mr-2">
//                             <LeftSideBarIcon size={20} />
//                         </button>
//                         <p>Search UI – Draft</p>
//                         <span className="ml-auto text-xs text-gray-400">
//                             <ArrowDownIcon />
//                         </span>
//                     </div>
//                 </div>
//                 <div className="flex gap-2 px-4 pt-4 pb-2 text-black border-b border-[#E8E8E8] font-semibold text-sm">
//                     <button className=" pb-1 px-2">Pages</button>
//                     <button className=" pb-1 px-2">Assets</button>
//                     <button className="ml-auto">
//                         <SearchIcon />
//                     </button>
//                 </div>
//                 <div className="px-4 py-2 text-sm font-normal text-[#181818] border-b border-[#E8E8E8]">Pages 1</div>
//                 <div className="px-4 py-2 text-sm font-semibold text-[#181818]">Layers</div>
//                 <div className="px-4 pb-2 text-sm font-normal h-[65%] overflow-y-scroll">
//                     <p className="flex items-center gap-2 pl-2 text-[#181818]">User Flow1
//                         <span className="text-[#627899]">
//                             <ArrowDownIcon width={12} />
//                         </span>
//                     </p>
//                     <DndContext
//                         sensors={sensors}
//                         collisionDetection={closestCenter}
//                         onDragEnd={handleDragEnd}
//                     >
//                         <SortableContext
//                             items={objects.map(obj => obj.id)}
//                             strategy={verticalListSortingStrategy}
//                         >
//                             <ul className="pl-3 text-[#181818] flex flex-col gap-1">
//                                 {objects.map(obj => (
//                                     <SortableLayerItem
//                                         key={obj.id}
//                                         obj={obj}
//                                         isSelected={selectedObject?.id === obj.id && selectedObject?.type === obj.objectType}
//                                         onClick={() => setSelectedObject({ type: obj.objectType, id: obj.id })}
//                                     />
//                                 ))}
//                             </ul>
//                         </SortableContext>
//                     </DndContext>
//                 </div>
//             </div>
//         </div>
//     );
// }
