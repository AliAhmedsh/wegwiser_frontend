'use client';

import { motion, AnimatePresence } from 'framer-motion';
import {
  BasicInfo,
  ProductRelating,
  VehicleOutline,
  InviteMembers,
  ReviewInformation,
} from '@/features/createVehicle';

import AnimationSettings from '@/lib/framerMotion/config';
import { useCreationVehicleStore } from '@/features/createVehicle/store';
import withAuthGuard from '@/hoc/guards/withAuthGuard';

const VehicleCreation = () => {
  const step = useCreationVehicleStore((state) => state.step);

  const StepComponent = () => {
    switch (step) {
      case 1:
        return <BasicInfo />;
      case 2:
        return <ProductRelating />;
      case 3:
        return <VehicleOutline />;
      case 4:
        return <InviteMembers />;
      case 5:
        return <ReviewInformation />;
      default:
        return null;
    }
  };

  return (
    <div className="overflow-hidden">
      <AnimatePresence mode="wait">
        <motion.div key={step} {...AnimationSettings.default}>
          <StepComponent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default withAuthGuard(VehicleCreation);
