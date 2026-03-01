import { RenderElementProps } from 'slate-react';

import Utility from '../lib/utils';

import { AlignType, LinkElement } from '../types/custom-types';

import PromptMiniForm from '../forms/PromptMiniForm';
import { useMetaKeyPressed } from '../hooks/useMetaKeyPressed';

const Element = ({ attributes, children, element }: RenderElementProps) => {
  const style: React.CSSProperties = {};
  const [isMetaKeyPressed] = useMetaKeyPressed();

  if (Utility.isAlignElement(element)) {
    style.textAlign = element.align as AlignType;
  }

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!e.metaKey) return;

    e.preventDefault();
    window.open((element as LinkElement).url, '_blank');
  };

  switch (element.type) {
    case 'prompt-mini-form':
      return (
        <PromptMiniForm attributes={attributes} element={element}>
          {children}
        </PromptMiniForm>
      );
    case 'link':
      return (
        <a
          {...attributes}
          href={element.url}
          target="_blank"
          rel="noopener noreferrer"
          className="text-blue-600 underline"
          onClick={handleLinkClick}
          style={{
            cursor: isMetaKeyPressed ? 'pointer' : 'inherit',
          }}
        >
          {children}
        </a>
      );
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      );
    case 'bulleted-list':
      return (
        <ul className="list-disc pl-6" style={style} {...attributes}>
          {children}
        </ul>
      );
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      );
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      );
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      );
    case 'numbered-list':
      return (
        <ol className="list-decimal pl-6" style={style} {...attributes}>
          {children}
        </ol>
      );
    case 'code-block':
      return (
        <pre
          style={{
            backgroundColor: '#f5f5f5',
            padding: '5px',
            borderRadius: '6px',
            fontFamily: 'monospace',
            fontSize: '14px',
            overflowX: 'auto',
            ...style,
          }}
          {...attributes}
        >
          <code>{children}</code>
        </pre>
      );
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      );
  }
};

export default Element;
