'use client';
import Button from '@/shared/ui/button';
import { useGuidelineStore } from '@/store/guidelinesStore';
import MainSection from '@/widgets/mainSection/MainSection';

const Footer = () => {
  const step = useGuidelineStore((state) => state.step);

  return (
    <div className="fixed bottom-0 flex w-full z-10">
      <div className="w-[95%] mx-auto flex justify-between items-end ">
        <div
          className={`message-button relative  ${
            (step === 2 && 'z-50 pointer-events-none') || 'z-0'
          }`}
        >
          <Button image={''} />
        </div>
        <div
          className={` relative flex items-end   ${
            (step === 5 && 'z-50 pointer-events-none') || 'z-0'
          }`}
        >
          <MainSection />
        </div>
        <div
          className={`ai-button relative ${
            (step === 3 && 'z-50 pointer-events-none') || 'z-0'
          }`}
        >
          <Button image={''} />
        </div>
      </div>
    </div>
  );
};

export default Footer;
