import { useState } from 'react';

interface ResizeOptions {
  minWidth?: number;
  maxWidth?: number;
  minHeight?: number;
  maxHeight?: number;
  onResize?: (newSize: number) => void;
}

export const useResize = (initialSize: number, options: ResizeOptions = {}) => {
  const [size, setSize] = useState(initialSize);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    const startX = e.clientX;
    const startSize = size;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX;
      const newSize = Math.max(
        options.minWidth || 0,
        Math.min(options.maxWidth || Infinity, startSize + delta)
      );
      setSize(newSize);
      options.onResize?.(newSize);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return {
    size,
    isResizing,
    handleMouseDown,
  };
};

export const useVerticalResize = (
  initialHeight: number,
  options: ResizeOptions = {}
) => {
  const [height, setHeight] = useState(initialHeight);
  const [isResizing, setIsResizing] = useState(false);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true);
    const startY = e.clientY;
    const startHeight = height;

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientY - startY;
      const newHeight = Math.max(
        options.minHeight || 0,
        Math.min(options.maxHeight || Infinity, startHeight - delta)
      );
      setHeight(newHeight);
      options.onResize?.(newHeight);
    };

    const onMouseUp = () => {
      setIsResizing(false);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  return {
    height,
    isResizing,
    handleMouseDown,
  };
};
