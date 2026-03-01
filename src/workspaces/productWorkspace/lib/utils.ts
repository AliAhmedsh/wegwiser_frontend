import { Editor, Transforms } from 'slate';
import { Element as SlateElement } from 'slate';
import {
  AlignType,
  CustomEditor,
  CustomElement,
  CustomElementFormat,
  CustomElementWithAlign,
  CustomTextKey,
  LinkElement,
  ListType,
} from '../types/custom-types';

export const HOTKEYS: Record<string, CustomTextKey> = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
};

export const LIST_TYPES = ['numbered-list', 'bulleted-list'] as const;
export const TEXT_ALIGN_TYPES = ['left', 'center', 'right'] as const;

class Utility {
  static rectHasVisibleText(rect: DOMRect): boolean {
    const x = rect.right - 2;
    const y = rect.top + rect.height / 2;

    const element = document.elementFromPoint(x, y);
    if (!element) return false;

    if (element.tagName === 'SPAN') {
      return true;
    }

    return false;
  }

  static isAlignType(format: CustomElementFormat): format is AlignType {
    return TEXT_ALIGN_TYPES.includes(format as AlignType);
  }

  static isListType(format: CustomElementFormat): format is ListType {
    return LIST_TYPES.includes(format as ListType);
  }

  static isAlignElement(
    element: CustomElement
  ): element is CustomElementWithAlign {
    return 'align' in element;
  }

  static isLinkElement(element: SlateElement): element is LinkElement {
    return element.type === 'link' && 'url' in element;
  }

  static isBlockActive(
    editor: CustomEditor,
    format: CustomElementFormat,
    blockType: 'type' | 'align' = 'type'
  ) {
    const { selection } = editor;
    if (!selection) return false;

    const [match] = Array.from(
      Editor.nodes(editor, {
        at: Editor.unhangRange(editor, selection),
        match: (n) => {
          if (!Editor.isEditor(n) && SlateElement.isElement(n)) {
            if (blockType === 'align' && Utility.isAlignElement(n)) {
              return n.align === format;
            }
            return n.type === format;
          }
          return false;
        },
      })
    );

    return !!match;
  }

  static toggleBlock(editor: CustomEditor, format: CustomElementFormat) {
    const isActive = Utility.isBlockActive(
      editor,
      format,
      Utility.isAlignType(format) ? 'align' : 'type'
    );
    const isList = Utility.isListType(format);

    Transforms.unwrapNodes(editor, {
      match: (n) =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        Utility.isListType(n.type) &&
        !Utility.isAlignType(format) &&
        format !== 'code-block',
      split: true,
    });

    let newProperties: Partial<SlateElement>;

    if (Utility.isAlignType(format)) {
      newProperties = {
        align: isActive ? undefined : format,
      };
    } else if (format === 'code-block') {
      newProperties = {
        type: isActive ? 'paragraph' : 'code-block',
      };
    } else {
      newProperties = {
        type: isActive ? 'paragraph' : isList ? 'list-item' : format,
      };
    }

    Transforms.setNodes<SlateElement>(editor, newProperties);

    if (!isActive && isList) {
      const block = { type: format, children: [] };
      Transforms.wrapNodes(editor, block);
    }
  }

  static isMarkActive(editor: CustomEditor, format: CustomTextKey) {
    const marks = Editor.marks(editor);
    return marks ? marks[format] === true : false;
  }

  static toggleMark(editor: CustomEditor, format: CustomTextKey) {
    const isActive = Utility.isMarkActive(editor, format);
    if (isActive) {
      Editor.removeMark(editor, format);
    } else {
      Editor.addMark(editor, format, true);
    }
  }
}

export default Utility;
