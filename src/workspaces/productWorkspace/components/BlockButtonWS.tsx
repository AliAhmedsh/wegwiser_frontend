import ButtonWS from './ButtonWS';
import { CustomElementFormat, CustomTextKey } from '../types/custom-types';

interface BlockButtonProps {
  format: CustomElementFormat;
  children?: React.ReactNode;
  onMouseDown?: (
    event: React.MouseEvent<HTMLSpanElement>,
    format: CustomTextKey | CustomElementFormat,
    type: 'mark' | 'block'
  ) => void;
}

const BlockButtonWS = ({ format, onMouseDown, children }: BlockButtonProps) => {
  return (
    <ButtonWS onMouseDown={(event) => onMouseDown?.(event, format, 'block')}>
      {children}
    </ButtonWS>
  );
};

export default BlockButtonWS;
