'use client';

import {
  HoverCard,
  HoverCardTrigger,
  HoverCardContent,
} from '@/components/ui/hover-card';
import React from 'react';
import Spinner from './Spinner';

interface ConfirmBtnProps {
  text: string;
  onClick?: (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => void;
  isWhite?: boolean;
  type?: 'button' | 'submit' | 'reset';
  className?: string;
  style?: React.CSSProperties;
  isInActive?: boolean;
  disabled?: boolean;
  toolTipText?: string;
  isLoading?: boolean;
}

const ConfirmBtn: React.FC<ConfirmBtnProps> = ({
  text,
  onClick,
  isWhite,
  type = 'button',
  className = '',
  style = {},
  isInActive = false,
  disabled = false,
  toolTipText,
  isLoading = false,
}) => {
  const defaultStyles =
        'rounded-[12px] flex justify-center w-full text-[#535354] active:scale-90 items-center max-w-full border-none border p-1.5 hover:scale-98 transition-all duration-300';

  const activeStyle = isWhite
    ? 'bg-white font-semibold'
    : 'font-semibold';

  const inActiveStyle = (isInActive || disabled)
    ? 'cursor-not-allowed'
    : 'cursor-pointer';

  const button = (
    <button
      className={`${defaultStyles} ${activeStyle} ${inActiveStyle} ${className}`}
      onClick={onClick}
      type={type}
      disabled={isInActive || disabled}
      style={{
        boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
        ...style,
      }}
    >
      {isLoading && <Spinner size="sm" className="mr-2" />}
      <span
        className="text-[#535354] font-poppins text-[13.284px] font-semibold leading-[19.927px] not-italic"
      >
        {text}
      </span>
    </button>
  );

  if (isInActive && toolTipText) {
    return (
      <div className="w-full">
        <HoverCard openDelay={25} closeDelay={100}>
          <HoverCardTrigger asChild>{button}</HoverCardTrigger>
          <HoverCardContent className="text-[10px] max-w-[150px] p-2 text-center mt-2">
            {toolTipText}
          </HoverCardContent>
        </HoverCard>
      </div>
    );
  }

  return button;
};

export default ConfirmBtn;
