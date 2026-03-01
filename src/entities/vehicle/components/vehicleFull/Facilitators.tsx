import Image from 'next/image';
import Facilitator from '@/entities/facilitator/Facilitator';
import ShadowWrapper from '../shared/ShadowWrapper';
import { AddFacilitatorsDialog } from '@/components/ui/dialog';
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@radix-ui/react-hover-card';
import { WorkerListProps } from '@/entities/worker/type';
import { useVehicle } from '@/lib/api/hooks/useVehicle';
import { useMemo } from 'react';

export interface FacilitatorProps {
  facilitators: WorkerListProps[];
  vehicleID: string;
}

const Facilitators: React.FC<FacilitatorProps> = ({ vehicleID }) => {
  // Validate vehicleID before parsing
  const vehicleIdNum = vehicleID ? parseInt(vehicleID) : 0;
  const isValidId = !isNaN(vehicleIdNum) && vehicleIdNum > 0;
  
  // Fetch real vehicle data from API using React Query
  const { data: vehicleData, isLoading } = useVehicle(isValidId ? vehicleIdNum : 0);

  // Use facilitators from the separate facilitators object returned by API
  const facilitatorsList = useMemo(() => {
    if (!isValidId || !vehicleData?.vehicle) return [];
    
    // Use the facilitators array directly if available, otherwise fallback to filtering teamMembers
    const facilitatorsData = vehicleData.vehicle.facilitators || 
      (vehicleData.vehicle.teamMembers?.filter((member: any) => member?.role === 'FACILITATOR') || []);
    
    if (!facilitatorsData || facilitatorsData.length === 0) return [];
    
    // Maintain their order from the API (preserves order they were added)
    // Facilitators will fill slots from left to right (position 0, 1, 2)
    const facilitators = facilitatorsData
      .filter(member => member && member.id && member.name && member.email) // Filter out invalid members
      .map(member => ({
        id: member.id?.toString() || '',
        name: member.name || '',
        surname: '',
        email: member.email || '',
        accuratePosition: 'FACILITATOR',
        shortName: (member.name || '').split(' ').filter(n => n).map(n => n[0]).join('.') || '',
        color: '#4E6DB3',
        isManager: false,
        password: '',
        position: 'FACILITATOR',
        timeZone: 'UTC+0',
        phoneNumber: '',
        capacity: [],
        status: 'active',
        productInProgress: 0,
        vehicleInProgress: 0,
        relatedVehicles: [vehicleID],
        facilitatorIn: [vehicleID],
        efficiencyCharts: {
          speed: 75,
          efficiency: 80,
          quality: 85,
        },
        relatedProducts: [],
        image: '/Ellipse 5.svg'
      } as WorkerListProps));
    
    return facilitators;
  }, [vehicleData, vehicleID, isValidId]);

  const maxSlots = 3;

  // Create array of 3 slots - facilitators fill from left (slot 0, 1, 2), "+" signs appear on right
  const slots = useMemo(() => {
    const result = [];
    for (let i = 0; i < maxSlots; i++) {
      result.push({
        index: i,
        facilitator: facilitatorsList[i] || null, // null means show "+" button
      });
    }
    return result;
  }, [facilitatorsList]);

  return (
    <div className="mt-5 pb-5">
      <div className="flex items-center">
        <span className="font-bold ml-2">Facilitators</span>
        <HoverCard openDelay={50} closeDelay={50}>
          <HoverCardTrigger>
            <Image
              className="ml-1"
              src="/icons/tip-icon.svg"
              alt="tip"
              width={15}
              height={15}
            />
          </HoverCardTrigger>
          <HoverCardContent
            style={{
              boxShadow: `2px 2px 2px 0px #A7B1C499`,
            }}
            className="text-[#627899] w-[150px] bg-white rounded-[5px] text-center p-2 text-[10px]"
          >
            Facilitators are team members from other departments who need to
            monitor the workflow. Up to 3 members can be added.
          </HoverCardContent>
        </HoverCard>
      </div>

      <div className="mt-3 flex gap-x-10 w-full">
        {isLoading ? (
          // Show loading placeholders
          [...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-gray-200 rounded-full w-28 h-28"></div>
          ))
        ) : (
          // Show facilitators in their slots, with "+" buttons for empty slots
          slots.map((slot) => (
            <AddFacilitatorsDialog
              vehicleID={vehicleID}
              title="Invite facilitators"
              key={slot.index}
            >
              {slot.facilitator ? (
                // Show facilitator
                <Facilitator {...slot.facilitator} />
              ) : (
                // Show "+" button for empty slot
                <ShadowWrapper>
                  <Image
                    src="/icons/Add.svg"
                    alt="add new facilitator"
                    width={25}
                    height={25}
                  />
                </ShadowWrapper>
              )}
            </AddFacilitatorsDialog>
          ))
        )}
      </div>
    </div>
  );
};

export default Facilitators;
