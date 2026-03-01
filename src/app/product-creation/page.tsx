'use client';

import {
  AddMaterial,
  AddMembers,
  NameProduct,
  ReviewInformation,
  GeneratePRD,
  useCreationProductStore,
} from '@/features/createProduct';
import withAuthGuard from '@/hoc/guards/withAuthGuard';
import AnimationSettings from '@/lib/framerMotion/config';
import { AnimatePresence, motion } from 'framer-motion';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AIChat from '@/features/AiChat/AiChat';
import useAiStore from '@/store/AiStore';
import { useMemo, memo } from 'react';
import AiButton from '@/sections/header/components/AiButton';

const AIChatWrapper = memo(function AIChatWrapper({ step }: { step: number }) {
  const isShowAiWindow = useAiStore((state) => state.isShowAiWindow);
  
  if (!isShowAiWindow || step !== 3) {
    return null;
  }
  
  return (
    <div className="fixed z-[110] right-20 top-[7.5vh] h-[85vh] overflow-hidden ai-chat-prd-wrapper">
      <AIChat />
    </div>
  );
});

const ProductCreation = () => {
  const step = useCreationProductStore((state) => state.step);
  const router = useRouter();

  const StepComponent = useMemo(() => {
    switch (step) {
      case 1:
        return <NameProduct />;
      case 2:
        return <AddMaterial />;
      case 3:
        return <GeneratePRD />;
      case 4:
        return <AddMembers />;
      case 5:
        return <ReviewInformation />;
      default:
        return null;
    }
  }, [step]);

  return (
    <div className="bg-[#F4F4F4] justify-center flex items-center h-[100vh] relative">
      <Image
        className="fixed left-10 top-5 cursor-pointer z-50"
        width={120}
        height={34}
        src={'/icons/logo.svg'}
        alt="logo"
        onClick={() => router.push('/')}
      />

      <AiButton />

      <AIChatWrapper step={step} />
      
      <AnimatePresence mode="wait">
        <motion.div key={step} {...AnimationSettings.default}>
          {StepComponent}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default withAuthGuard(ProductCreation);
