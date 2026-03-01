import { useProductStore } from '@/entities/product/store';
import EfficiencyCard from '@/entities/vehicle/components/shared/EffiecincyCard';
import { usePersonalAnalytics } from '@/hooks/usePersonalAnalytics';
import { useMemberPerformance } from '@/lib/api/hooks/useFastApi';
import Modal from '@/shared/portals/ModalWindow';
import { Open_Sans, Poppins } from 'next/font/google';
import React from 'react';

interface PersonalAnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
  noDimming?: boolean;
}

const OpenSans400 = Open_Sans({
  weight: ['400'],
  subsets: ['cyrillic'],
});

const Poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const PersonalAnalyticsModal: React.FC<PersonalAnalyticsModalProps> = ({
  isOpen,
  onClose,
  noDimming,
}) => {
  const chosenProduct = useProductStore((state) => state.chosenProduct);
  const { data: analytics, isLoading, error } = usePersonalAnalytics(chosenProduct?.id || null);
  // Fetch FastAPI-powered performance scores (member_id = 1 for current user, TODO: get from auth)
  const { data: fastApiScores } = useMemberPerformance(1);

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} noDimming={noDimming}>
      <div
        className="bg-[#EAEDF2] rounded-2xl px-5 pt-5 pb-4 min-w-[612px] max-w-md mx-auto mt-65"
        style={{
          boxShadow: '0px 4px 4px 0px #00000040',
        }}
      >
        <h2 className="text-base font-semibold mb-3 text-black w-full text-left">
          Personal analytics
        </h2>

        {isLoading ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-sm text-gray-600">Loading analytics...</div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-32">
            <div className="text-sm text-red-600">Failed to load analytics</div>
          </div>
        ) : (
          <div className="flex flex-col border-1 border-[#9FA8B5] min-w-full rounded-2xl">
            <div className="min-w-full">
              <div className="flex justify-around border-none min-w-full">
                <EfficiencyCard
                  speed={fastApiScores?.speed ?? analytics?.performance.speed ?? 0}
                  efficiency={fastApiScores?.efficiency ?? analytics?.performance.efficiency ?? 0}
                  quality={fastApiScores?.quality ?? analytics?.performance.quality ?? 0}
                  minwidth="190px"
                />
              </div>
            </div>

            <p className="text-xs font-normal ml-5 mt-[-10px] pb-3 text-[#181818] w-full text-left">
              AI comment about overall performance……
            </p>
          </div>
        )}

        {!isLoading && !error && (
          <div className="w-full flex justify-between items-end mt-4">
            <div className="grid grid-cols-3 gap-y-5 gap-x-5 w-[70%] text-left p-4 border-1 border-[#9FA8B5] rounded-2xl">
              <div>
                <p
                  className={`text-xs font-semibold text-[#181818] ${OpenSans400.className}`}
                >
                  Involved Products
                </p>
                <p
                  className={`text-2xl mt-1 font-semibold text-black ${Poppins600.className}`}
                >
                  {analytics?.metrics.involvedProducts || 0}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs font-semibold text-[#181818] ${OpenSans400.className}`}
                >
                  Unread Messages
                </p>
                <p
                  className={`text-2xl font-semibold text-black mt-1 ${Poppins600.className}`}
                >
                  {analytics?.metrics.unreadMessages || 0}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs font-semibold text-[#181818] ${OpenSans400.className}`}
                >
                  Available Capacity
                </p>
                <p
                  className={`text-2xl font-semibold mt-1 text-black ${Poppins600.className}`}
                >
                  {analytics?.metrics.availableCapacity || 0}%
                </p>
              </div>
              <div>
                <p
                  className={`text-xs font-semibold text-[#181818] ${OpenSans400.className}`}
                >
                  Involved Vehicles
                </p>
                <p
                  className={`text-2xl font-semibold mt-1 text-black ${Poppins600.className}`}
                >
                  {analytics?.metrics.involvedVehicles || 0}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs font-semibold text-[#181818] ${OpenSans400.className}`}
                >
                  Mentions
                </p>
                <p
                  className={`text-2xl font-semibold mt-1 text-black ${Poppins600.className}`}
                >
                  {analytics?.metrics.mentions || 0}
                </p>
              </div>
              <div>
                <p
                  className={`text-xs font-semibold text-[#181818] ${OpenSans400.className}`}
                >
                  Operating Capacity
                </p>
                <p
                  className={`text-2xl font-semibold mt-1 text-black ${Poppins600.className}`}
                >
                  {analytics?.metrics.operatingCapacity || 0}%
                </p>
              </div>
            </div>
            <p
              className={`text-xs pb-2.5 text-blue-600 text-right mt-4 ${OpenSans400.className}`}
            >
              {analytics?.lastUpdated ? `Last updated ${new Date(analytics.lastUpdated).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: '2-digit' })}` : 'Last updated -'}
            </p>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default PersonalAnalyticsModal;
