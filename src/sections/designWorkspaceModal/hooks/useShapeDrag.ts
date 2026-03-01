// import { useRef } from 'react';
// import { CanvasShape } from '../components/ShapeFrame';
//
// export function useShapeDrag() {
//   const dragId = useRef<string | null>(null);
//
//   const onDragStart = (id: string) => {
//     dragId.current = id;
//   };
//
//   const onDragMove = (
//     id: string,
//     x: number,
//     y: number,
//     setShapes: (cb: (prev: CanvasShape[]) => CanvasShape[]) => void
//   ) => {
//     setShapes((prev) =>
//       prev.map((shape) => (shape.id === id ? { ...shape, x, y } : shape))
//     );
//   };
//
//   const onDragEnd = () => {
//     dragId.current = null;
//   };
//
//   return { onDragStart, onDragMove, onDragEnd };
// }
