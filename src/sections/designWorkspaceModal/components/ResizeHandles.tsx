// import React from 'react';
// import { Circle } from 'react-konva';
// import type { ResizeCorner } from '../hooks/usePhoneResize';
// import { KonvaEventObject } from 'konva/lib/Node';
// import type { Phone } from './PhoneFrame';
//
// interface ResizeHandlesProps {
//     id: string;
//     width: number;
//     height: number;
//     onStartResize: (id: string, corner: ResizeCorner, pointer: { x: number; y: number }, phone: Phone) => void;
//     phone: Phone;
// }
//
// export const ResizeHandles: React.FC<ResizeHandlesProps> = ({ id, width, height, onStartResize, phone }) => {
//     const handleDown = (corner: ResizeCorner) => (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
//         e.cancelBubble = true;
//         const stage = e.target.getStage();
//         if (stage) {
//             const pointer = stage.getPointerPosition();
//             if (pointer) {
//                 onStartResize(id, corner, pointer, phone);
//             }
//         }
//     };
//     return (
//         <>
//             {/* Top-left (nw) */}
//             <Circle x={0} y={0} radius={8} fill="#AB55DC" stroke="#fff" strokeWidth={2} draggable={false} onMouseDown={handleDown('nw')} onTouchStart={handleDown('nw')} cursor="nwse-resize" />
//             {/* Top-right (ne) */}
//             <Circle x={width} y={0} radius={8} fill="#AB55DC" stroke="#fff" strokeWidth={2} draggable={false} onMouseDown={handleDown('ne')} onTouchStart={handleDown('ne')} cursor="nesw-resize" />
//             {/* Bottom-left (sw) */}
//             <Circle x={0} y={height} radius={8} fill="#AB55DC" stroke="#fff" strokeWidth={2} draggable={false} onMouseDown={handleDown('sw')} onTouchStart={handleDown('sw')} cursor="nesw-resize" />
//             {/* Bottom-right (se) */}
//             <Circle x={width} y={height} radius={8} fill="#AB55DC" stroke="#fff" strokeWidth={2} draggable={false} onMouseDown={handleDown('se')} onTouchStart={handleDown('se')} cursor="nwse-resize" />
//         </>
//     );
// };
