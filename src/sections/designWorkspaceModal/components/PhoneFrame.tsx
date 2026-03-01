// import React from 'react';
// import { Group, Rect } from 'react-konva';
// import { KonvaEventObject } from 'konva/lib/Node';
// import { ResizeHandles } from './ResizeHandles';
// import type { ResizeCorner } from '../hooks/usePhoneResize';
//
// const PADDING = 8;
// const MIN_OVERLAY_SIZE = 24;
//
// export interface Phone {
//     id: string;
//     x: number;
//     y: number;
//     width: number;
//     height: number;
// }
//
// export interface PhoneFrameProps {
//     phone: Phone;
//     onDragEnd: (e: KonvaEventObject<DragEvent>) => void;
//     onClick?: (e: KonvaEventObject<MouseEvent>) => void;
//     onHover: (hovered: boolean) => void;
//     onStartResize: (id: string, corner: ResizeCorner, pointer: { x: number; y: number }, phone: Phone) => void;
//     hoveredId: string | null;
//     setHoveredId: (id: string | null) => void;
//     activeResize: { id: string } | null;
//     selected: boolean;
//     onSelect: () => void;
//     selectedMouseTool: 'move' | 'hand' | 'scale';
// }
//
// export const PhoneFrame: React.FC<PhoneFrameProps> = ({
//     phone,
//     onDragEnd,
//     onHover,
//     onStartResize,
//     hoveredId,
//     setHoveredId,
//     activeResize,
//     onSelect,
//     selectedMouseTool,
// }) => {
//     const isActive = hoveredId === phone.id || (activeResize && activeResize.id === phone.id);
//     // Border/overlay size
//     const borderWidth = Math.max(phone.width, MIN_OVERLAY_SIZE) + PADDING * 2;
//     const borderHeight = Math.max(phone.height, MIN_OVERLAY_SIZE) + PADDING * 2;
//     // Offset to center phone in overlay if phone smaller than overlay
//     const xOffset = (borderWidth - phone.width) / 2;
//     const yOffset = (borderHeight - phone.height) / 2;
//     // Pass onStartResize to handles
//     const handleStartResize = (id: string, corner: ResizeCorner, pointer: { x: number; y: number }, phoneObj: Phone) => {
//         onStartResize(id, corner, pointer, phoneObj);
//     };
//     return (
//         <Group
//             x={phone.x - xOffset}
//             y={phone.y - yOffset}
//             draggable={selectedMouseTool !== 'hand'}
//             onClick={onSelect}
//             onTap={onSelect}
//             onDragEnd={onDragEnd}
//             onMouseEnter={() => { setHoveredId(phone.id); onHover(true); }}
//             onMouseLeave={() => { setHoveredId(null); onHover(false); }}
//         >
//             {/* Overlay hover zone (always rendered, always listening) */}
//             <Rect
//                 x={0}
//                 y={0}
//                 width={borderWidth}
//                 height={borderHeight}
//                 fill={isActive ? '#AB55DC' : 'transparent'}
//                 opacity={isActive ? 0.12 : 0}
//                 cornerRadius={20}
//                 listening={true}
//             />
//             {/* Hover-Rect (по центру, більший на 20px) */}
//             <Rect
//                 x={xOffset - 10}
//                 y={yOffset - 10}
//                 width={phone.width + 20}
//                 height={phone.height + 20}
//                 fill={hoveredId === phone.id ? '#F6EFFF' : '#fff'}
//                 cornerRadius={20}
//                 shadowColor="#000"
//                 shadowBlur={16}
//                 shadowOpacity={0.10}
//                 stroke={undefined}
//                 strokeWidth={0}
//                 perfectDrawEnabled={false}
//                 listening={false}
//             />
//             {/* Сам телефон (чорний корпус) */}
//             <Rect
//                 id={phone.id}
//                 x={xOffset}
//                 y={yOffset}
//                 width={phone.width}
//                 height={phone.height}
//                 cornerRadius={12}
//                 fill="#0A0D14"
//                 listening={true}
//             />
//             {/* Нижній білий прямокутник (кнопка) */}
//             <Rect x={xOffset + 4} y={yOffset + phone.height - 25} width={phone.width - 7} height={21} cornerRadius={10.5} fill="white" listening={false} />
//             {/* Верхній білий прямокутник (екран) */}
//             <Rect x={xOffset + 4} y={yOffset + 49} width={phone.width - 7} height={77} cornerRadius={5} fill="white" listening={false} />
//             {/* Додатковий білий прямокутник (наприклад, для контенту) */}
//             <Rect x={xOffset + 4} y={yOffset + 133} width={53} height={61} cornerRadius={5} fill="white" listening={false} />
//             {/* Handles */}
//             {isActive && (
//                 <ResizeHandles
//                     id={phone.id}
//                     width={borderWidth}
//                     height={borderHeight}
//                     onStartResize={handleStartResize}
//                     phone={phone}
//                 />
//             )}
//         </Group>
//     );
// };
