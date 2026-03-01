import ConfirmBtn from '@/shared/ui/confirmBtn';
import Image from 'next/image';
import Facilitator from '@/entities/facilitator/Facilitator';
import ShadowWrapper from '../shared/ShadowWrapper';
import { useMemo, useState, useEffect } from 'react';
import AddFacilitatorModal from './AddFacilitatorModal';
import { useProductStore } from '@/entities/product';
import { fastApiService } from '@/lib/api/services/fastApiService';

const mockApprovers = [
  {
    id: 1,
    name: 'Anne D.',
    role: 'UX MANAGER',
    status: 'pending',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    initials: 'AS',
  },
  {
    id: 2,
    name: 'Bob A.',
    role: 'ENGINEERING MANAGER',
    status: 'approved',
    avatar:
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    initials: 'BA',
  },
];

interface VehicleSimulationTitleProps {
  vehicleData?: {
    name: string;
    description: string;
    owner: string;
    productName?: string;
    members?: any[];
    featureTags?: string;
    date?: Date;
    facilitators?: any[];
    id?: number;
  };
  impactAnalysisData?: any;
  onVehicleDataRefresh?: () => void;
}

const VehicleSimulationTitle = ({ vehicleData, impactAnalysisData, onVehicleDataRefresh }: VehicleSimulationTitleProps) => {
  const [isAddFacilitatorModalOpen, setIsAddFacilitatorModalOpen] = useState(false);
  const [leadMembers, setLeadMembers] = useState<any[]>([]);
  const [isLoadingLeadMembers, setIsLoadingLeadMembers] = useState(false);
  const { chosenProduct } = useProductStore();

  console.log('[VehicleSimulationTitle] Component rendered, vehicleData:', vehicleData);
  console.log('[VehicleSimulationTitle] vehicleData?.id:', vehicleData?.id);
  
  useEffect(() => {
    const fetchLeadMembers = async () => {
      const vehicleId = vehicleData?.id;
      console.log('[VehicleSimulationTitle] useEffect triggered, vehicleData:', vehicleData);
      console.log('[VehicleSimulationTitle] vehicleData?.id:', vehicleId);
      
      if (!vehicleId) {
        console.log('[VehicleSimulationTitle] No vehicle ID, clearing lead members');
        setLeadMembers([]);
        return;
    }
    
      console.log('[VehicleSimulationTitle] Fetching lead members for vehicle:', vehicleId);
      setIsLoadingLeadMembers(true);
      try {
        const response = await fastApiService.getVehicleLeadMembers(vehicleId);
        console.log('[VehicleSimulationTitle] Lead members from FastAPI:', response);
        console.log('[VehicleSimulationTitle] Response type:', typeof response);
        console.log('[VehicleSimulationTitle] Is array?', Array.isArray(response));
        
        if (Array.isArray(response)) {
          console.log('[VehicleSimulationTitle] Setting lead members, count:', response.length);
          setLeadMembers(response);
        } else {
          console.warn('[VehicleSimulationTitle] Response is not an array:', response);
          setLeadMembers([]);
        }
      } catch (error: any) {
        console.error('[VehicleSimulationTitle] Error fetching lead members:', error);
        console.error('[VehicleSimulationTitle] Error response:', error.response);
        console.error('[VehicleSimulationTitle] Error details:', error.response?.data || error.message);
        setLeadMembers([]);
      } finally {
        setIsLoadingLeadMembers(false);
      }
    };

    fetchLeadMembers();
  }, [vehicleData?.id]);

  // Check if all approvers (lead members) have approved
  const allApproversApproved = useMemo(() => {
    if (!leadMembers || leadMembers.length === 0) {
      console.log('[Facilitators] No lead members found');
      return false;
    }
    
    console.log('[Facilitators] Lead members:', leadMembers.map((m: any) => ({
      id: m.id,
      role: m.role,
      approval_status: m.approval_status
    })));
    
    // Check if all lead members have approved
    const allApproved = leadMembers.every((member: any) => {
      const approvalStatus = (member.approval_status || 'pending').toLowerCase();
      const isApproved = approvalStatus === 'approved';
      console.log(`[Facilitators] Lead member ${member.id}: ${approvalStatus} -> ${isApproved}`);
      return isApproved;
    });
    
    console.log('[Facilitators] All lead members approved?', allApproved);
    return allApproved;
  }, [leadMembers]);

  // Get facilitators list
  const facilitatorsList = useMemo(() => {
    console.log('[Facilitators] Raw facilitators data:', vehicleData?.facilitators);
    if (!vehicleData?.facilitators || vehicleData.facilitators.length === 0) {
      console.log('[Facilitators] No facilitators in data');
      return [];
    }
    
    const mapped = vehicleData.facilitators.map((facilitator: any) => ({
      id: facilitator.id?.toString() || '',
      name: facilitator.name || facilitator.user?.name || '',
      surname: '',
      accuratePosition: facilitator.role || facilitator.userRole || 'FACILITATOR',
      shortName: (facilitator.name || facilitator.user?.name || '').split(' ').map((n: string) => n[0]).join('.') || '',
      color: '#4E6DB3',
      isManager: false,
      email: facilitator.email || facilitator.user?.email || '',
      password: '',
      position: facilitator.role || facilitator.userRole || 'FACILITATOR',
      timeZone: 'UTC+0',
      phoneNumber: '',
      capacity: [],
      status: 'active',
      productInProgress: 0,
      vehicleInProgress: 0,
      relatedVehicles: [],
      facilitatorIn: [],
      efficiencyCharts: {
        speed: 75,
        efficiency: 80,
        quality: 85,
      },
      relatedProducts: [],
      image: facilitator.user?.avatar || facilitator.avatar || '/Ellipse 5.svg',
    }));
    console.log('[Facilitators] Mapped facilitators:', mapped);
    return mapped;
  }, [vehicleData?.facilitators]);
  return (
    <div>
      <h1 className="text-[20px] font-semibold">Impact simulation</h1>
      <h2 className="font-medium text-[16px]">{vehicleData?.name || 'Vehicle Title'}</h2>
      <div className="text-[10px] text-[#535354]">
        <div className="flex justify-between border-0 mt-3 border-b-gray-300 border-b">
          <div className="w-[120px]">Product:</div>
          <div className="w-[140px]">{vehicleData?.productName || 'Product title'}</div>
        </div>
        <div className="flex justify-between border-0 mt-3 border-b-gray-300 border-b">
          <div className="w-[120px]">Owner:</div>
          <div className="w-[140px]">{vehicleData?.owner || 'John D.'}</div>
        </div>
        <div className="flex justify-between border-0 mt-3 border-b-gray-300 border-b">
          <div className="w-[120px]">Description</div>
          <div className="w-[140px]">
            {vehicleData?.description || 'Universal Search with content and view filters for search results.'}
          </div>
        </div>
      </div>

      <div className="flex justify-between border-gray-500 border p-3 mt-6 rounded-[12px]">
        <div className="mt-1 w-[75%]">
          <div className="text-[14px] font-semibold">Vehicle impact</div>
          <div className="mt-1 w-[95%] text-[11px] max-h-[160px] overflow-y-auto pr-2">
            {impactAnalysisData?.simulation_document_text || 
             'AI generated simulation document which details out the impact of the vehicle on the business'}
          </div>
        </div>
        <div className="w-[35%] text-[12px] flex items-center mt-1">
          <ConfirmBtn text="View" className="p-1.5" />
        </div>
      </div>

      <div className="mt-6 flex gap-6">
        {/* Approvers Section */}
        <div className="flex-1">
        <div className="text-[14px] font-semibold mb-4 text-gray-800">
          Approvers
        </div>
        <div className="flex gap-4">
          {(leadMembers && leadMembers.length > 0
              ? leadMembers
                  .slice(0, 2)
                  .map((leadMember, index) => {
                  const role = leadMember.role || 'MANAGER';
                  const approvalStatus = (leadMember.approval_status || 'pending').toLowerCase();
                  
                  // Try to find user details from vehicleData.members by matching user_id
                  const userDetails = vehicleData?.members?.find((m: any) => {
                    const memberUserId = m.user?.id || m.userId;
                    return memberUserId === leadMember.user_id;
                  });
                  
                  const userName = userDetails?.user?.name || userDetails?.name || leadMember.user?.name || `Lead ${index + 1}`;
                  const userAvatar = userDetails?.user?.avatar || userDetails?.avatar || userDetails?.image || leadMember.user?.avatar || leadMember.user?.image || '/Ellipse 5.svg';
                  
                  return {
                    id: leadMember.id || leadMember.user_id || index,
                    name: userName,
                    role: role,
                    status: approvalStatus,
                    avatar: userAvatar,
                    initials: userName ? userName.split(' ').map((n: string) => n[0]).join('').toUpperCase() : 'L'
                  };
                })
            : mockApprovers
          ).map((approver) => (
            <div key={approver.id} className="w-30 flex-shrink-0">
              <div
                className="relative flex flex-col justify-center bg-[#EAEDF2] w-[120px] h-[144px] py-4 px-0 rounded-xl"
                style={{
                  boxShadow:
                    '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)',
                }}
              >
                <div className="absolute top-2 right-2 w-2 h-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="8"
                    height="8"
                    viewBox="0 0 8 8"
                    fill="none"
                    className="w-full h-full"
                  >
                    <circle
                      cx="4"
                      cy="4"
                      r="3"
                      fill={
                        approver.status === 'approved' ? 'black' : '#8AD5E7'
                      }
                    />
                  </svg>
                </div>

                <div className="flex justify-center mb-2">
                  <div className="relative w-20 h-20">
                    <div
                      className="w-20 h-20 rounded-full border-8 flex items-center justify-center overflow-hidden"
                      style={{
                        borderColor:
                          approver.status === 'approved' ? 'black' : '#8AD5E7',
                      }}
                    >
                      <img
                        src={approver.avatar && approver.avatar.trim() !== '' ? approver.avatar : '/icons/user-mock-icon.svg'}
                        alt={approver.name}
                        className="w-[calc(100%+8px)] h-[calc(100%+8px)] object-cover rounded-full -m-1"
                        style={{ display: 'block' }}
                        onLoad={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'block';
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'none';
                        }}
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.style.display = 'none';
                          const fallback =
                            target.nextElementSibling as HTMLElement;
                          if (fallback) fallback.style.display = 'flex';
                        }}
                      />
                      <div
                        className="absolute inset-0 w-full h-full bg-gray-600 rounded-full flex items-center justify-center text-white font-medium text-sm"
                        style={{ display: 'none' }}
                      >
                        {approver.initials}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-center space-y-1 px-2">
                  <div className="w-full text-center font-inter text-[9px] font-medium leading-[120%] uppercase text-[#535354] min-h-[13px] mt-2 max-w-[104px] mx-auto break-words overflow-hidden">
                    {approver.role}
                  </div>
                  <div className="text-center font-inter text-[12px] font-medium leading-[120%] text-[#535354] min-h-[13px] max-w-[104px] mx-auto overflow-hidden">
                    {approver.name}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-center gap-1 mt-3 h-6">
                <div className="w-3 h-3 flex items-center justify-center">
                  {approver.status === 'approved' ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="none"
                      className="w-full h-full"
                    >
                      <path
                        d="M5.5 11C8.53494 11 11 8.53494 11 5.5C11 2.46506 8.53494 0 5.5 0C2.46506 0 0 2.46506 0 5.5C0 8.53494 2.46506 11 5.5 11ZM3.10618 4.70168L4.64501 6.2405L7.63724 3.24826L8.49221 4.10323L4.64501 7.95043L2.26533 5.55673L3.10618 4.70168Z"
                        fill="#64D394"
                      />
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="11"
                      height="11"
                      viewBox="0 0 11 11"
                      fill="none"
                      className="w-full h-full"
                    >
                      <circle
                        cx="5.5"
                        cy="5.5"
                        r="5"
                        fill="white"
                        stroke="#D9D9D9"
                      />
                    </svg>
                  )}
                </div>
                <span className="text-[11px] font-normal leading-normal text-[#535354] font-arial">
                  {approver.status === 'approved' ? 'Approved' : 'Pending'}
                </span>
              </div>
            </div>
          ))}
        </div>
        </div>

        {/* Facilitators Section - Show only when all approvers have approved */}
        {allApproversApproved && (
          <div 
            className="flex-1"
            style={{
              width: '155px',
              height: '195px',
              borderRadius: '12px',
              border: '1px solid #9FA8B5',
              padding: '12px',
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            <div className="flex items-center">
              <span className="text-[14px] font-semibold text-gray-800">Facilitators</span>
              <Image
                className="ml-1"
                src="/icons/tip-icon.svg"
                alt="tip"
                width={15}
                height={15}
              />
            </div>
            <div className="mt-3 flex gap-x-10 w-full flex-wrap">
              {facilitatorsList.length > 0 ? (
                facilitatorsList.slice(0, 3).map((facilitator) => (
                  <Facilitator
                    key={facilitator.id}
                    {...facilitator}
                  />
                ))
              ) : (
                // Show + sign in circular box when no facilitators
                <div 
                  className="text-center w-[90px] h-[90px] cursor-pointer"
                  onClick={() => setIsAddFacilitatorModalOpen(true)}
                >
                  <div className="flex items-center justify-center" style={{height: '100%', width: '100%'}} >
                    <ShadowWrapper>
                      <Image
                        src="/icons/Add.svg"
                        alt="add new facilitator"
                        width={25}
                        height={25}
                      />
                    </ShadowWrapper>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Add Facilitator Modal */}
      {vehicleData?.id && chosenProduct?.id && (
        <AddFacilitatorModal
          isOpen={isAddFacilitatorModalOpen}
          onClose={() => setIsAddFacilitatorModalOpen(false)}
          vehicleId={vehicleData.id}
          productId={chosenProduct.id}
          vehicleName={vehicleData.name || 'Vehicle'}
          onFacilitatorAdded={onVehicleDataRefresh}
        />
      )}
    </div>
  );
};

export default VehicleSimulationTitle;
