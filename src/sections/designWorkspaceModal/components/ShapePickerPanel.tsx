// import React from 'react';
//
// interface ShapePickerPanelProps {
//     onAddPhone: () => void;
//     onClose: () => void;
//     onShapeSelect: (shape: string) => void;
//     selectedShape?: string;
//     selectedColor: string;
//     onColorSelect: (color: string) => void;
// }
//
// const COLORS = ['#AB55DC', '#FFB800', '#00C48C', '#FF5A5F', '#0099FF', '#222', '#fff'];
//
// export const ShapePickerPanel: React.FC<ShapePickerPanelProps> = ({ onAddPhone, onClose, onShapeSelect, selectedShape, selectedColor, onColorSelect }) => (
//     <div className="absolute top-8 left-1/2 -translate-x-1/2 bg-white rounded-2xl shadow-xl border border-[#E8E8E8] flex flex-col items-center gap-2 px-6 py-3 z-40">
//         {/* Color palette */}
//         <div className="flex gap-2 mb-2">
//             {COLORS.map((color) => (
//                 <button
//                     key={color}
//                     className={`w-6 h-6 rounded-full border-2 ${selectedColor === color ? 'border-[#AB55DC]' : 'border-white'} shadow`}
//                     style={{ background: color }}
//                     onClick={() => onColorSelect(color)}
//                 />
//             ))}
//         </div>
//         <div className="flex gap-3">
//             {/* Square */}
//             <button className={`p-2 rounded-lg hover:bg-[#F6EFFF] transition ${selectedShape === 'square' ? 'bg-[#AB55DC]/10' : ''}`} title="Square" onClick={() => onShapeSelect('square')}>
//                 <svg width="24" height="24"><rect x="4" y="4" width="16" height="16" rx="4" fill={selectedColor} /></svg>
//             </button>
//             {/* Triangle */}
//             <button className={`p-2 rounded-lg hover:bg-[#F6EFFF] transition ${selectedShape === 'triangle' ? 'bg-[#AB55DC]/10' : ''}`} title="Triangle" onClick={() => onShapeSelect('triangle')}>
//                 <svg width="24" height="24"><polygon points="12,5 20,19 4,19" fill={selectedColor} /></svg>
//             </button>
//             {/* Circle */}
//             <button className={`p-2 rounded-lg hover:bg-[#F6EFFF] transition ${selectedShape === 'circle' ? 'bg-[#AB55DC]/10' : ''}`} title="Circle" onClick={() => onShapeSelect('circle')}>
//                 <svg width="24" height="24"><circle cx="12" cy="12" r="8" fill={selectedColor} /></svg>
//             </button>
//             {/* Diamond */}
//             <button className={`p-2 rounded-lg hover:bg-[#F6EFFF] transition ${selectedShape === 'diamond' ? 'bg-[#AB55DC]/10' : ''}`} title="Diamond" onClick={() => onShapeSelect('diamond')}>
//                 <svg width="24" height="24"><polygon points="12,4 20,12 12,20 4,12" fill={selectedColor} /></svg>
//             </button>
//             {/* Add phone (plus) */}
//             <button className="p-2 rounded-lg hover:bg-[#F6EFFF] transition" title="Add phone" onClick={onAddPhone}>
//                 <svg width="24" height="24"><circle cx="12" cy="12" r="10" fill="#F6EFFF" /><line x1="12" y1="8" x2="12" y2="16" stroke="#AB55DC" strokeWidth="2" /><line x1="8" y1="12" x2="16" y2="12" stroke="#AB55DC" strokeWidth="2" /></svg>
//             </button>
//             {/* Close (X) */}
//             <button className="p-2 rounded-lg hover:bg-[#F6EFFF] transition" title="Close" onClick={onClose}>
//                 <svg width="24" height="24"><line x1="6" y1="6" x2="18" y2="18" stroke="#627899" strokeWidth="2" /><line x1="6" y1="18" x2="18" y2="6" stroke="#627899" strokeWidth="2" /></svg>
//             </button>
//         </div>
//     </div>
// );
