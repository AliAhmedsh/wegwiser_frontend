import ButtonWS from './ButtonWS';

import { CustomTextKey } from '../types/custom-types';

interface MarkButtonProps {
  format: CustomTextKey;
  children?: React.ReactNode;
  onMouseDown?: (
    event: React.MouseEvent<HTMLSpanElement>,
    format: CustomTextKey,
    type: 'mark' | 'block'
  ) => void;
}

const MarkButtonWS = ({ format, children, onMouseDown }: MarkButtonProps) => {
  return (
    <ButtonWS onMouseDown={(event) => onMouseDown?.(event, format, 'mark')}>
      {children}
    </ButtonWS>
  );
};

export default MarkButtonWS;
