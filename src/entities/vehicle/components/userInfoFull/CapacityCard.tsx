import { useEffect, useState } from 'react';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card';
import { CapacityProps } from '../../types';
import useUserStore from '@/entities/worker/api/mock/userStore';

interface CapacityCardProps {
  userID: string;
  vehicleName: string;
  capacity?: CapacityProps[]; // Optional capacity prop to override store data
}

const CapacityCard: React.FC<CapacityCardProps> = ({ userID, vehicleName, capacity: capacityProp }) => {
  const [bars, setBars] = useState<{ filled: boolean; item?: CapacityProps }[]>(
    []
  );
  const [usedPercent, setUsedPercent] = useState(0);
  const [freePercent, setFreePercent] = useState(0);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const { users, freeCapacityByID } = useUserStore();

  useEffect(() => {
    const totalBars = 5;
    const user = users.find((u) => u.id === userID);
    // Use capacity prop if provided, otherwise fallback to store
    const capacity = capacityProp !== undefined ? capacityProp : (user?.capacity || []);

    const usedCount = capacity.length;
    const freeCount = Math.max(totalBars - usedCount, 0);

    // Fill from bottom to top (like a battery charging)
    // index: 0=top bar, 4=bottom bar (in display order)
    // usedCount=1 means fill bottom bar (index 4)
    // usedCount=2 means fill bottom 2 bars (indices 3,4)
    // Formula: bar at index i is filled if i >= (totalBars - usedCount)
    // Capacity items are mapped from bottom to top (capacity[0] shows on bottom bar)
    const newBars = Array.from({ length: totalBars }, (_, i) => {
      const filledThreshold = totalBars - usedCount;
      const isFilled = i >= filledThreshold;
      // Map capacity items from bottom to top
      // Bottom bar (index 4) shows capacity[0], next bar (index 3) shows capacity[1], etc.
      const capacityIndex = totalBars - 1 - i;
      const item = isFilled && capacityIndex < capacity.length ? capacity[capacityIndex] : undefined;
      
      return {
        filled: isFilled,
        item: item,
      };
    });

    setBars(newBars);
    setUsedPercent(usedCount * 20);
    setFreePercent(freeCount * 20);
  }, [users, userID, capacityProp]);

  return (
    <div className="h-[200px] text-[12px] mt-2 border border-[rgba(0,0,0,0.3)] p-5 rounded-[12px] flex justify-between">
      <div>
        <div className="text-[14px] font-bold text-black">Capacity</div>
        <div className="mt-3 flex flex-col gap-2">
          {bars.map(({ filled, item }, index) => (
            <div
              key={index}
              className="flex justify-between items-center w-[150px]"
            >
              {filled && item ? (
                <HoverCard open={activeIndex === index}>
                  <HoverCardTrigger
                    onPointerEnter={() => setActiveIndex(index)}
                    onPointerLeave={() => setActiveIndex(null)}
                  >
                    <div
                      className={`w-[50px] h-[20px] rounded-[4px] transition-colors duration-200 cursor-pointer ${
                        activeIndex === index ? 'bg-[#4ba41e]' : 'bg-[#5EC130]'
                      }`}
                    />
                  </HoverCardTrigger>
                  <HoverCardContent
                    side="right"
                    onPointerEnter={() => setActiveIndex(index)}
                    onPointerLeave={() => setActiveIndex(null)}
                    className="cursor-pointer hover:underline text-center"
                  >
                    <div
                      onClick={() =>
                        freeCapacityByID(userID, item.id, vehicleName)
                      }
                    >
                      Free up selected capacity
                    </div>
                  </HoverCardContent>
                </HoverCard>
              ) : (
                <div
                  className="w-[50px] h-[20px] rounded-[4px] bg-[#D9D9D9]"
                  style={{ boxShadow: '0px 2px 10px 0px #00000026 inset' }}
                />
              )}
              <div className="w-[90px] text-center text-ellipsis whitespace-nowrap overflow-hidden ml-2">
                {filled && item ? item.vehicleName : ''}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="text-center">
        <div className="w-[200px] mt-3">
          <div>Available</div>
          <div className="text-[32px] font-bold ml-8">{freePercent}%</div>
        </div>
        <div className="w-[200px] mt-3">
          <div>Using</div>
          <div className="text-[32px] font-bold ml-8">{usedPercent}%</div>
        </div>
      </div>
    </div>
  );
};

export default CapacityCard;
