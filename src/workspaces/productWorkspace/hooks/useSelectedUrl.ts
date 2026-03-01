import { useEffect, useState } from 'react';
import { Editor, Element as SlateElement } from 'slate';
import { LinkElement } from '../types/custom-types';
import Utility from '../lib/utils';

const useSelectedUrl = (editor: Editor): [string | undefined] => {
  const [url, setUrl] = useState<string | undefined>(undefined);

  useEffect(() => {
    const updateUrl = () => {
      const { selection } = editor;

      if (selection) {
        const [linkEntry] = Editor.nodes(editor, {
          at: selection,
          match: (n) => SlateElement.isElement(n) && Utility.isLinkElement(n),
        });

        if (linkEntry) {
          const link = linkEntry[0] as LinkElement;
          setUrl(link.url);
        } else {
          setUrl(undefined);
        }
      } else {
        setUrl(undefined);
      }
    };

    const { onChange } = editor;
    editor.onChange = () => {
      onChange();
      updateUrl();
    };

    updateUrl();

    return () => {
      editor.onChange = onChange;
    };
  }, [editor]);
  return [url];
};

export default useSelectedUrl;
