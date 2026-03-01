import { useEffect, useState } from 'react';
import { Editor, Element as SlateElement, Range } from 'slate';
import { AlignType } from '../types/custom-types';

export const useCurrentAlignValue = (editor: Editor): [AlignType] => {
  const [alignValue, setAlignValue] = useState<AlignType>('left');

  useEffect(() => {
    const updateAlign = () => {
      const { selection } = editor;

      if (selection && Range.isCollapsed(selection)) {
        const [match] = Editor.nodes(editor, {
          match: (n) =>
            !Editor.isEditor(n) &&
            SlateElement.isElement(n) &&
            'align' in n &&
            typeof n.align === 'string',
          mode: 'lowest',
        });

        if (match) {
          const node = match[0] as { align?: AlignType };
          if (node.align && ['left', 'center', 'right'].includes(node.align)) {
            setAlignValue(node.align);
            return;
          }
        }
      }

      setAlignValue('left');
    };

    const { onChange } = editor;
    editor.onChange = () => {
      onChange();
      updateAlign();
    };

    updateAlign();

    return () => {
      editor.onChange = onChange;
    };
  }, [editor]);

  return [alignValue];
};
