'use client';
import DependenciesTab from '@/sections/dependenciesTab';
import TestingsTab from '@/sections/testingsTab';
import TicketsTab from '@/sections/ticketsTab';
import WorkspaceModal from '@/sections/workspaceModal/WorkspaceModal';
import WidgetButton from '@/shared/ui/widgetBtn';
import { useGuidelineStore } from '@/store/guidelinesStore';
import { useSliderStore } from '@/store/sliderStore';
import useWorkspaceStore from '@/store/workSpaceStore';
import { useProductStore } from '@/entities/product';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { ticketsKeys } from '@/entities/tickets/api/hooks';
import { ticketsService } from '@/entities/tickets/api/ticketsService';
import { dependenciesKeys } from '@/entities/dependencies/api/hooks';
import { dependenciesService } from '@/entities/dependencies/api/dependenciesService';
import { useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Poppins } from 'next/font/google';
import { useEffect, useState } from 'react';
import RightWidgetBtn from '../../assets/widget-btns/RightWidgetBtn.svg';
import { vehicleKeys } from '@/lib/api/hooks/useVehicle';

const TABS = [
  { key: 'tickets', label: 'Tickets' },
  { key: 'dependencies', label: 'Dependencies' },
  { key: 'testings', label: 'Testing' },
];

const Poppins800 = Poppins({
  weight: '800',
  subsets: ['latin'],
});

function TabComponent({ tab }: { tab: string }) {
  switch (tab) {
    case 'tickets':
      return <TicketsTab />;
    case 'dependencies':
      return <DependenciesTab />;
    case 'testings':
      return <TestingsTab />;
    default:
      return null;
  }
}

export default function Engineering() {
  const step = useGuidelineStore((state) => state.step);
  const isShowEngineering = useSliderStore((state) => state.isShowEngineering);
  const setShowEngineering = useSliderStore(
    (state) => state.setShowEngineering
  );

  const { isFullScreen } = useWorkspaceStore();
  const hideAllTabs = useSliderStore((state) => state.hideAllTabs);
  const chosenProduct = useProductStore((state) => state.chosenProduct);
  const { selectedVehicleId } = useSelectedVehicleStore();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState('tickets');

  const onToggle = () => {
    hideAllTabs();
    if (!isShowEngineering) {
      setShowEngineering();
    }
  };

  // Watch for panel close and invalidate vehicles query to refresh task completion
  useEffect(() => {
    const productId = chosenProduct?.id;
    if (!productId) return;

    // When panel closes (was open, now closed), invalidate vehicles to refresh doneFor values
    if (!isShowEngineering) {
      // Invalidate vehicles query to refresh task completion percentages
      queryClient.invalidateQueries({ 
        queryKey: [...vehicleKeys.all, 'byProduct', productId] 
      });
    }
  }, [isShowEngineering, chosenProduct?.id, queryClient]);

  useEffect(() => {
    const productId = chosenProduct?.id;
    // Don't prefetch if vehicleId is not available (backend requires it)
    if (!isShowEngineering || !productId || !selectedVehicleId) {
      return;
    }

    const prefetchEngineerData = async () => {
      try {
        await Promise.all([
          queryClient.prefetchQuery({
            queryKey: ticketsKeys.list(productId, { vehicleId: selectedVehicleId }),
            queryFn: () => ticketsService.getTickets(productId, { vehicleId: selectedVehicleId }),
          }),
          queryClient.prefetchQuery({
            queryKey: dependenciesKeys.list(productId, selectedVehicleId),
            queryFn: () => dependenciesService.getDependencies(productId, selectedVehicleId),
          }),
        ]);
      } catch (error) {
        console.error('Failed to prefetch engineering workspace data', error);
      }
    };

    prefetchEngineerData();
  }, [isShowEngineering, chosenProduct?.id, selectedVehicleId, queryClient]);

  return (
    <div className="absolute">
      <WorkspaceModal />
      <motion.div
        initial={{ x: '100%' }}
        animate={{ x: isShowEngineering ? '0%' : '100%' }}
        transition={{ type: 'tween', duration: 0.5 }}
        className={`fixed top-1/2 right-0 -translate-y-1/2 h-[63vh] w-[800px] max-w-[calc(100vw-2rem)] flex items-center z-10 ${step === 5 && 'z-30'
          } ${isFullScreen ? 'z-50' : 'z-60'}`}
      >
        <div className="flex justify-center items-center absolute ml-[-28px]">
          <WidgetButton
            onClick={onToggle}
            ButtonImage={RightWidgetBtn}
            text="Engineer"
            isVertical
            color="#000000"
            isClose={isShowEngineering}
            circleRotate={-90}
            textRotate={180}
            inLineStyle={{
              filter: 'drop-shadow(-2px 1px 1px rgba(167, 177, 196, 0.4))',
            }}
          />
        </div>

        <div
          style={{ boxShadow: '2px 2px 2px 0px #A7B1C499' }}
          className="h-full w-full bg-[#EAEDF2] border border-white text-white rounded-l-xl p-6 shadow-lg flex-shrink-0"
        >
          <div className={`flex gap-8 mb-7 ${Poppins800.className}`}>
            {TABS.map((tab) => (
              <button
                key={tab.key}
                className={`transition-colors text-[#535354] cursor-pointer ${activeTab === tab.key && 'border-b-4 border-[#627899]'
                  }`}
                onClick={() => setActiveTab(tab.key)}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div className="h-[calc(100%-3.5rem)] p-[1px] overflow-y-auto pr-2">
            <TabComponent tab={activeTab} />
          </div>
        </div>
      </motion.div>
    </div>
  );
}
