// import React from 'react';
// import { Group, Text, Rect } from 'react-konva';
// import { ShapeResizeHandles } from './ShapeResizeHandles';
// import type { CanvasText } from './TextLayer';
// import { KonvaEventObject } from 'konva/lib/Node';
//
// interface TextFrameProps {
//     textObj: CanvasText;
//     setTexts: React.Dispatch<React.SetStateAction<CanvasText[]>>;
//     editing: boolean;
//     setEditingTextId: (id: string | null) => void;
//     selectedId: string | null;
//     setSelectedId: (id: string | null) => void;
//     onEdit?: (textObj: CanvasText) => void;
// }
//
// export const TextFrame: React.FC<TextFrameProps> = ({ textObj, setTexts, setEditingTextId, selectedId, setSelectedId, onEdit }) => {
//     const isActive = selectedId === textObj.id;
//
//     const handleDragMove = (e: KonvaEventObject<DragEvent>) => {
//         setTexts(prev => prev.map(t => t.id === textObj.id ? { ...t, x: e.target.x(), y: e.target.y() } : t));
//     };
//
//     const handleResize = (corner: string, pointer: { x: number; y: number }) => {
//         // Simple resize: only width/height
//         setTexts(prev => prev.map(t => {
//             if (t.id !== textObj.id) return t;
//             let newWidth = t.width;
//             let newHeight = t.height;
//             switch (corner) {
//                 case 'se':
//                     newWidth = Math.max(40, pointer.x - t.x);
//                     newHeight = Math.max(20, pointer.y - t.y);
//                     break;
//                 // (можна додати інші кути за потреби)
//             }
//             return { ...t, width: newWidth, height: newHeight };
//         }));
//     };
//
//     return (
//         <Group
//             x={textObj.x}
//             y={textObj.y}
//             draggable
//             onDragEnd={handleDragMove}
//             onClick={() => setSelectedId(textObj.id)}
//         >
//             {/* Text background for selection */}
//             {isActive && (
//                 <Rect
//                     x={-4}
//                     y={-4}
//                     width={textObj.width + 8}
//                     height={textObj.height + 8}
//                     fill="#AB55DC"
//                     opacity={0.08}
//                     cornerRadius={8}
//                 />
//             )}
//             {/* Text itself */}
//             <Text
//                 text={textObj.value || 'Text'}
//                 fontSize={textObj.fontSize}
//                 width={textObj.width}
//                 height={textObj.height}
//                 fill={textObj.color}
//                 verticalAlign="middle"
//                 align="left"
//                 onDblClick={() => { setEditingTextId(textObj.id); if (onEdit) onEdit(textObj); }}
//                 onTap={() => { setEditingTextId(textObj.id); if (onEdit) onEdit(textObj); }}
//             />
//             {/* Resize handle (bottom-right only for simplicity) */}
//             {isActive && (
//                 <ShapeResizeHandles
//                     id={textObj.id}
//                     size={Math.max(textObj.width, textObj.height)}
//                     onStartResize={(id, corner, pointer) => handleResize(corner, pointer)}
//                     shape={{
//                         id: textObj.id,
//                         type: 'square',
//                         x: textObj.x,
//                         y: textObj.y,
//                         size: Math.max(textObj.width, textObj.height),
//                         color: textObj.color,
//                     }}
//                     onHandleHover={() => { }}
//                 />
//             )}
//         </Group>
//     );
// };
