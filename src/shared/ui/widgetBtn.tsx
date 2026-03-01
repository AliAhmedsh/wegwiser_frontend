import React, { ComponentType, SVGProps } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WidgetButtonProps {
  ButtonImage: ComponentType<SVGProps<SVGSVGElement>>;
  text: string;
  isVertical?: boolean;
  onClick?: () => void;
  color: string;
  isClose: boolean;
  circleRotate?: number;
  textRotate?: number;
  isReversed?: boolean;
  className?: string;
  inLineStyle?: Record<string, string>;
}

const WidgetButton: React.FC<WidgetButtonProps> = ({
  ButtonImage,
  text,
  isVertical = false,
  onClick,
  color,
  isClose,
  circleRotate,
  textRotate,
  isReversed = false,
  className,
  inLineStyle,
}) => {
  const Circle = (
    <motion.div
      style={{
        background: color,
        transform: `rotate(${circleRotate}deg)`,
      }}
      className={`relative ${
        isClose ? 'w-3 h-3' : 'w-[21px] h-[21px]'
      } rounded-full flex p-0 items-center justify-center overflow-hidden font-inter`}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isClose ? 'letter-hidden' : 'letter-shown'}
          initial={{ opacity: isClose ? 1 : 0, scale: isClose ? 1 : 0.8 }}
          animate={{ opacity: isClose ? 0 : 1, scale: isClose ? 0.8 : 1 }}
          exit={{ opacity: isClose ? 1 : 0, scale: isClose ? 1 : 0.8 }}
          transition={{ duration: 0.3 }}
          className="absolute text-white text-[12px] font-inter"
        >
          {text[0]}
        </motion.span>
      </AnimatePresence>
    </motion.div>
  );

  const FullText = (
    <AnimatePresence>
      {isClose && (
        <motion.div
          key={`full-text-${text}`}
          style={{ transform: `rotate(${textRotate}deg)` }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, height: 0, width: 0 }}
          transition={{ duration: 0.3 }}
          className="text-[#535354]"
        >
          {text}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return (
    <div
      className={`text-center cursor-pointer ${
        isVertical ? 'vertical-text' : ''
      }`}
      onClick={onClick}
    >
      <div className="relative inline-block">
        {ButtonImage ? (
          <ButtonImage
            width={isVertical ? 31 : 160}
            height={isVertical ? 160 : 31}
            className={`${className} w-full h-full`}
            fill="none"
            style={inLineStyle}
          />
        ) : (
          ''
        )}
        <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center gap-2">
          {isReversed ? (
            <>
              {FullText}
              {Circle}
            </>
          ) : (
            <>
              {Circle}
              {FullText}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

function areEqual(prev: WidgetButtonProps, next: WidgetButtonProps) {
  return prev.isClose === next.isClose;
}

export default React.memo(WidgetButton, areEqual);
