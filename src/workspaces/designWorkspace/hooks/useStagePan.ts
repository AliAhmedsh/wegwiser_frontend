import { useState, useRef, useCallback } from 'react';

export function useStagePan(initialPos = { x: 0, y: 0 }) {
  const [stagePos, setStagePos] = useState(initialPos);
  const [isPanning, setIsPanning] = useState(false);
  const panStart = useRef<{
    x: number;
    y: number;
    stageX: number;
    stageY: number;
  } | null>(null);

  const onPanStart = useCallback(
    (clientX: number, clientY: number) => {
      setIsPanning(true);
      panStart.current = {
        x: clientX,
        y: clientY,
        stageX: stagePos.x,
        stageY: stagePos.y,
      };
    },
    [stagePos]
  );

  const onPanMove = useCallback(
    (clientX: number, clientY: number) => {
      if (isPanning && panStart.current) {
        const dx = clientX - panStart.current.x;
        const dy = clientY - panStart.current.y;
        setStagePos({
          x: panStart.current.stageX + dx,
          y: panStart.current.stageY + dy,
        });
      }
    },
    [isPanning]
  );

  const onPanEnd = useCallback(() => {
    setIsPanning(false);
    panStart.current = null;
  }, []);

  return {
    stagePos,
    setStagePos,
    isPanning,
    onPanStart,
    onPanMove,
    onPanEnd,
  };
}
