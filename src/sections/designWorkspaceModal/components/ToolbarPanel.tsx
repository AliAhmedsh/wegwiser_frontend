// import React, { useState, useRef } from 'react';
// import MouseIcon from '@/shared/icons/MouseIcon';
// import HashtagIcon from '@/shared/icons/HashtagIcon';
// import InclinedStick from '@/shared/icons/InclinedStick';
// import TextIcon from '@/shared/icons/TextIcon';
// import ShapesIcon from '@/shared/icons/ShapesIcon';
// import ChainIcon from '@/shared/icons/ChainIcon';
// import CodeIcon from '@/shared/icons/CodeIcon';
// import { SquareIcon, CircleIcon, HexagonIcon, StarIcon, ArrowUpRightIcon, Check, Hand, Expand, ChevronDown } from 'lucide-react';
//
// interface ToolbarPanelProps {
//     selectedTool: string;
//     onToolSelect: (tool: string) => void;
//     selectedShapeTool: 'line' | 'rectangle' | 'ellipse' | 'polygon' | 'star' | 'arrow';
//     onShapeToolSelect: (tool: 'line' | 'rectangle' | 'ellipse' | 'polygon' | 'star' | 'arrow') => void;
//     polygonSides: number;
//     onPolygonSidesChange: (sides: number) => void;
//     selectedMouseTool: 'move' | 'hand' | 'scale';
//     setSelectedMouseTool: React.Dispatch<React.SetStateAction<'move' | 'hand' | 'scale'>>;
// }
//
// const tools = [
//     { name: 'mouse', icon: MouseIcon },
//     { name: 'hashtag', icon: HashtagIcon },
//     { name: 'inclined', icon: InclinedStick },
//     { name: 'text', icon: TextIcon },
//     { name: 'shapes', icon: ShapesIcon },
//     { name: 'chain', icon: ChainIcon },
//     { name: 'code', icon: CodeIcon },
// ];
//
// const shapeOptions: { name: 'line' | 'rectangle' | 'ellipse' | 'polygon' | 'star' | 'arrow'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
//     { name: 'line', label: 'Line', icon: InclinedStick },
//     { name: 'rectangle', label: 'Rectangle', icon: SquareIcon },
//     { name: 'ellipse', label: 'Ellipse', icon: CircleIcon },
//     { name: 'polygon', label: 'Polygon', icon: HexagonIcon },
//     { name: 'star', label: 'Star', icon: StarIcon },
//     { name: 'arrow', label: 'Arrow', icon: ArrowUpRightIcon },
// ];
//
// const mouseOptions: { name: 'move' | 'hand' | 'scale'; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
//     { name: 'move', label: 'Move', icon: MouseIcon },
//     { name: 'hand', label: 'Hand Tool', icon: Hand },
//     { name: 'scale', label: 'Scale', icon: Expand },
// ];
//
// export const ToolbarPanel: React.FC<ToolbarPanelProps> = ({ selectedTool, onToolSelect, selectedShapeTool, onShapeToolSelect, polygonSides, onPolygonSidesChange, selectedMouseTool, setSelectedMouseTool }) => {
//     const [showShapeMenu, setShowShapeMenu] = useState(false);
//     const [showMouseMenu, setShowMouseMenu] = useState(false);
//     const shapeMenuRef = useRef<HTMLDivElement>(null);
//     const mouseMenuRef = useRef<HTMLDivElement>(null);
//
//     React.useEffect(() => {
//         function handleClick(e: MouseEvent) {
//             if (shapeMenuRef.current && !shapeMenuRef.current.contains(e.target as Node)) {
//                 setShowShapeMenu(false);
//             }
//             if (mouseMenuRef.current && !mouseMenuRef.current.contains(e.target as Node)) {
//                 setShowMouseMenu(false);
//             }
//         }
//         if (showShapeMenu || showMouseMenu) {
//             window.addEventListener('mousedown', handleClick);
//         }
//         return () => window.removeEventListener('mousedown', handleClick);
//     }, [showShapeMenu, showMouseMenu]);
//
//     return (
//         <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-[#E8E8E8] flex items-center gap-3 px-6 py-3 z-30">
//             {tools.map(({ name, icon: Icon }) => {
//                 if (name === 'mouse') {
//                     const currentMouseOption = mouseOptions.find(opt => opt.name === selectedMouseTool) || mouseOptions[0];
//                     return (
//                         <div key={name} className="relative flex items-center gap-1">
//                             <button
//                                 className={`flex justify-center items-center p-2 rounded-lg hover:bg-black/50 hover:text-white transition cursor-pointer ${selectedTool === name ? 'bg-black text-white' : ''}`}
//                                 onClick={() => { onToolSelect(name); setShowMouseMenu(v => !v); }}
//                             >
//                                 <currentMouseOption.icon className="w-5 h-5" />
//                                 <ChevronDown size={12} />
//                             </button>
//                             {showMouseMenu && (
//                                 <div ref={mouseMenuRef} className="absolute left-0 bottom-full mb-2 bg-white border rounded shadow z-50 min-w-[180px] py-2 px-2 flex flex-col gap-1">
//                                     {mouseOptions.map(opt => (
//                                         <button
//                                             key={opt.name}
//                                             className={`flex items-center gap-2 px-2 py-1 rounded hover:bg-[#F3F3F3] text-base ${selectedMouseTool === opt.name ? 'font-bold bg-[#F8F8F8]' : ''}`}
//                                             onClick={() => { setSelectedMouseTool(opt.name); setShowMouseMenu(false); }}
//                                         >
//                                             {selectedMouseTool === opt.name && <Check className="w-4 h-4" />}
//                                             <opt.icon className="w-5 h-5" />
//                                             <span>{opt.label}</span>
//                                         </button>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     );
//                 }
//                 if (name === 'inclined') {
//                     const currentShape = shapeOptions.find(opt => opt.name === selectedShapeTool) || shapeOptions[0];
//                     return (
//                         <div key={name} className="relative flex items-center gap-1">
//                             <button
//                                 className={`p-2 rounded-lg hover:bg-black/50 hover:text-white transition cursor-pointer ${selectedTool === name ? 'bg-black text-white' : ''}`}
//                                 onClick={() => { onToolSelect(name); setShowShapeMenu(v => !v); }}
//                             >
//                                 <span className="flex items-center gap-1">
//                                     <currentShape.icon className="w-5 h-5" />
//                                     <span style={{ fontSize: 12, marginLeft: 2 }}>▼</span>
//                                 </span>
//                             </button>
//                             {showShapeMenu && (
//                                 <div ref={shapeMenuRef} className="absolute left-0 bottom-full mb-2 bg-white border rounded shadow z-50 min-w-[120px]">
//                                     {shapeOptions.map(opt => (
//                                         <div key={opt.name} className={`flex items-center gap-2 px-3 py-2 hover:bg-[#F3F3F3] ${selectedShapeTool === opt.name ? 'bg-[#E9ECF1]' : ''}`}>
//                                             <button
//                                                 className={`flex items-center gap-2 w-full text-left`}
//                                                 onClick={() => { onShapeToolSelect(opt.name); setShowShapeMenu(false); }}
//                                             >
//                                                 <opt.icon className="w-4 h-4" />
//                                             </button>
//                                             {opt.name === 'polygon' && (
//                                                 <input
//                                                     type="number"
//                                                     min={3}
//                                                     max={12}
//                                                     value={polygonSides}
//                                                     onChange={e => onPolygonSidesChange(Number(e.target.value))}
//                                                     className="w-10 border rounded px-1 py-0.5 text-center ml-2"
//                                                     style={{ fontSize: 13 }}
//                                                 />
//                                             )}
//                                         </div>
//                                     ))}
//                                 </div>
//                             )}
//                         </div>
//                     );
//                 }
//                 return (
//                     <button
//                         key={name}
//                         className={`p-2 rounded-lg hover:bg-black/50 hover:text-white transition cursor-pointer ${selectedTool === name ? 'bg-black text-white' : ''}`}
//                         onClick={() => onToolSelect(name)}
//                     >
//                         <Icon className="w-5 h-5" />
//                     </button>
//                 );
//             })}
//         </div>
//     );
// };
