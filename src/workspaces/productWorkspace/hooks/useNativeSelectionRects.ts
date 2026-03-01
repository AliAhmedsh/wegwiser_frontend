import { useEffect, useState, RefObject } from 'react';

export function useNativeSelectionRects(ref: RefObject<HTMLElement | null>) {
  const [rects, setRects] = useState<DOMRect[] | null>(null);

  useEffect(() => {
    const handleSelectionChange = () => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0 || !ref.current) {
        setRects(null);
        return;
      }

      const range = selection.getRangeAt(0);
      const anchorNode = selection.anchorNode;
      const editorNode = ref.current;

      if (anchorNode && editorNode.contains(anchorNode)) {
        const rectList = Array.from(range.getClientRects());
        const filteredRects = rectList.filter((rect) => rect.width > 1);
        setRects(filteredRects);
      } else {
        setRects(null);
      }
    };

    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [ref]);

  return [rects];
}
