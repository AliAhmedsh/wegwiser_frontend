// import React from 'react';
// import { Rect } from 'react-konva';
// import { KonvaEventObject } from 'konva/lib/Node';
// import type { CanvasShape } from './ShapeFrame';
//
// export type ShapeResizeCorner = 'nw' | 'ne' | 'sw' | 'se';
// export const HANDLE_SIZE = 20;
//
// interface ShapeResizeHandlesProps {
//     id: string;
//     size: number;
//     onStartResize: (id: string, corner: ShapeResizeCorner, pointer: { x: number; y: number }, shape: CanvasShape) => void;
//     shape: CanvasShape;
//     onHandleHover: (hovered: boolean) => void;
// }
//
// export const ShapeResizeHandles: React.FC<ShapeResizeHandlesProps> = ({ id, size, onStartResize, shape, onHandleHover }) => {
//     const handleDown = (corner: ShapeResizeCorner) => (e: KonvaEventObject<MouseEvent | TouchEvent>) => {
//         e.cancelBubble = true;
//         const stage = e.target.getStage();
//         if (stage) {
//             const pointer = stage.getPointerPosition();
//             if (pointer) {
//                 onStartResize(id, corner, pointer, shape);
//             }
//         }
//     };
//     return (
//         <>
//             {/* Top-left (nw) */}
//             <Rect x={0 - HANDLE_SIZE / 2} y={0 - HANDLE_SIZE / 2} width={HANDLE_SIZE} height={HANDLE_SIZE} fill="#fff" stroke="#AB55DC" strokeWidth={3} cornerRadius={4}
//                 onMouseDown={handleDown('nw')} onTouchStart={handleDown('nw')}
//                 onMouseEnter={() => onHandleHover(true)} onMouseLeave={() => onHandleHover(false)}
//                 cursor="nwse-resize"
//             />
//             {/* Top-right (ne) */}
//             <Rect x={size - HANDLE_SIZE / 2} y={0 - HANDLE_SIZE / 2} width={HANDLE_SIZE} height={HANDLE_SIZE} fill="#fff" stroke="#AB55DC" strokeWidth={3} cornerRadius={4}
//                 onMouseDown={handleDown('ne')} onTouchStart={handleDown('ne')}
//                 onMouseEnter={() => onHandleHover(true)} onMouseLeave={() => onHandleHover(false)}
//                 cursor="nesw-resize"
//             />
//             {/* Bottom-left (sw) */}
//             <Rect x={0 - HANDLE_SIZE / 2} y={size - HANDLE_SIZE / 2} width={HANDLE_SIZE} height={HANDLE_SIZE} fill="#fff" stroke="#AB55DC" strokeWidth={3} cornerRadius={4}
//                 onMouseDown={handleDown('sw')} onTouchStart={handleDown('sw')}
//                 onMouseEnter={() => onHandleHover(true)} onMouseLeave={() => onHandleHover(false)}
//                 cursor="nesw-resize"
//             />
//             {/* Bottom-right (se) */}
//             <Rect x={size - HANDLE_SIZE / 2} y={size - HANDLE_SIZE / 2} width={HANDLE_SIZE} height={HANDLE_SIZE} fill="#fff" stroke="#AB55DC" strokeWidth={3} cornerRadius={4}
//                 onMouseDown={handleDown('se')} onTouchStart={handleDown('se')}
//                 onMouseEnter={() => onHandleHover(true)} onMouseLeave={() => onHandleHover(false)}
//                 cursor="nwse-resize"
//             />
//         </>
//     );
// };
