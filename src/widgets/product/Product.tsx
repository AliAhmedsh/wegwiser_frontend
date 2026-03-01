'use client';

import { useWorkspaceStore } from '@/entities/workspace';
import ViewProduct from '@/sections/view-product/ViewProduct';
import WidgetButton from '@/shared/ui/widgetBtn';
import { useSliderStore } from '@/store/sliderStore';
import { motion } from 'framer-motion';
import LeftWidgetBtn from '../../assets/widget-btns/LeftWidget.svg';
import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { vehicleKeys } from '@/lib/api/hooks/useVehicle';
import { useProductStore } from '@/entities/product';

export default function Product() {
  const { isShowProduct, setShowProduct, hideAllTabs } = useSliderStore();
  const { isFullScreen } = useWorkspaceStore();
  const queryClient = useQueryClient();
  const { chosenProduct } = useProductStore();

  const onToggle = () => {
    hideAllTabs();
    if (!isShowProduct) {
      setShowProduct();
    }
  };

  // Watch for panel close and invalidate vehicles query to refresh task completion
  useEffect(() => {
    const productId = chosenProduct?.id;
    if (!productId) return;

    // When panel closes (was open, now closed), invalidate vehicles to refresh doneFor values
    if (!isShowProduct) {
      // Invalidate vehicles query to refresh task completion percentages
      queryClient.invalidateQueries({ 
        queryKey: [...vehicleKeys.all, 'byProduct', productId] 
      });
    }
  }, [isShowProduct, chosenProduct?.id, queryClient]);

  return (
    <div className={`relative } ${isFullScreen ? '' : 'z-50'}`}>
      <motion.div
        initial={{ x: '-100%' }}
        animate={{ x: isShowProduct ? '0%' : '-100%' }}
        transition={{ type: 'tween', duration: 0.5 }}
        className="fixed top-1/2 left-0 -translate-y-1/2 flex"
      >
        <div
          className="relative h-[70vh] w-[800px] max-w-[calc(100vw-2rem)] border border-white bg-[#EAEDF2] rounded-r-xl py-6"
          style={{ boxShadow: '2px 2px 2px 0px #A7B1C499' }}
        >
          <ViewProduct />
          <div className="absolute right-0 top-1/2 translate-y-[-50%] translate-x-[1px] w-[10px] h-[156px] z-10 bg-[#EAEDF2]"></div>
          <div className="absolute top-1/2 right-0 translate-y-[-50%] translate-x-[100%]">
            <WidgetButton
              onClick={onToggle}
              ButtonImage={LeftWidgetBtn}
              text="Product"
              isVertical
              color="#E182B5"
              isClose={isShowProduct}
              circleRotate={270}
              textRotate={180}
              inLineStyle={{ filter: 'drop-shadow(2px 2px 2px #A7B1C499)' }}
            />
          </div>
        </div>

        {/* <div className="flex justify-center items-center">
          <WidgetButton
            onClick={onToggle}
            ButtonImage={LeftWidgetBtn}
            text="Product"
            isVertical
            className="z-10"
            color="#E182B5"
            isClose={isShowProduct}
            circleRotate={270}
            textRotate={180}
            inLineStyle={{ filter: 'drop-shadow(2px 2px 2px #A7B1C499)' }}
          />
        </div> */}
      </motion.div>
    </div>
  );
}
