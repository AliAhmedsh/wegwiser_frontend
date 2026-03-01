import { useGuidelineStore } from '@/store/guidelinesStore';
import { ReactNode } from 'react';

const CornerButtonWrapper: React.FC<{
  children: ReactNode;
  highlightStep: number;
}> = ({ children, highlightStep }) => {
  const { step, isGuidelining } = useGuidelineStore();

  return (
    <div
      className={`${step === highlightStep ? 'z-30' : 'z-0'} ${
        isGuidelining ? ' ' : 'z-30'
      }`}
    >
      {children}
    </div>
  );
};

export default CornerButtonWrapper;
