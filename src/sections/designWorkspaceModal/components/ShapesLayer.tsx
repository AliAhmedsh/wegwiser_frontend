// import React from 'react';
// import { ShapeFrame } from './ShapeFrame';
// import type { ShapeResizeCorner } from './ShapeResizeHandles';
// import type { CanvasShape } from './ShapeFrame';
//
// interface ShapesLayerProps {
//     shapes: CanvasShape[];
//     hoveredId: string | null;
//     setHoveredId: (id: string | null) => void;
//     shapeDrag: ReturnType<typeof import('../hooks/useShapeDrag').useShapeDrag>;
//     onStartResize: (id: string, corner: ShapeResizeCorner, pointer: { x: number; y: number }, shape: CanvasShape) => void;
//     activeResize: { id: string } | null;
//     setShapes: React.Dispatch<React.SetStateAction<CanvasShape[]>>;
//     selectedObject: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null;
//     setSelectedObject: (obj: { type: 'line' | 'shape' | 'phone' | 'pen', id: string } | null) => void;
//     selectedMouseTool: 'move' | 'hand' | 'scale';
// }
//
// export const ShapesLayer: React.FC<ShapesLayerProps> = ({ shapes, hoveredId, setHoveredId, shapeDrag, onStartResize, activeResize, setShapes, selectedObject, setSelectedObject, selectedMouseTool }) => (
//     <>
//         {shapes.map(shape => (
//             <ShapeFrame
//                 key={shape.id}
//                 shape={shape}
//                 drag={shapeDrag}
//                 onStartResize={onStartResize}
//                 hoveredId={hoveredId}
//                 setHoveredId={setHoveredId}
//                 activeResize={activeResize}
//                 setShapes={setShapes}
//                 selected={selectedObject?.type === 'shape' && selectedObject.id === shape.id}
//                 onSelect={() => setSelectedObject({ type: 'shape', id: shape.id })}
//                 selectedMouseTool={selectedMouseTool}
//             />
//         ))}
//     </>
// );
