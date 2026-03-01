// import { useRef } from 'react';
// import { CanvasShape } from '../components/ShapeFrame';
//
// export function useShapeResize() {
//   const resizing = useRef<{
//     id: string;
//     startSize: number;
//     startPointer: { x: number; y: number };
//   } | null>(null);
//
//   const onResizeStart = (
//     id: string,
//     pointer: { x: number; y: number },
//     size: number
//   ) => {
//     resizing.current = { id, startSize: size, startPointer: pointer };
//   };
//
//   const onResizeMove = (
//     id: string,
//     pointer: { x: number; y: number },
//     setShapes: (cb: (prev: CanvasShape[]) => CanvasShape[]) => void
//   ) => {
//     if (!resizing.current || resizing.current.id !== id) return;
//     const { startSize, startPointer } = resizing.current;
//     const dx = pointer.x - startPointer.x;
//     const dy = pointer.y - startPointer.y;
//     const delta = Math.max(dx, dy);
//     setShapes((prev) =>
//       prev.map((shape) =>
//         shape.id === id
//           ? { ...shape, size: Math.max(20, startSize + delta) }
//           : shape
//       )
//     );
//   };
//
//   const onResizeEnd = () => {
//     resizing.current = null;
//   };
//
//   return { onResizeStart, onResizeMove, onResizeEnd };
// }
