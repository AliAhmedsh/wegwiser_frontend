import { useSlate } from 'slate-react';

import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '../../../../../components/ui/select';

import { useCurrentAlignValue } from '@/workspaces/productWorkspace/hooks/useCurrentAlignValue';

import {
  AlignType,
  CustomElementFormat,
  CustomTextKey,
} from '../../../types/custom-types';

import Utility from '../../../lib/utils';

import AlignLeftLine from '../../../../../assets/icons/AlignLeftLine.svg';
import AlignCenterLineTemp from '../../../../../assets/icons/AlignCenterLineTemp.svg';
import AlignRightLineTemp from '../../../../../assets/icons/AlignRightLineTemp.svg';
import BlockButtonWS from '../../../components/BlockButtonWS';

interface AlignTextSelectProps {
  onMouseDown?: (
    event: React.MouseEvent<HTMLSpanElement>,
    format: CustomTextKey | CustomElementFormat,
    type: 'mark' | 'block'
  ) => void;
}

const colorActive = '#09244B';
const colorInactive = '#124897';

const iconMap: Record<AlignType, React.ElementType> = {
  left: AlignLeftLine,
  center: AlignCenterLineTemp,
  right: AlignRightLineTemp,
};

const AlignTextSelect: React.FC<AlignTextSelectProps> = ({
  onMouseDown,
}: AlignTextSelectProps) => {
  const editor = useSlate();
  const [currentAlign] = useCurrentAlignValue(editor);
  const Icon = iconMap[currentAlign as AlignType];

  const fillColor = Utility.isBlockActive(
    editor,
    currentAlign,
    Utility.isAlignType(currentAlign) ? 'align' : 'type'
  )
    ? colorActive
    : colorInactive;

  return (
    <Select value={currentAlign}>
      <SelectTrigger className="w-[50px] h-[32px] p-0 flex gap-1 items-center border-none shadow-none">
        <SelectValue>
          <Icon style={{ fill: fillColor }} className="w-[24px] h-[24px]" />
        </SelectValue>
      </SelectTrigger>

      <SelectContent>
        {(['left', 'center', 'right'] as AlignType[]).map((align) => {
          const IconComponent = iconMap[align];
          const fill = Utility.isBlockActive(
            editor,
            align,
            Utility.isAlignType(align) ? 'align' : 'type'
          )
            ? colorActive
            : colorInactive;

          return (
            <SelectItem key={align} value={align} className="flex items-center">
              <BlockButtonWS format={align} onMouseDown={onMouseDown}>
                <IconComponent style={{ fill }} className="w-6 h-6" />
              </BlockButtonWS>
            </SelectItem>
          );
        })}
      </SelectContent>
    </Select>
  );
};

export default AlignTextSelect;
