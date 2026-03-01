import { HistoryEditor } from 'slate-history';

import { forwardRef } from 'react';

import MarkButtonWS from '../../components/MarkButtonWS';

import { CustomElementFormat, CustomTextKey } from '../../types/custom-types';

import Utility from '../../lib/utils';
import { useSlate } from 'slate-react';
import BlockButtonWS from '../../components/BlockButtonWS';
import MenuDivider from './ui/MenuDivider';
import ButtonWS from '../../components/ButtonWS';

import BoldLine from '../../../../assets/icons/BoldLine.svg';
import ItalicLine from '../../../../assets/icons/ItalicLine.svg';
import Underline from '../../../../assets/icons/Underline.svg';
import CodeLine from '../../../../assets/icons/CodeLine.svg';
import BackLine from '../../../../assets/icons/BackLine.svg';
import ForwardLine from '../../../../assets/icons/ForwardLine.svg';
import StrikethroughLine from '../../../../assets/icons/StrikethroughLine.svg';
import DotListLine from '../../../../assets/icons/DotListLine.svg';
import OrderedListLine from '../../../../assets/icons/OrderedListLine.svg';
import LinkLine from '../../../../assets/icons/LinkLine.svg';
import AtLine from '../../../../assets/icons/AtLine.svg';

import AlignTextSelect from './sections/AlignTextSelect';

import { useProductWorkspaceStore } from '../../../../store/productWorkspaceStore';

export type MenuWSProps = {
  className?: string;
  onMouseDown?: (
    event: React.MouseEvent<HTMLSpanElement>,
    format: CustomTextKey | CustomElementFormat,
    type: 'mark' | 'block'
  ) => void;
};

const MenuWS = forwardRef<HTMLDivElement, MenuWSProps>(
  ({ className = '', onMouseDown }, ref) => {
    const editor = useSlate();

    const setIsLinkFormOpen = useProductWorkspaceStore(
      (state) => state.setIsLinkFormOpen
    );

    const handleUndo = () => {
      if (editor.history.undos.length > 0) {
        HistoryEditor.undo(editor);
      }
    };

    const handleRedo = () => {
      if (editor.history.redos.length > 0) {
        HistoryEditor.redo(editor);
      }
    };

    return (
      <div
        data-test-id="menu"
        ref={ref}
        className={`flex flex-row items-center gap-2 z-1000 ${className}`}
        style={{
          boxShadow: '0px 4px 10px 0px #0000001A',
          backdropFilter: 'blur(20px)',
        }}
      >
        <ButtonWS onMouseDown={handleUndo}>
          <BackLine
            style={{
              fill: editor.history.undos.length > 0 ? '#09244B' : '#124897',
            }}
            className="w-6 h-6"
          />
        </ButtonWS>
        <ButtonWS onMouseDown={handleRedo}>
          <ForwardLine
            style={{
              fill: editor.history.redos.length > 0 ? '#09244B' : '#124897',
            }}
            className="w-6 h-6"
          />
        </ButtonWS>
        <MenuDivider />
        <MarkButtonWS format="bold" onMouseDown={onMouseDown}>
          <BoldLine
            style={{
              fill: Utility.isMarkActive(editor, 'bold')
                ? '#09244B'
                : '#124897',
            }}
            className="w-6 h-6"
          />
        </MarkButtonWS>
        <MarkButtonWS format="italic" onMouseDown={onMouseDown}>
          <ItalicLine
            style={{
              fill: Utility.isMarkActive(editor, 'italic')
                ? '#09244B'
                : '#124897',
            }}
            className="w-6 h-6"
          />
        </MarkButtonWS>
        <MarkButtonWS format="underline" onMouseDown={onMouseDown}>
          <Underline
            style={{
              fill: Utility.isMarkActive(editor, 'underline')
                ? '#09244B'
                : '#124897',
            }}
            className="w-6 h-6"
          />
        </MarkButtonWS>
        <MarkButtonWS format="strikethrough" onMouseDown={onMouseDown}>
          <StrikethroughLine
            style={{
              fill: Utility.isMarkActive(editor, 'strikethrough')
                ? '#09244B'
                : '#124897',
            }}
            className="w-6 h-6"
          />
        </MarkButtonWS>
        <MenuDivider />
        <BlockButtonWS format="bulleted-list" onMouseDown={onMouseDown}>
          <DotListLine
            style={{
              fill: Utility.isBlockActive(
                editor,
                'bulleted-list',
                Utility.isAlignType('bulleted-list') ? 'align' : 'type'
              )
                ? '#09244B'
                : '#124897',
            }}
            className="w-6 h-6"
          />
        </BlockButtonWS>
        <BlockButtonWS format="numbered-list" onMouseDown={onMouseDown}>
          <OrderedListLine
            style={{
              fill: Utility.isBlockActive(
                editor,
                'numbered-list',
                Utility.isAlignType('numbered-list') ? 'align' : 'type'
              )
                ? '#09244B'
                : '#124897',
            }}
            className="w-6 h-6"
          />
        </BlockButtonWS>
        <AlignTextSelect onMouseDown={onMouseDown} />
        <MenuDivider />
        <BlockButtonWS
          format="link"
          onMouseDown={(e) => {
            e.preventDefault();
            setIsLinkFormOpen(true);
          }}
        >
          <LinkLine
            style={{
              fill: Utility.isBlockActive(
                editor,
                'link',
                Utility.isAlignType('link') ? 'align' : 'type'
              )
                ? '#09244B'
                : '#124897',
            }}
            className="w-6 h-6"
          />
        </BlockButtonWS>
        <BlockButtonWS format="code-block" onMouseDown={onMouseDown}>
          <CodeLine
            style={{
              fill: Utility.isBlockActive(
                editor,
                'code-block',
                Utility.isAlignType('code-block') ? 'align' : 'type'
              )
                ? '#09244B'
                : '#124897',
            }}
            className="w-6 h-6"
          />
        </BlockButtonWS>
        <MarkButtonWS format="bold">
          <AtLine
            style={{
              fill: Utility.isBlockActive(
                editor,
                'code-block',
                Utility.isAlignType('code-block') ? 'align' : 'type'
              )
                ? '#09244B'
                : '#124897',
            }}
            className="w-6 h-6"
          />
        </MarkButtonWS>
      </div>
    );
  }
);

MenuWS.displayName = 'MenuWS';

export default MenuWS;
