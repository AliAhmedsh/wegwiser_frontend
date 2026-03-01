// import { useState, useCallback } from 'react';
//
// export function usePhoneDrag() {
//   const [draggingId, setDraggingId] = useState<string | null>(null);
//
//   const onDragStart = useCallback((id: string) => {
//     setDraggingId(id);
//   }, []);
//
//   const onDragEnd = useCallback(() => {
//     setDraggingId(null);
//   }, []);
//
//   return {
//     draggingId,
//     onDragStart,
//     onDragEnd,
//   };
// }
