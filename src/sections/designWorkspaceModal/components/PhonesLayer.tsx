// import React from 'react';
// import { PhoneFrame } from './PhoneFrame';
// import type { KonvaEventObject } from 'konva/lib/Node';
// import type { Phone } from './PhoneFrame';
// import type { ResizeCorner } from '../hooks/usePhoneResize';
//
// interface PhonesLayerProps {
//     phones: Phone[];
//     hoveredId: string | null;
//     setHoveredId: (id: string | null) => void;
//     handlePhoneDragEnd: (id: string) => (e: KonvaEventObject<DragEvent>) => void;
//     handleDivClick: (e: KonvaEventObject<MouseEvent>) => void;
//     handlePhoneHover: (id: string, hovered: boolean) => void;
//     onStartResize: (id: string, corner: ResizeCorner, pointer: { x: number; y: number }, phone: Phone) => void;
//     activeResize: { id: string } | null;
//     selectedObject: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null;
//     setSelectedObject: (obj: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null) => void;
//     selectedMouseTool: 'move' | 'hand' | 'scale';
// }
//
// export const PhonesLayer: React.FC<PhonesLayerProps> = ({ phones, hoveredId, setHoveredId, handlePhoneDragEnd, handleDivClick, handlePhoneHover, onStartResize, activeResize, selectedObject, setSelectedObject, selectedMouseTool }) => (
//     <>
//         {phones.map((phone, idx) => (
//             <PhoneFrame
//                 key={phone.id}
//                 phone={phone}
//                 onDragEnd={handlePhoneDragEnd(phone.id)}
//                 onClick={idx === 0 ? handleDivClick : undefined}
//                 onHover={hovered => handlePhoneHover(phone.id, hovered)}
//                 onStartResize={onStartResize}
//                 hoveredId={hoveredId}
//                 setHoveredId={setHoveredId}
//                 activeResize={activeResize}
//                 selected={selectedObject?.type === 'phone' && selectedObject.id === phone.id}
//                 onSelect={() => setSelectedObject({ type: 'phone', id: phone.id })}
//                 selectedMouseTool={selectedMouseTool}
//             />
//         ))}
//     </>
// );
