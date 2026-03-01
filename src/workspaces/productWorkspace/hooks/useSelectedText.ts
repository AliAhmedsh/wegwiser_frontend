import { useEffect, useState } from 'react';
import { Editor, Range } from 'slate';

const useSelectedText = (editor: Editor): [string] => {
  const [selectedText, setSelectedText] = useState('');

  useEffect(() => {
    const updateSelection = () => {
      const { selection } = editor;

      if (selection && !Range.isCollapsed(selection)) {
        const text = Editor.string(editor, selection);
        setSelectedText(text);
      } else {
        setSelectedText('');
      }
    };

    const { onChange } = editor;
    editor.onChange = () => {
      onChange();
      updateSelection();
    };

    updateSelection();

    return () => {
      editor.onChange = onChange;
    };
  }, [editor]);

  return [selectedText];
};

export default useSelectedText;
