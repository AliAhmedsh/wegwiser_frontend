import { useEffect, useState } from 'react';
import { ReactEditor } from 'slate-react';
import { Editor } from 'slate';

export function useSelectionRects(
  editor: Editor,
  rectHasVisibleText: (rect: DOMRect) => boolean
): [DOMRect[] | null] {
  const [textRects, setTextRects] = useState<DOMRect[] | null>(null);

  useEffect(() => {
    const selection = editor.selection;

    if (!selection) return;

    try {
      const domRange = ReactEditor.toDOMRange(editor, selection);
      const rectList = Array.from(domRange.getClientRects());

      const filteredRects = rectList.filter((rect) => rect.width > 1);
      if (filteredRects.length === 0) {
        setTextRects(null);
        return;
      }

      const textRects = filteredRects.filter(rectHasVisibleText);

      setTextRects(textRects);
    } catch {
      setTextRects(null);
    }
  }, [editor, editor.selection, rectHasVisibleText]);

  return [textRects];
}
