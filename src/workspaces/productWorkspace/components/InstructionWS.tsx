import { forwardRef, PropsWithChildren, Ref } from 'react';

type InstructionWSProps = PropsWithChildren<{ className?: string }>;

const InstructionWS: React.FC<InstructionWSProps> = forwardRef(
  ({ className = '', children, ...props }, ref: Ref<HTMLDivElement>) => {
    return (
      <div
        {...props}
        ref={ref}
        className={`whitespace-pre-wrap -mx-5 mb-2.5 px-5 py-2.5 text-sm bg-yellow-100 ${className}`}
      >
        {children}
      </div>
    );
  }
);

InstructionWS.displayName = 'InstructionWS';

export default InstructionWS;
