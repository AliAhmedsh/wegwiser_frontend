import { CustomEditor } from '../types/custom-types';

export const withLinks = (editor: CustomEditor) => {
  const { isInline } = editor;

  editor.isInline = (element) => {
    return element.type === 'link' ? true : isInline(element);
  };

  return editor;
};
