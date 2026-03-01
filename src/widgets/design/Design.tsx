'use client';

import DesignPanel from '@/sections/designPanel';
import WidgetButton from '@/shared/ui/widgetBtn';
import { useGuidelineStore } from '@/store/guidelinesStore';
import { useSliderStore } from '@/store/sliderStore';
import { motion } from 'framer-motion';
import TopWidgetBtn from '../../assets/widget-btns/bruh.svg';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { vehicleKeys } from '@/lib/api/hooks/useVehicle';
import { useProductStore } from '@/entities/product';

export default function Design() {
  const { isShowDesign, setShowDesign, hideAllTabs } = useSliderStore();
  const step = useGuidelineStore((state) => state.step);
  const queryClient = useQueryClient();
  const { chosenProduct } = useProductStore();

  const onToggle = () => {
    hideAllTabs();
    if (!isShowDesign) {
      setShowDesign();
    }
  };

  // Watch for panel close and invalidate vehicles query to refresh task completion
  useEffect(() => {
    const productId = chosenProduct?.id;
    if (!productId) return;

    // When panel closes (was open, now closed), invalidate vehicles to refresh doneFor values
    if (!isShowDesign) {
      // Invalidate vehicles query to refresh task completion percentages
      queryClient.invalidateQueries({ 
        queryKey: [...vehicleKeys.all, 'byProduct', productId] 
      });
    }
  }, [isShowDesign, chosenProduct?.id, queryClient]);

  return (
    <div className={`absolute ${step === 5 ? 'z-30' : 'z-20'} w-full`}>
      <motion.div
        initial={{ y: '-90vh' }}
        animate={{ y: isShowDesign ? 0 : '-85.4vh' }}
        transition={{ type: 'tween', duration: 0.5 }}
        className=" fixed top-0 left-1/2 transform -translate-x-1/2 z-30"
      >
        <div
          style={{ boxShadow: '2px 2px 2px 0px #A7B1C499' }}
          className="w-[635px] h-[85vh] border border-white bg-[#E9ECF1] text-white rounded-b-xl shadow relative"
        >
          <DesignPanel isVisible={isShowDesign} />
          <div className="absolute right-1/2 bottom-0 translate-y-[1px] translate-x-[50%] w-[158px] h-[10px] z-10 bg-[#EAEDF2]"></div>
        </div>
        <WidgetButton
          ButtonImage={TopWidgetBtn}
          color="#8AD5E7"
          onClick={onToggle}
          text="Design"
          isClose={isShowDesign}
          isReversed
          className="z-[-10] mt-[-1.5px]"
          inLineStyle={{
            filter: 'drop-shadow(1px 3px 2px #A7B1C499)',
          }}
        />
      </motion.div>
    </div>
  );
}
