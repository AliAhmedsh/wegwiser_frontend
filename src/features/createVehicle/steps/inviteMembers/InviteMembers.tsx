'use client';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { useProductStore } from '@/entities/product/store';
import useUserStore from '@/entities/worker/api/mock/userStore';
import { WorkerListProps } from '@/entities/worker/type';
import { useAddTeamMemberMutation, useAddTeamMembersBatchMutation, useRemoveTeamMemberMutation, useTeamMembersForInvitation, useVehicleMemberSkillMatch } from '@/lib/api/hooks/useVehicle';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import PeopleCard from '@/shared/ui/peopleCard';
import { Poppins, Open_Sans } from 'next/font/google';
import Image from 'next/image';
import { useEffect, useMemo, useState, useRef } from 'react';
import { useCreationVehicleStore } from '../../store';
import NavButtons from '../../ui/navButtons';
import { BLOCK_HEIGHT_VH, BLOCK_WIDTH_WV } from '../constants';
import UserDetailModal from '@/entities/vehicle/components/userInfoFull/UserDetailModal';

const poppins600 = Poppins({
  weight: ['600'],
  subsets: ['latin'],
});

const openSans400 = Open_Sans({
  weight: ['400'],
  subsets: ['latin'],
});

// Added Member Card Component
const AddedMemberCard: React.FC<{
  member: WorkerListProps;
  isFirst: boolean;
  borderColor: string;
  onRemove: () => void;
  onDoubleClick: () => void;
  onAssignTeamLead: () => void;
  isTeamLead: boolean;
}> = ({ member, isFirst, borderColor, onRemove, onDoubleClick, onAssignTeamLead, isTeamLead }) => {
  const imageSrc = member.image && member.image.trim() !== '' ? member.image : '/Ellipse 5.svg';
  const role = member.position || member.accuratePosition || 'Member';
  
  return (
    <div
      className="relative bg-[#F5F5F5] rounded-xl p-3 cursor-pointer hover:bg-[#EEEEEE] transition-colors"
      style={{
        border: isFirst ? `2px solid ${borderColor}` : 'none',
      }}
      onDoubleClick={onDoubleClick}
    >
      {/* Minus Icon */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="absolute top-2 right-2 w-6 h-6 rounded-full bg-white flex items-center justify-center hover:bg-gray-100 transition-colors"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M2 6H10" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round"/>
        </svg>
      </button>

      {/* Profile Picture */}
      <div className="flex justify-center mb-2">
        <div
          className="w-12 h-12 rounded-full overflow-hidden"
          style={{
            border: isFirst ? `2px solid ${borderColor}` : 'none',
          }}
        >
          <Image src={imageSrc} width={48} height={48} alt={member.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Name */}
      <div className="text-center mb-1">
        <div className="font-semibold text-sm text-[#181818]">{member.name}</div>
      </div>

      {/* Role */}
      <div className="text-center mb-2">
        <div className="text-xs text-gray-600">{role}</div>
      </div>

      {/* Un-assign button (only for first card if not team lead) */}
      {isFirst && !isTeamLead && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="w-full bg-[#4A4A4A] text-white text-xs py-1.5 rounded-lg mb-2 hover:bg-[#3A3A3A] transition-colors"
        >
          Un-assign
        </button>
      )}

      {/* Green Status Bar */}
      <div className="absolute bottom-2 right-2">
        <div className="w-8 h-1.5 bg-green-500 rounded-full"></div>
      </div>
    </div>
  );
};


export default function InviteMembers() {
  const { users } = useUserStore();
  const [allUsers, setAllUsers] = useState<WorkerListProps[]>([]);
  const [addedMembers, setAddedMembers] = useState<WorkerListProps[]>([]);
  const [suggestedMembers, setSuggestedMembers] = useState<WorkerListProps[]>([]);
  const { setMembers, vehicleMembers, vehicleId } = useCreationVehicleStore();
  const { getUsersByProductID } = useUserStore();
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [name, setName] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const { chosenProduct } = useProductStore();
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  // Get the actual vehicle_id from step3-finalize (stored in localStorage)
  const step3VehicleId = useMemo(() => {
    const storedId = localStorage.getItem('step3_vehicle_id');
    if (storedId) {
      const parsedId = parseInt(storedId, 10);
      if (!isNaN(parsedId)) {
        return parsedId;
      }
    }
    return vehicleId || undefined;
  }, [vehicleId]);

  const { data: teamMembersData, isLoading, error } = useTeamMembersForInvitation(
    step3VehicleId || vehicleId || 0, 
    searchTerm,
    chosenProduct?.id 
  );
  
  const { data: skillMatchData, isLoading: isLoadingSuggestions } = useVehicleMemberSkillMatch(
    step3VehicleId,
    'desc'
  );
  
  const addTeamMemberMutation = useAddTeamMemberMutation();
  const addTeamMembersBatchMutation = useAddTeamMembersBatchMutation();
  const removeTeamMemberMutation = useRemoveTeamMemberMutation();

  const handleUserDoubleClick = (userId: string) => {
    setSelectedUserId(userId);
    setIsUserDetailOpen(true);
  };

  const getDisplayRole = (member: WorkerListProps): string => {
    const baseRole = member.position || member.accuratePosition || 'Member';
    if (member.isTeamLead) {
      if (baseRole.toLowerCase().includes('engineer') || baseRole.toLowerCase().includes('qa')) {
        return 'Engineer Team Lead';
      } else if (baseRole.toLowerCase().includes('designer') || baseRole.toLowerCase().includes('ui/ux')) {
        return 'Designer Team Lead';
      } else if (baseRole.toLowerCase().includes('pm') || baseRole.toLowerCase().includes('product')) {
        return 'PM Team Lead';
      }
      return `${baseRole} Team Lead`;
    }
    return baseRole;
  };

  const handleCardClick = (e: React.MouseEvent, userId: string) => {
    e.preventDefault();
    e.stopPropagation();
    // Toggle selection
    if (selectedMemberId === userId) {
      setSelectedMemberId(null);
    } else {
      setSelectedMemberId(userId);
    }
  };

  const getTeamLeadBorderColor = (role: string): string | undefined => {
    const roleLower = (role || '').toLowerCase();
    const isProductManager = (r: string) => {
      const roleStr = r.toLowerCase();
      return roleStr.includes('product_manager') || 
             roleStr.includes('product manager') || 
             roleStr.includes('pm') || 
             (roleStr.includes('product') && roleStr.includes('manager'));
    };
    
    if (roleLower.includes('designer') || roleLower.includes('ui/ux')) {
      return '#8AD5E7';
    } else if (isProductManager(roleLower)) {
      return '#E182B5'; 
    } else if (roleLower.includes('engineer') || roleLower.includes('qa')) {
      return '#000000'; 
    }
    return undefined;
  };

  const handleAssignAsTeamLead = () => {
    if (!selectedMemberId) return;
    
    const userId = selectedMemberId;
    const updateMember = (member: WorkerListProps) => {
      if (member.id === userId) {
        const role = member.accuratePosition || member.position || 'Member';
        return { 
          ...member, 
          isTeamLead: true,
          teamLeadBorderColor: getTeamLeadBorderColor(role)
        };
      }
      return member;
    };

    setAddedMembers((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.map(updateMember);
    });
    setMembers((prev) => {
      if (!Array.isArray(prev)) return [];
      return prev.map(updateMember);
    });
    setSelectedMemberId(null);
  };



  useEffect(() => {
    if (teamMembersData?.success && teamMembersData?.data) {
      const { suggested, all, added } = teamMembersData.data;

      const formatRole = (role: string): string => {
        switch (role?.toLowerCase()) {
          case 'product_manager':
            return 'PM';
          case 'engineer':
            return 'Engineer';
          case 'designer':
            return 'Designer';
          case 'qa':
            return 'QA';
          case 'engineer/qa':
            return 'Engineer/QA';
          default:
            return role || 'Member';
        }
      };

      const convertToWorkerListProps = (apiUsers: any[]): WorkerListProps[] => {
        return apiUsers.map(user => {
          const vehicleCount = user.vehicleCount || 0;
          const filledLevels = user.filledLevels !== undefined ? user.filledLevels : Math.min(vehicleCount, 5);
              
          const capacity = Array.from({ length: filledLevels }, (_, i) => ({
            id: `vehicle-${i}`,
            vehicleName: `Vehicle ${i + 1}`
          }));

          const roleLower = (user.role || '').toLowerCase();
          const isTeamLead = roleLower.includes('team lead');
          const role = formatRole(user.role) || 'Member';

          return {
          id: user.id.toString(),
          name: user.name || 'Unknown',
          surname: user.surname || 'User',
          accuratePosition: role,
          shortName: user.name ? user.name.split(' ').map((n: string) => n[0]).join('.') : 'U.U',
          color: '#33A1FD',
          isManager: false,
          email: user.email || 'unknown@example.com',
          password: '', 
          position: role,
          timeZone: 'UTC+0',
          phoneNumber: user.phoneNumber || '+1-555-0000',
            capacity: capacity,
          status: 'active',
          productInProgress: 0,
            vehicleInProgress: vehicleCount,
          relatedVehicles: [],
          facilitatorIn: [],
          efficiencyCharts: {
            speed: 75,
            efficiency: 80,
            quality: 85,
          },
          relatedProducts: chosenProduct ? [chosenProduct.id.toString()] : [],
          image: user.avatar || '/Ellipse 5.svg',
          isTeamLead: isTeamLead,
          teamLeadBorderColor: isTeamLead ? getTeamLeadBorderColor(roleLower) : undefined
          };
        });
      };

      setAllUsers(convertToWorkerListProps(all));

      setAddedMembers(convertToWorkerListProps(added));

      setSuggestedMembers(convertToWorkerListProps(suggested));
      
      console.log('Team Members API Response:', {
        productId: chosenProduct?.id,
        vehicleId: vehicleId || 'none',
        availableUsers: all.length,
        suggestedUsers: suggested.length,
        addedMembers: added.length,
        searchTerm: searchTerm || 'none'
      });
    }
  }, [teamMembersData, vehicleId, chosenProduct, searchTerm]);

  const suggestedMembersFromSkillMatch = useMemo(() => {
    // If no skill match data or no vehicle ID, return empty
    if (!skillMatchData?.members || !Array.isArray(skillMatchData.members) || !step3VehicleId) {
      return { pm: [], engineerQA: [], designer: [] };
    }

    // Get member IDs from skill match API
    const skillMatchMemberIds = skillMatchData.members.map((m: any) => m.member_id.toString());
    
    // Find matching members from allUsers (which comes from Node.js API)
    const matchedMembers = allUsers.filter(user => skillMatchMemberIds.includes(user.id));

    // Group by role
    const formatRole = (role: string): string => {
      switch (role?.toLowerCase()) {
        case 'product_manager':
          return 'PM';
        case 'engineer':
          return 'Engineer';
        case 'designer':
          return 'Designer';
        case 'qa':
          return 'QA';
        case 'engineer/qa':
          return 'Engineer/QA';
        default:
          return role || 'Member';
      }
    };

    const pm = matchedMembers.filter(user => {
      const role = (user.position || user.accuratePosition || '').toLowerCase().trim();
      return role === 'pm' || role === 'product_manager' || role === 'product manager';
    });

    const engineerQA = matchedMembers.filter(user => {
      const role = (user.position || user.accuratePosition || '').toLowerCase().trim();
      if (role === 'pm' || role === 'product_manager' || role === 'product manager' || role === 'designer') {
        return false;
      }
      return role.includes('engineer') || role.includes('qa') || role === 'engineer/qa' || role === 'engineer / qa';
    });

    const designer = matchedMembers.filter(user => {
      const role = (user.position || user.accuratePosition || '').toLowerCase().trim();
      return role === 'designer';
    });

    return {
      pm: pm.slice(0, 3), // Limit to top 3
      engineerQA: engineerQA.slice(0, 3),
      designer: designer.slice(0, 3)
    };
  }, [skillMatchData, allUsers, step3VehicleId]);

  const suggestedByRoleFromOriginal = useMemo(() => {
    const pm = suggestedMembers.filter(user => {
      const role = (user.position || user.accuratePosition || '').toLowerCase().trim();
      return role === 'pm' || role === 'product_manager' || role === 'product manager';
    });

    const engineerQA = suggestedMembers.filter(user => {
      const role = (user.position || user.accuratePosition || '').toLowerCase().trim();    
      if (role === 'pm' || role === 'product_manager' || role === 'product manager' || role === 'designer') {
        return false;
      }
      return role.includes('engineer') || role.includes('qa') || role === 'engineer/qa' || role === 'engineer / qa';
    });

    const designer = suggestedMembers.filter(user => {
      const role = (user.position || user.accuratePosition || '').toLowerCase().trim();
      return role === 'designer';
    });

    return { pm, engineerQA, designer };
  }, [suggestedMembers]);

  const suggestedByRole = useMemo(() => {  
    return suggestedMembersFromSkillMatch;
  }, [suggestedMembersFromSkillMatch]);

  const onAddMember = (user: WorkerListProps) => {
    if (user.capacity.length === 5) {
      setName(user.name);
      setIsOpen(true);
      return;
    }
  
    setAllUsers((prev) => prev.filter((u) => u.id !== user.id));
    setSuggestedMembers((prev) => prev.filter((u) => u.id !== user.id));
    const newUsers = [...addedMembers, user];
    setMembers(newUsers);
    setAddedMembers(newUsers);
  };

  const handleContinue = async () => {
    const { incrementStep } = useCreationVehicleStore.getState();   
    if (!vehicleId) {
      incrementStep();
      return;
    }

    if (addedMembers.length === 0) {
      incrementStep();
      return;
    }

    setIsSubmitting(true);  
    try {
      const members = addedMembers.map(member => {
        let actualRole = member.accuratePosition || member.position || 'ENGINEER/QA';
        
        if (member.isTeamLead) {
          const roleLower = actualRole.toLowerCase();
          if (roleLower.includes('engineer') || roleLower.includes('qa')) {
            actualRole = 'Engineer Team Lead';
          } else if (roleLower.includes('designer') || roleLower.includes('ui/ux')) {
            actualRole = 'Designer Team Lead';
          } else if (roleLower.includes('pm') || roleLower.includes('product')) {
            actualRole = 'PM Team Lead';
          } else {
            actualRole = `${actualRole} Team Lead`;
          }
        }
        
        return {
          userId: parseInt(member.id),
          role: actualRole
        };
      });

      await addTeamMembersBatchMutation.mutateAsync({
        vehicleId,
        members
      });    
      incrementStep();
    } catch (error) {
      console.error('Failed to add team members:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const onRemove = async (user: WorkerListProps) => {
    if (!vehicleId) {

      setAddedMembers((prev) => prev.filter((u) => u.id !== user.id));
      const newUsers = [...allUsers, user];
      setAllUsers(newUsers);
      setSuggestedMembers((prev) => [...prev, user]);
      setMembers(addedMembers.filter((u) => u.id !== user.id));
      return;
    }

    try {
      await removeTeamMemberMutation.mutateAsync({
        vehicleId,
        memberId: parseInt(user.id)
      });

    } catch (error) {

    }
  };

  const hasTeamLead = useMemo(() => {
    return addedMembers.some(member => member.isTeamLead === true);
  }, [addedMembers]);

  return (
    <div className="bg-[#EAEDF2] h-[92vh] font-poppins text-[14px]">
      <Dialog open={isOpen} onOpenChange={() => setIsOpen((prev) => !prev)}>
          <DialogContent className="max-w-1/3">
            <DialogTitle className="text-center text-[24px]">
              Attention
            </DialogTitle>
            <div className="w-[70%] text-center mx-auto mt-5">
              ({name}) seems to be at full capacity. Would you like me to see if
              their current involvements can be altered and send a conditional
              invite?
            </div>
            <div className="flex justify-between mt-5">
              <div className="w-1/3">
                <ConfirmBtn text="No" onClick={() => setIsOpen(false)} />
              </div>
              <div className="w-1/3">
                <ConfirmBtn text="Yes" onClick={() => setIsOpen(false)} />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      <div className="flex justify-center">
        <Image
          alt="step visualisation"
          src="/creation-vehicle-steps/fourth-step.svg"
          width={420}
          height={25}
        />
      </div>

      <div className="flex px-13 justify-center h-[calc(92vh-40px)]">
        <div
          className="bg-white rounded-4xl mt-5 flex flex-col overflow-hidden"
          style={{
            boxShadow: '2px 2px 2px 0px #A7B1C499',
            height: BLOCK_HEIGHT_VH,
            width: BLOCK_WIDTH_WV,
          }}
        >
          <div className="flex-1 w-full flex flex-col gap-4 overflow-auto px-10 py-6">
            <div className="flex flex-1 gap-4 min-h-0">
              {/* Left Panel - Invite Team Members */}
              <div className="flex flex-col flex-1 min-h-0">
                <div className={`font-semibold mb-2 text-[20px] ${poppins600.className}`}>
                  Invite Team Members
                </div>
                <input
                  type="text"
                  placeholder="Search here"
                  className="gradient-input w-full mb-4"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                
                {/* Added Members Heading and Assign team lead button */}
                <div className="flex justify-between items-center mb-3">
                  <div className={`font-semibold text-[20px] ${poppins600.className}`}>
                    Added Members
                  </div>
                  <button
                    onClick={handleAssignAsTeamLead}
                    disabled={!selectedMemberId}
                    className={`text-white text-center ${openSans400.className} ${
                      !selectedMemberId ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
                    }`}
                    style={{
                      borderRadius: '4px',
                      background: '#627899',
                      fontSize: '12px',
                      fontWeight: 400,
                      lineHeight: 'normal',
                      padding: '8px 16px',
                    }}
                  >
                    Assign team lead
                  </button>
                </div>

                {/* Added Members Section - 3 Columns */}
                <div className="flex-1 bg-white rounded-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ maxHeight: 'calc(100% - 10px)' }}>
                  <div className="flex-1 overflow-y-auto p-4">
                    {isLoading ? (
                      <div className="flex items-center justify-center h-full text-gray-500">
                        <div>Loading...</div>
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 gap-x-12 h-full relative">
                        {/* Product Column */}
                        <div className="flex flex-col">
                          <div className={`flex justify-between items-center font-semibold mb-3 ${poppins600.className}`}>
                            <span>Product</span>
                            {addedMembers.length > 0 && (
                              <span>{addedMembers.filter(m => {
                                const role = (m.position || m.accuratePosition || '').toLowerCase();
                                return role.includes('pm') || role.includes('product');
                              }).length}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                            {addedMembers.length === 0 ? null : (
                              <>
                                {addedMembers
                                  .filter(m => {
                                    const role = (m.position || m.accuratePosition || '').toLowerCase();
                                    return role.includes('pm') || role.includes('product');
                                  })
                                  .map((u, index) => {
                                const handleDoubleClick = (e?: React.MouseEvent) => {
                                  if (e) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }
                                  handleUserDoubleClick(u.id);
                                };
                                
                                return (
                                  <span 
                                    key={u.id}
                                    onDoubleClick={handleDoubleClick}
                                    onClick={(e) => handleCardClick(e, u.id)}
                                    className="relative"
                                  >
                                    <PeopleCard
                                      filledLevels={u.capacity.length}
                                      imageLink={u.image}
                                      role={getDisplayRole(u)}
                                      isChosen={selectedMemberId === u.id}
                                      onDoubleClick={handleDoubleClick}
                                      {...u}
                                    />
                                  </span>
                                );
                              })}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Design Column */}
                        <div className="flex flex-col">
                          <div className={`flex justify-between items-center font-semibold mb-3 ${poppins600.className}`}>
                            <span>Design</span>
                            {addedMembers.length > 0 && (
                              <span>{addedMembers.filter(m => {
                                const role = (m.position || m.accuratePosition || '').toLowerCase();
                                return role.includes('design');
                              }).length}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                            {addedMembers.length === 0 ? null : (
                              <>
                                {addedMembers
                                  .filter(m => {
                                    const role = (m.position || m.accuratePosition || '').toLowerCase();
                                    return role.includes('design');
                                  })
                                  .map((u, index) => {
                                const handleDoubleClick = (e?: React.MouseEvent) => {
                                  if (e) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                  }
                                  handleUserDoubleClick(u.id);
                                };
                                
                                return (
                                  <span 
                                    key={u.id}
                                    onDoubleClick={handleDoubleClick}
                                    onClick={(e) => handleCardClick(e, u.id)}
                                    className="relative"
                                  >
                                    <PeopleCard
                                      filledLevels={u.capacity.length}
                                      imageLink={u.image}
                                      role={getDisplayRole(u)}
                                      isChosen={selectedMemberId === u.id}
                                      onDoubleClick={handleDoubleClick}
                                      {...u}
                                    />
                                  </span>
                                );
                              })}
                              </>
                            )}
                          </div>
                        </div>

                        {/* Engineering Column */}
                        <div className="flex flex-col">
                          <div className={`flex justify-between items-center font-semibold mb-3 ${poppins600.className}`}>
                            <span>Engineering</span>
                            {addedMembers.length > 0 && (
                              <span>{addedMembers.filter(m => {
                                const role = (m.position || m.accuratePosition || '').toLowerCase();
                                return role.includes('engineer') || role.includes('qa') || (!role.includes('pm') && !role.includes('product') && !role.includes('design'));
                              }).length}</span>
                            )}
                          </div>
                          <div className="flex flex-col gap-3 flex-1 overflow-y-auto">
                            {addedMembers.length === 0 ? null : (
                              <>
                                {addedMembers
                                  .filter(m => {
                                    const role = (m.position || m.accuratePosition || '').toLowerCase();
                                    return role.includes('engineer') || role.includes('qa') || (!role.includes('pm') && !role.includes('product') && !role.includes('design'));
                                  })
                                  .map((u, index) => {
                                    const handleDoubleClick = (e?: React.MouseEvent) => {
                                      if (e) {
                                        e.stopPropagation();
                                        e.preventDefault();
                                      }
                                      handleUserDoubleClick(u.id);
                                    };
                                    
                                    return (
                                      <span 
                                        key={u.id}
                                        onDoubleClick={handleDoubleClick}
                                        onClick={(e) => handleCardClick(e, u.id)}
                                        className="relative"
                                      >
                                        <PeopleCard
                                          filledLevels={u.capacity.length}
                                          imageLink={u.image}
                                          role={getDisplayRole(u)}
                                          isChosen={selectedMemberId === u.id}
                                          onDoubleClick={handleDoubleClick}
                                          {...u}
                                        />
                                      </span>
                                    );
                                  })}
                              </>
                            )}
                          </div>
                        </div>
                        
                        {/* Centered Add Members Box - Shows when no members */}
                        {addedMembers.length === 0 && (
                          <div className="col-span-3 flex items-center justify-center absolute inset-0">
                            <div 
                              className="bg-white text-center"
                              style={{
                                display: 'flex',
                                width: '303px',
                                height: '140px',
                                padding: '24px 24px 16px 24px',
                                flexDirection: 'column',
                                alignItems: 'center',
                                gap: '24px',
                                borderRadius: '12px',
                                border: '1px solid rgba(83, 83, 84, 0.20)',
                                background: '#FFF',
                                boxShadow: '0 0 4px 0 rgba(0, 0, 0, 0.15)',
                              }}
                            >
                              <div 
                                className={poppins600.className}
                                style={{
                                  color: 'var(--Black, #151619)',
                                  textAlign: 'center',
                                  fontFamily: 'Poppins',
                                  fontSize: '16px',
                                  fontStyle: 'normal',
                                  fontWeight: 600,
                                  lineHeight: '140%',
                                }}
                              >
                                Add Members
                              </div>
                              <div 
                                style={{
                                  color: '#000',
                                  textAlign: 'center',
                                  fontFamily: '"Open Sans"',
                                  fontSize: '12px',
                                  fontStyle: 'normal',
                                  fontWeight: 400,
                                  lineHeight: 'normal',
                                }}
                              >
                                Add team members who will directly work on the deliverables related to this vehicle
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right Panel - Suggested Members and All Members */}
              <div className="flex flex-col min-h-0 gap-4" style={{ width: '228px' }}>
                {/* Suggested Members Section */}
                <div className="flex flex-col">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`font-semibold ${poppins600.className}`}>
                      Suggested Members
                    </div>
                  </div>
                  <div
                    style={{ boxShadow: `0 0 4px 0 rgba(0, 0, 0, 0.15) inset` }}
                    className="bg-white w-full flex flex-col rounded-2xl px-4 py-4 h-[200px] overflow-y-auto"
                  >
                    {isLoadingSuggestions ? (
                      <div className="text-center text-gray-500">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <div>Loading suggestions...</div>
                        </div>
                      </div>
                    ) : !step3VehicleId ? (
                      <div className="text-center text-gray-500">
                        <div>Create vehicle first to see skill-based suggestions</div>
                      </div>
                    ) : (suggestedByRole.pm.length === 0 && suggestedByRole.engineerQA.length === 0 && suggestedByRole.designer.length === 0) ? (
                      <div className="text-center text-gray-500">
                        <div>No suggested members available</div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {[...suggestedByRole.pm, ...suggestedByRole.engineerQA, ...suggestedByRole.designer].map((u) => {
                          const isAdded = addedMembers.some(m => m.id === u.id);
                          return (
                            <span key={u.id} onClick={() => onAddMember(u)}>
                              <PeopleCard
                                filledLevels={u.capacity.length}
                                imageLink={u.image}
                                role={u.position}
                                isChosen={isAdded}
                                isPlusIcon={true}
                                onDoubleClick={() => handleUserDoubleClick(u.id)}
                                {...u}
                              />
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* All Members Section */}
                <div className="flex flex-col flex-1 min-h-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`font-semibold ${poppins600.className}`}>
                      All
                    </div>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" className="cursor-pointer">
                      <path d="M1 3H15M4 8H12M6 13H10" stroke="#4A4A4A" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  </div>
                  <div
                    style={{ boxShadow: `0 0 4px 0 rgba(0, 0, 0, 0.15) inset` }}
                    className="bg-white w-full flex flex-col flex-grow rounded-2xl px-4 py-4 min-h-[150px] overflow-y-auto"
                  >
                    {isLoading ? (
                      <div className="text-center text-gray-500">
                        <div className="flex flex-col items-center space-y-2">
                          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
                          <div>{vehicleId ? 'Loading team members...' : 'Loading product members...'}</div>
                        </div>
                      </div>
                    ) : error ? (
                      <div className="text-center text-red-500">
                        <div>Error loading team members</div>
                        <div className="text-sm mt-1">{error.message}</div>
                        <button
                          onClick={() => window.location.reload()}
                          className="text-blue-500 hover:text-blue-700 underline text-sm mt-2"
                        >
                          Try again
                        </button>
                      </div>
                    ) : !chosenProduct ? (
                      <div className="text-center text-gray-500">
                        <div>Please select a product first</div>
                      </div>
                    ) : allUsers.length === 0 ? (
                      <div className="text-center text-gray-500">
                        <div>No team members available</div>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-3">
                        {allUsers.map((u, index) => {
                          const isAdded = addedMembers.some(m => m.id === u.id);
                          return (
                            <span key={u.id} onClick={() => onAddMember(u)}>
                              <PeopleCard
                                filledLevels={u.capacity.length}
                                imageLink={u.image}
                                role={u.position}
                                isChosen={isAdded}
                                isPlusIcon={true}
                                onDoubleClick={() => handleUserDoubleClick(u.id)}
                                {...u}
                              />
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="px-10 pb-10 w-full relative">
            <div className="absolute bottom-3 right-10">
              <button
                onClick={handleContinue}
                disabled={!hasTeamLead || isSubmitting}
                className={`flex items-center justify-center transition-colors ${poppins600.className} ${
                  !hasTeamLead || isSubmitting
                    ? 'cursor-not-allowed'
                    : 'cursor-pointer'
                }`}
                style={{
                  width: '280px',
                  height: '45px',
                  padding: '12px 93px',
                  gap: '10px',
                  borderRadius: '12px',
                  background: (!hasTeamLead || isSubmitting) ? '#EAEDF2' : '#EAEDF2',
                  boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)',
                  color: !hasTeamLead || isSubmitting ? '#535354' : '#4A4A4A',
                  fontSize: !hasTeamLead || isSubmitting ? '13.284px' : undefined,
                  fontWeight: !hasTeamLead || isSubmitting ? 600 : undefined,
                  lineHeight: !hasTeamLead || isSubmitting ? '19.927px' : undefined,
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isSubmitting ? "Adding members..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      </div>
      
      {selectedUserId && (
        <UserDetailModal
          userID={selectedUserId}
          vehicleID={vehicleId}
          isOpen={isUserDetailOpen}
          onClose={() => {
            setIsUserDetailOpen(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
}
