// import { useState, useCallback } from 'react';
//
// export type ResizeCorner = 'nw' | 'ne' | 'sw' | 'se';
//
// export interface ResizeState {
//   id: string;
//   corner: ResizeCorner;
// }
//
// export interface ResizeStart {
//   x: number;
//   y: number;
//   width: number;
//   height: number;
//   phoneX: number;
//   phoneY: number;
// }
//
// export function usePhoneResize() {
//   const [resizing, setResizing] = useState<ResizeState | null>(null);
//   const [resizeStart, setResizeStart] = useState<ResizeStart | null>(null);
//
//   const startResize = useCallback(
//     (
//       id: string,
//       corner: ResizeCorner,
//       pointer: { x: number; y: number },
//       phone: { width: number; height: number; x: number; y: number }
//     ) => {
//       setResizing({ id, corner });
//       setResizeStart({
//         x: pointer.x,
//         y: pointer.y,
//         width: phone.width,
//         height: phone.height,
//         phoneX: phone.x,
//         phoneY: phone.y,
//       });
//     },
//     []
//   );
//
//   const endResize = useCallback(() => {
//     setResizing(null);
//     setResizeStart(null);
//   }, []);
//
//   return {
//     resizing,
//     resizeStart,
//     startResize,
//     endResize,
//     setResizeStart, // for advanced use
//   };
// }
