import Facilitators from './components/vehicleFull/Facilitators';
import VehicleMembers from './components/vehicleFull/VehicleMembers';
import EfficiencyCard from './components/shared/EffiecincyCard';
import { useState, useEffect, useMemo } from 'react';
import { VehicleListProps } from './types';
import VehicleInfo from './components/vehicleFull/VehicleInfo';
import UserInfoFull from './components/userInfoFull/UserInfoFull';
import Spinner from '@/shared/ui/Spinner';
import useUserStore from '@/entities/worker/api/mock/userStore';
import { WorkerListProps } from '@/entities/worker/type';
import { useMemberPerformance, useVehicleMemberSkillScores, useVehicleTechStacks } from '@/lib/api/hooks/useFastApi';
import { getCurrentUserId } from '@/lib/utils/auth';
// import useFacilitatorStore from '../facilitator/api/mock/facilitatorStore';

export default function VehicleFull({ data }: { data: VehicleListProps | undefined }) {
  const [isShowUserInfo, setIsShowUserInfo] = useState<boolean>(false);
  const [userID, setUserID] = useState<string>('');
  const { updateUser } = useUserStore();

  // Fetch real vehicle team scores from FastAPI
  const vehicleId = data?.id ? Number(data.id) : 0;
  const { data: vehicleScoresData } = useVehicleMemberSkillScores(vehicleId, !!vehicleId);

  // Fetch current user's personal performance (FastAPI calculate-scores)
  const currentUserId = getCurrentUserId() || 1;
  const { data: memberScoresData } = useMemberPerformance(currentUserId, !!currentUserId);

  // Fetch vehicle tech stacks from FastAPI
  const { data: techStacksData } = useVehicleTechStacks(vehicleId ? String(vehicleId) : '', !!vehicleId);
  
  // Convert teamMembers to WorkerListProps and sync to store
  const workersData = useMemo(() => {
    if (!data?.teamMembers) return [];
    
    const mapped = ((data as any).teamMembers || [])
      .filter((member: any) => member && member.id && member.name && member.email)
      .map((member: any) => {
        const roleToPosition = (role: string): string => {
          const roleLower = (role || '').toLowerCase();
          // Check if it's a team lead role
          const isTeamLead = roleLower.includes('team lead');
          
          if (roleLower.includes('engineer') || roleLower.includes('qa')) {
            return isTeamLead ? 'ENGINEER/QA' : 'ENGINEER/QA'; // Keep same for filtering, but preserve in accuratePosition
          }
          if (roleLower.includes('ui') || roleLower.includes('ux') || roleLower.includes('designer')) {
            return 'UI/UX';
          }
          if (roleLower.includes('product') || roleLower.includes('manager') || roleLower.includes('pm')) {
            return 'PM';
          }
          return 'Member';
        };
        
        const position = roleToPosition(member.role || 'Member');
        
        const vehicleCount = (member as any).vehicleCount || 0;
        let filledLevels = (member as any).filledLevels;
        
        if (filledLevels === undefined || filledLevels === null) {
          filledLevels = Math.min(vehicleCount || 0, 5);
        }
        
        filledLevels = Math.max(0, Math.min(5, Number(filledLevels) || 0));
        
        // Use real vehicle names if available from backend, otherwise use placeholder
        const vehicles = (member as any).vehicles || [];
        const capacity = Array.from({ length: filledLevels }, (_, i) => {
          if (vehicles[i]) {
            return {
              id: vehicles[i].id,
              vehicleName: vehicles[i].name
            };
          }
          return {
            id: `vehicle-${i}`,
            vehicleName: `Vehicle ${i + 1}`
          };
        });

        // Extract real data from backend
        const productInProgress = (member as any).productInProgress || 0;
        const userRole = (member as any).userRole || member.role || 'Member';
        const email = member.email || '';

        // Parse name to get surname
        const nameParts = (member.name || '').split(' ').filter((n: string) => n);
        const firstName = nameParts[0] || '';
        const surname = nameParts.slice(1).join(' ') || '';
        const shortName = nameParts.map((n: string) => n[0]).join('.') || '';

        // Check if team lead and determine border color
        const roleLower = (member.role || '').toLowerCase();
        const isTeamLead = roleLower.includes('team lead');
        let teamLeadBorderColor: string | undefined = undefined;
        
        // Helper function to check if role is Product Manager
        const isProductManager = (role: string) => {
          const r = role.toLowerCase();
          return r.includes('product_manager') || 
                 r.includes('product manager') || 
                 r.includes('pm') || 
                 (r.includes('product') && r.includes('manager'));
        };
        
        if (isTeamLead) {
          if (roleLower.includes('designer')) {
            teamLeadBorderColor = '#8AD5E7'; // Designer lead - light blue
          } else if (isProductManager(roleLower)) {
            teamLeadBorderColor = '#E182B5'; // PM lead - pink
          } else if (roleLower.includes('engineer') || roleLower.includes('qa')) {
            teamLeadBorderColor = '#000000'; // Engineer lead - black
          }
        }

        return {
          id: member.id?.toString() || '',
          name: member.name || firstName,
          surname: surname,
          email: email,
          position: position,
          capacity: capacity,
          status: 'active' as const,
          productInProgress: productInProgress,
          vehicleInProgress: vehicleCount,
          relatedVehicles: [],
          facilitatorIn: [],
          efficiencyCharts: {
            speed: 75,
            efficiency: 80,
            quality: 85,
          },
          relatedProducts: [],
          image: '/Ellipse 5.svg',
          accuratePosition: member.role || userRole || 'Member', // Use member.role from backend which includes Team Lead
          isTeamLead: isTeamLead,
          teamLeadBorderColor: teamLeadBorderColor,
          shortName: shortName,
          color: '#33A1FD',
          isManager: false,
          password: '',
          timeZone: 'UTC+0', // Default since not in database
          phoneNumber: '+1-555-0000' // Default since not in database
        } as WorkerListProps;
      });
    
    // Sort: team leads first, then others (within each position group)
    return mapped.sort((a, b) => {
      // If same position, sort by team lead status
      if (a.position === b.position) {
        if (a.isTeamLead && !b.isTeamLead) return -1;
        if (!a.isTeamLead && b.isTeamLead) return 1;
      }
      return 0;
    });
  }, [data?.teamMembers]);
  
  // Sync workers data to store when it changes
  useEffect(() => {
    workersData.forEach((worker) => {
      updateUser(worker.id, {
        capacity: worker.capacity,
        vehicleInProgress: worker.vehicleInProgress,
        productInProgress: worker.productInProgress,
        name: worker.name,
        surname: worker.surname,
        email: worker.email,
        accuratePosition: worker.accuratePosition,
        shortName: worker.shortName
      });
    });
  }, [workersData, updateUser]);

  if (!data) {
    return (
      <div
        className="h-[85%] overflow-hidden min-w-[80%] max-w-[90%] border top-1/2 mt-[-20px] bg-[#EAEDF2] rounded-4xl flex justify-center items-center p-8 pb-14"
        style={{ boxShadow: '0px 2px 4px 0px #A7B1C499' }}
      >
        <Spinner size="lg" />
      </div>
    );
  }

  // Validate essential properties exist before accessing
  if (!data.id || !data.productId) {
    return (
      <div
        className="h-[85%] overflow-hidden min-w-[80%] max-w-[90%] border top-1/2 mt-[-20px] bg-[#EAEDF2] rounded-4xl flex justify-center items-center p-8 pb-14"
        style={{ boxShadow: '0px 2px 4px 0px #A7B1C499' }}
      >
        <div className="text-gray-500">Invalid vehicle data</div>
      </div>
    );
  }

  return (
    <div
      className="h-[85%] overflow-hidden min-w-[80%] max-w-[90%] border top-1/2 mt-[-20px] bg-[#EAEDF2] rounded-4xl flex justify-between p-8 pb-14  "
      style={{ boxShadow: '0px 2px 4px 0px #A7B1C499' }}
      onClick={(e) => {
        e.stopPropagation();
      }}
    >
      {isShowUserInfo && (
        <UserInfoFull
          setIsShowUserInfo={setIsShowUserInfo}
          userID={userID}
          vehicleData={data}
          isOpen={isShowUserInfo}
          workersData={workersData}
        />
      )}

      {!isShowUserInfo && (
        <>
          <div className="w-[49%] flex-col flex  min-h-[500px]">
            <div className="flex-grow">
              <VehicleInfo
                data={Object.entries(data.vehicleInfo || {
                  name: (data as any).name || 'Unknown',
                  owner: (data as any).product?.owner?.name || (data as any).createdBy?.toString() || 'Unknown',
                  dateCreated: (data as any).createdAt ? new Date((data as any).createdAt) : new Date(),
                  estimatedCompletion: (data as any).estimatedCompletion ? new Date((data as any).estimatedCompletion) : new Date(),
                  Description: (data as any).description || (data as any).shortDescription || 'No description',
                  type: (data as any).type || (data as any).vehicleType || 'Unknown',
                  vehicleType: (data as any).vehicleType || (data as any).type || 'Unknown'
                }).map(([key, value]) => ({
                  nameOfField: key || '',
                  valueOfField:
                    value instanceof Date ? value.toLocaleDateString() : (value ?? ''),
                }))}
              />
            </div>
            {/* Tech Stack Section */}
            {techStacksData && Array.isArray(techStacksData) && techStacksData.length > 0 && (
              <div className="mt-3 px-4 pb-3">
                <div className="text-sm font-semibold text-gray-700 mb-2">Tech Stack</div>
                <div className="flex flex-wrap gap-1.5">
                  {techStacksData.map((stack: any, idx: number) => (
                    <span
                      key={idx}
                      className="px-2.5 py-1 text-xs rounded-full bg-[#E8EDF4] text-[#4A5568] border border-[#CBD5E0]"
                    >
                      {stack.name || stack.tech_name || stack}
                    </span>
                  ))}
                </div>
              </div>
            )}
            <Facilitators
              facilitators={[]}
              vehicleID={data.id ? data.id.toString() : '0'}
            />
          </div>
          <div className="w-[49%] pr-2 flex flex-col gap-4 overflow-hidden">
            <div className='border border-[rgba(0,0,0,0.3)] rounded-[12px]'>
              <EfficiencyCard
                speed={
                  vehicleScoresData?.avg_speed ??
                  (vehicleScoresData as any)?.speed ??
                  memberScoresData?.speed ??
                  data.efficiencyCharts?.speed ??
                  (data as any).progress ??
                  0
                }
                efficiency={
                  vehicleScoresData?.avg_efficiency ??
                  (vehicleScoresData as any)?.efficiency ??
                  memberScoresData?.efficiency ??
                  data.efficiencyCharts?.efficiency ??
                  (data as any).progress ??
                  0
                }
                quality={
                  vehicleScoresData?.avg_quality ??
                  (vehicleScoresData as any)?.quality ??
                  memberScoresData?.quality ??
                  data.efficiencyCharts?.quality ??
                  (data as any).progress ??
                  0
                }
                minwidth="145px"
              />
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <VehicleMembers
                productID={data.productId ? data.productId.toString() : '0'}
                vehicleName={data.vehicleInfo?.name || (data as any).name || 'Unknown'}
                vehicleID={data.id ? data.id.toString() : '0'}
                workersData={workersData}
                setShowUserInfo={setIsShowUserInfo}
                setUserId={setUserID}
              />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
