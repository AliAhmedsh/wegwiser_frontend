// import React from 'react';
// import { Group, Rect, Circle, RegularPolygon } from 'react-konva';
// import { ShapeResizeHandles } from './ShapeResizeHandles';
// import type { ShapeResizeCorner } from './ShapeResizeHandles';
//
// export interface CanvasShape {
//     id: string;
//     type: 'square' | 'triangle' | 'circle' | 'diamond';
//     x: number;
//     y: number;
//     size: number;
//     color: string;
// }
//
// interface ShapeFrameProps {
//     shape: CanvasShape;
//     drag: ReturnType<typeof import('../hooks/useShapeDrag').useShapeDrag>;
//     onStartResize: (id: string, corner: ShapeResizeCorner, pointer: { x: number; y: number }, shape: CanvasShape) => void;
//     hoveredId: string | null;
//     setHoveredId: (id: string | null) => void;
//     activeResize: { id: string } | null;
//     setShapes: React.Dispatch<React.SetStateAction<CanvasShape[]>>;
//     selected: boolean;
//     onSelect: () => void;
//     selectedMouseTool: 'move' | 'hand' | 'scale';
// }
//
// const PADDING = 8;
// const MIN_OVERLAY_SIZE = 24;
//
// export const ShapeFrame: React.FC<ShapeFrameProps> = ({ shape, drag, onStartResize, hoveredId, setHoveredId, activeResize, setShapes, onSelect, selectedMouseTool }) => {
//     const isActive = hoveredId === shape.id || (activeResize && activeResize.id === shape.id);
//     const borderSize = Math.max(shape.size, MIN_OVERLAY_SIZE) + PADDING * 2;
//     const shapeOffset = (borderSize - shape.size) / 2;
//     const handleStartResize = (id: string, corner: ShapeResizeCorner, pointer: { x: number; y: number }, shapeObj: CanvasShape) => {
//         onStartResize(id, corner, pointer, shapeObj);
//     };
//     return (
//         <Group
//             x={shape.x - shapeOffset}
//             y={shape.y - shapeOffset}
//             draggable={selectedMouseTool !== 'hand'}
//             onClick={onSelect}
//             onTap={onSelect}
//             onDragStart={() => drag.onDragStart(shape.id)}
//             onDragEnd={() => drag.onDragEnd()}
//             onDragMove={e => drag.onDragMove(shape.id, e.target.x(), e.target.y(), setShapes)}
//         >
//             {/* Overlay hover zone (always rendered) */}
//             <Rect
//                 x={0}
//                 y={0}
//                 width={borderSize}
//                 height={borderSize}
//                 fill={isActive ? '#AB55DC' : 'transparent'}
//                 opacity={isActive ? 0.12 : 0}
//                 cornerRadius={12}
//                 onMouseEnter={() => setHoveredId(shape.id)}
//                 onMouseLeave={() => setHoveredId(null)}
//             />
//             {/* Shape itself (centered in border) */}
//             {shape.type === 'square' && (
//                 <Rect id={shape.id} x={shapeOffset} y={shapeOffset} width={shape.size} height={shape.size} fill={shape.color} cornerRadius={8} />
//             )}
//             {shape.type === 'circle' && (
//                 <Circle id={shape.id} x={shapeOffset + shape.size / 2} y={shapeOffset + shape.size / 2} radius={shape.size / 2} fill={shape.color} />
//             )}
//             {shape.type === 'triangle' && (
//                 <RegularPolygon id={shape.id} x={shapeOffset + shape.size / 2} y={shapeOffset + shape.size / 2} sides={3} radius={shape.size / 2} fill={shape.color} rotation={-90} />
//             )}
//             {shape.type === 'diamond' && (
//                 <RegularPolygon id={shape.id} x={shapeOffset + shape.size / 2} y={shapeOffset + shape.size / 2} sides={4} radius={shape.size / 2} fill={shape.color} rotation={45} />
//             )}
//             {/* Handles at corners of border */}
//             {isActive && (
//                 <ShapeResizeHandles
//                     id={shape.id}
//                     size={borderSize}
//                     onStartResize={handleStartResize}
//                     shape={shape}
//                     onHandleHover={hover => setHoveredId(hover ? shape.id : null)}
//                 />
//             )}
//         </Group>
//     );
// }
