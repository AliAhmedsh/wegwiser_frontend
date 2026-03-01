import React from 'react';
import { Check } from 'lucide-react';

interface Props {
  isSelected: boolean
}

const CheckIconIsSelected: React.FC<Props> = ({isSelected}) => {
  return (
    <Check className={`opacity-0 w-4 h-4 ${isSelected && 'opacity-100'} `} />
  );
};

export default CheckIconIsSelected;
