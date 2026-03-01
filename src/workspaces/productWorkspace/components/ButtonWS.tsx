import { forwardRef, PropsWithChildren, Ref } from 'react';

type ButtonWSProps = PropsWithChildren<{
  className?: string;
  onMouseDown?: (e: React.MouseEvent<HTMLSpanElement>) => void;
}>;

const ButtonWS: React.FC<ButtonWSProps> = forwardRef(
  ({ className = '', children, ...props }, ref: Ref<HTMLSpanElement>) => {
    const baseClasses =
      'flex items-center justify-center p-1 rounded-md cursor-pointer';

    return (
      <span {...props} ref={ref} className={`${baseClasses} ${className}`}>
        {children}
      </span>
    );
  }
);

ButtonWS.displayName = 'ButtonWS';

export default ButtonWS;
