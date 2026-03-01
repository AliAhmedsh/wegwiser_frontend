'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { XIcon } from 'lucide-react';

import { cn } from '@/lib/utils';
import Image from 'next/image';
import ConfirmBtn from '@/shared/ui/confirmBtn';
import PeopleCard from '@/shared/ui/peopleCard';
import { WorkerListProps } from '@/entities/worker/type';
import useUserStore from '@/entities/worker/api/mock/userStore';
import { useProductStore } from '@/entities/product/store';
import { useTeamMembersForInvitation, useAddTeamMemberMutation, useVehicle } from '@/lib/api/hooks/useVehicle';
import { motion, AnimatePresence } from 'framer-motion';
import { useQueryClient } from '@tanstack/react-query';
import { showToast } from '@/lib/utils/toast';
import UserDetailModal from '@/entities/vehicle/components/userInfoFull/UserDetailModal';
function Dialog({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Root>) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />;
}

function DialogTrigger({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Trigger>) {
  return <DialogPrimitive.Trigger data-slot="dialog-trigger" {...props} />;
}

function DialogPortal({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Portal>) {
  return <DialogPrimitive.Portal data-slot="dialog-portal" {...props} />;
}

function DialogClose({
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Close>) {
  return <DialogPrimitive.Close data-slot="dialog-close" {...props} />;
}

function DialogOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Overlay>) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50',
        className
      )}
      {...props}
    />
  );
}

function DialogContent({
  className,
  children,
  showCloseButton = true,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Content> & {
  showCloseButton?: boolean;
}) {
  return (
    <DialogPortal data-slot="dialog-portal">
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'bg-background data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 fixed top-[50%] left-[50%] z-50 grid w-full  max-w-1/2 translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border p-6 shadow-lg duration-200',
          className
        )}
        {...props}
      >
        {children}
        {showCloseButton && (
          <DialogPrimitive.Close
            data-slot="dialog-close"
            className="ring-offset-background focus:ring-ring data-[state=open]:bg-accent data-[state=open]:text-muted-foreground absolute top-4 right-4 rounded-xs opacity-70 transition-opacity hover:opacity-100 focus:ring-2 focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4"
          >
            <XIcon />
            <span className="sr-only">Close</span>
          </DialogPrimitive.Close>
        )}
      </DialogPrimitive.Content>
    </DialogPortal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-header"
      className={cn('flex flex-col gap-2 text-center sm:text-left', className)}
      {...props}
    />
  );
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn(
        'flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className
      )}
      {...props}
    />
  );
}

function DialogTitle({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Title>) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('leading-none font-semibold', className)}
      {...props}
    />
  );
}

function DialogDescription({
  className,
  ...props
}: React.ComponentProps<typeof DialogPrimitive.Description>) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-muted-foreground text-sm', className)}
      {...props}
    />
  );
}

interface FacilitatorToInvite {
  id: string;
  email: string;
}

interface AddFacilitatorsDialogProps {
  children: React.ReactNode;
  title: string;
  vehicleID: string;
}

export const AddFacilitatorsDialog: React.FC<AddFacilitatorsDialogProps> = ({
  children,
  title,
  vehicleID,
}) => {
  // Fetch real vehicle data to get current facilitator count
  const { data: vehicleData } = useVehicle(parseInt(vehicleID));
  const queryClient = useQueryClient();
  
  const [emailInput, setEmailInput] = React.useState<string>('');
  const [facilitatorsToInvite, setFacilitatorsToInvite] = React.useState<FacilitatorToInvite[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [isInviting, setIsInviting] = React.useState(false);
  const { chosenProduct } = useProductStore();

  // Get current facilitators count from real API data
  const currentFacilitatorsCount = React.useMemo(() => {
    if (!vehicleData?.vehicle?.teamMembers) return 0;
    return vehicleData.vehicle.teamMembers.filter(member => member.role === 'FACILITATOR').length;
  }, [vehicleData]);

  const isValidEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleAddEmail = () => {
    if (emailInput.trim() && isValidEmail(emailInput.trim())) {
      const newEmail: FacilitatorToInvite = {
        id: Date.now().toString(),
        email: emailInput.trim()
      };
      
      // Check if email already exists in the list
      if (!facilitatorsToInvite.some(item => item.email.toLowerCase() === newEmail.email.toLowerCase())) {
        // Check if not already a facilitator
        const isAlreadyFacilitator = vehicleData?.vehicle?.teamMembers?.some(
          member => member.role === 'FACILITATOR' && member.email.toLowerCase() === newEmail.email.toLowerCase()
        );
        
        if (!isAlreadyFacilitator) {
          setFacilitatorsToInvite(prev => [...prev, newEmail]);
          setEmailInput('');
        } else {
          showToast.warning('This user is already a facilitator for this vehicle');
        }
      }
    }
  };

  const handleRemoveEmail = (id: string) => {
    setFacilitatorsToInvite(prev => prev.filter(item => item.id !== id));
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddEmail();
    }
  };

  const handleInvite = async () => {
    if (facilitatorsToInvite.length === 0 || !chosenProduct) return;
    
    // Check if adding these facilitators would exceed the maximum
    if (currentFacilitatorsCount + facilitatorsToInvite.length > 3) {
      showToast.warning(`Maximum 3 facilitators allowed. You currently have ${currentFacilitatorsCount} facilitator(s).`);
      return;
    }
    
    setIsInviting(true);
    
    try {
      // Import the invitation service
      const { invitationService } = await import('@/entities/invitation/api/invitationService');
      
      // Send invitation for each email
      const invitationPromises = facilitatorsToInvite.map(facilitator =>
        invitationService.sendFacilitatorInvitation({
          vehicleId: parseInt(vehicleID),
          productId: chosenProduct.id,
          email: facilitator.email,
          name: facilitator.email.split('@')[0] // Use part before @ as name if not provided
        })
      );
      
      await Promise.all(invitationPromises);
      
      // Show success message
      showToast.success(`Invitation${facilitatorsToInvite.length > 1 ? 's' : ''} sent successfully! The facilitator${facilitatorsToInvite.length > 1 ? 's' : ''} will receive an email with instructions.`);
      
      // Invalidate vehicle query to refresh the facilitators list
      await queryClient.invalidateQueries({ queryKey: ['vehicles', 'detail', parseInt(vehicleID)] });
      
      // Clear the list and close
      setFacilitatorsToInvite([]);
      setEmailInput('');
      setIsOpen(false);
    } catch (error: any) {
      console.error('Failed to send facilitator invitations:', error);
      showToast.error('Failed to send invitations: ' + (error.message || 'Unknown error'));
    } finally {
      setIsInviting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger className="w-28 h-28" onClick={() => setIsOpen(true)}>
        {children}
      </DialogTrigger>
      <DialogContent className="px-6 py-6 max-w-[500px] transition-all">
        <DialogHeader>
          <DialogTitle className="text-lg font-semibold text-gray-900">{title}</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Email input section */}
          <div>
            <div className="flex gap-2">
              <div className="flex-1 relative">
                <div className="absolute left-0 top-1/2 transform -translate-y-1/2 pointer-events-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 18 19" fill="none">
                    <path d="M17.7364 17.264L13.4335 12.962C14.6806 11.4647 15.3025 9.54426 15.1698 7.60013C15.037 5.65601 14.1599 3.83789 12.7208 2.52401C11.2817 1.21012 9.39152 0.501627 7.44337 0.545902C5.49522 0.590177 3.63914 1.38382 2.26123 2.76172C0.883328 4.13963 0.0896887 5.99571 0.0454138 7.94386C0.00113894 9.89201 0.709637 11.7822 2.02352 13.2213C3.33741 14.6604 5.15552 15.5375 7.09965 15.6703C9.04377 15.803 10.9642 15.1811 12.4615 13.934L16.7635 18.2368C16.8274 18.3007 16.9033 18.3514 16.9867 18.386C17.0702 18.4205 17.1596 18.4383 17.25 18.4383C17.3403 18.4383 17.4297 18.4205 17.5132 18.386C17.5967 18.3514 17.6725 18.3007 17.7364 18.2368C17.8002 18.173 17.8509 18.0971 17.8855 18.0137C17.92 17.9302 17.9378 17.8408 17.9378 17.7504C17.9378 17.6601 17.92 17.5707 17.8855 17.4872C17.8509 17.4037 17.8002 17.3279 17.7364 17.264ZM1.43745 8.12544C1.43745 6.90167 1.80034 5.70538 2.48023 4.68785C3.16013 3.67032 4.12648 2.87725 5.2571 2.40894C6.38772 1.94062 7.63182 1.81809 8.83207 2.05683C10.0323 2.29558 11.1348 2.88488 12.0002 3.75022C12.8655 4.61555 13.4548 5.71806 13.6936 6.91832C13.9323 8.11858 13.8098 9.36268 13.3415 10.4933C12.8731 11.6239 12.0801 12.5903 11.0625 13.2702C10.045 13.9501 8.84872 14.3129 7.62495 14.3129C5.98448 14.3111 4.41173 13.6586 3.25174 12.4987C2.09175 11.3387 1.43927 9.76591 1.43745 8.12544Z" fill="#181818" fillOpacity="0.5"/>
                  </svg>
                </div>
                <input
                  type="email"
                  className="w-full border-0 border-b-2 border-gray-300 rounded-none pl-8 pr-12 py-3 outline-none focus:border-[#9CA3AF] focus:ring-0 text-gray-900 bg-transparent"
                  placeholder="Enter email address"
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                />
                <button
                  onClick={handleAddEmail}
                  disabled={!emailInput.trim() || !isValidEmail(emailInput.trim())}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" width="25" height="25">
                    <g id="SVGRepo_bgCarrier" strokeWidth="0"></g>
                    <g id="SVGRepo_tracerCarrier" strokeLinecap="round" strokeLinejoin="round"></g>
                    <g id="SVGRepo_iconCarrier">
                      <path d="M15 11L12 8M12 8L9 11M12 8V16M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="#181818" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" strokeOpacity="0.5"></path>
                    </g>
                  </svg>
                </button>
              </div>
            </div>
            {emailInput && !isValidEmail(emailInput) && (
              <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
            )}
          </div>

          {/* Facilitators list */}
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-3">
              Members to invite ({facilitatorsToInvite.length})
            </h3>
            <div className="max-h-48 overflow-y-auto space-y-2">
              {facilitatorsToInvite.length === 0 ? (
                <div className="text-gray-500 text-sm py-4 text-center border-2 border-dashed border-gray-200 rounded-lg">
                  No members added yet
                </div>
              ) : (
                facilitatorsToInvite.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between bg-gray-50 rounded-lg px-4 py-3"
                  >
                    <div className="flex items-center">
                      <span 
                        className="font-normal"
                        style={{
                          color: '#8D8D8D',
                          fontFamily: 'Inter',
                          fontSize: '13px',
                          fontStyle: 'normal',
                          fontWeight: 400,
                          lineHeight: '140%'
                        }}
                      >
                        {item.email}
                      </span>
                    </div>
                    <button
                      onClick={() => handleRemoveEmail(item.id)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M18 6L6 18M6 6L18 18"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end">
            <button
              onClick={handleInvite}
              disabled={facilitatorsToInvite.length === 0 || isInviting || !chosenProduct}
              className="px-6 py-2 transition-colors"
              style={{
                borderRadius: '12px',
                backgroundColor: '#EAEDF2',
                boxShadow: '-2px -2px 2px 0 #FFF, 2px 2px 2px 0 rgba(167, 177, 196, 0.60)',
                cursor: (facilitatorsToInvite.length === 0 || isInviting || !chosenProduct) ? 'not-allowed' : 'pointer',
                opacity: (facilitatorsToInvite.length === 0 || isInviting || !chosenProduct) ? 0.5 : 1,
                color: '#535354',
                fontFamily: 'Poppins',
                fontSize: '13.284px',
                fontStyle: 'normal',
                fontWeight: 600,
                lineHeight: '19.927px'
              }}
            >
              {isInviting ? 'Sending...' : 'Invite'}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

interface AddWorkersProps {
  children: React.ReactNode;
  title: string;
  vehicleID: string;
  vehicleName: string;
}

export const AddWorkers: React.FC<AddWorkersProps> = ({
  children,
  title,
  vehicleID,
  vehicleName,
}) => {
  const [searchTerm, setSearchTerm] = React.useState<string>('');
  const [selectedUserIds, setSelectedUserIds] = React.useState<string[]>([]);
  const [isOpen, setIsOpen] = React.useState(false);
  const [selectedUserId, setSelectedUserId] = React.useState<string | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = React.useState(false);
  const { chosenProduct } = useProductStore();
  const { data: teamMembersData, isLoading } = useTeamMembersForInvitation(
    parseInt(vehicleID),
    '',
    chosenProduct?.id
  );
  const addTeamMemberMutation = useAddTeamMemberMutation();

  const convertToWorkerListProps = (apiUsers: any[]): WorkerListProps[] => {
    return apiUsers.map(user => {
      // Get filledLevels from backend response (shows how many vehicles user is member of in this product)
      // Backend sends filledLevels which is max 5 (represents vehicle count in selected product)
      const vehicleCount = user.vehicleCount || 0;
      const filledLevels = user.filledLevels !== undefined ? user.filledLevels : Math.min(vehicleCount, 5);
      
      // Create capacity array for filledLevels (for compatibility with existing code)
      const capacity = Array.from({ length: filledLevels }, (_, i) => ({
        id: `vehicle-${i}`,
        vehicleName: `Vehicle ${i + 1}`
      }));

      return {
      id: user.id.toString(),
      name: user.name || 'Unknown',
      surname: user.surname || 'User',
      accuratePosition: user.role || 'Member',
      shortName: user.name ? user.name.split(' ').map((n: string) => n[0]).join('.') : 'U.U',
      color: '#33A1FD',
      isManager: false,
      email: user.email || 'unknown@example.com',
      password: '',
      position: user.role === 'product_manager' ? 'PM' : (user.role || 'Member'),
      timeZone: 'UTC+0',
      phoneNumber: user.phoneNumber || '+1-555-0000',
        capacity: capacity, // Capacity array based on vehicle count
      status: 'active',
      productInProgress: 0,
        vehicleInProgress: vehicleCount, // Store actual vehicle count
      relatedVehicles: [],
      facilitatorIn: [],
      efficiencyCharts: {
        speed: 75,
        efficiency: 80,
        quality: 85,
      },
      relatedProducts: chosenProduct ? [chosenProduct.id.toString()] : [],
        image: user.avatar || user.image || '/Ellipse 5.svg'
      };
    });
  };

  const notRelatedUsers = teamMembersData?.success ? convertToWorkerListProps(teamMembersData.data.all) : [];

  const filtered = notRelatedUsers.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (userId: string) => {
    if (selectedUserIds.includes(userId)) {
      setSelectedUserIds(prev => prev.filter(id => id !== userId));
    } else {
      setSelectedUserIds(prev => [...prev, userId]);
    }
  };

  const handleInvite = async () => {
    if (selectedUserIds.length === 0) return;
    
    try {
      for (const userId of selectedUserIds) {
        // Find the user's actual role from the available users list
        const user = teamMembersData?.data?.all?.find((u: any) => u.id === parseInt(userId)) ||
                     teamMembersData?.data?.suggested?.find((u: any) => u.id === parseInt(userId));
        
        // Use the user's actual role
        const userRole = (user as any)?.role;
        
        await addTeamMemberMutation.mutateAsync({
          vehicleId: parseInt(vehicleID),
          data: {
            userId: parseInt(userId),
            role: userRole
          }
        });
      }
      setSelectedUserIds([]);
      setIsOpen(false);
    } catch (error) {
      console.error('Failed to add team members:', error);
    }
  };

  return (
    <>
      <div className="w-10 h-10" onClick={() => setIsOpen(true)}>
        {children}
      </div>
      
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className="fixed inset-0 right-[25%] top-[25%] z-50 flex items-center justify-center"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <motion.div
              className="bg-white rounded-2xl p-4 w-[549px] max-w-full shadow-2xl relative"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.25 }}
            >
              <button
                className="absolute top-4 right-4 text-gray-400 cursor-pointer"
                onClick={() => setIsOpen(false)}
              >
                ✕
              </button>
              <h2 className="font-semibold text-base mb-4 text-gray-900">
                {title}
              </h2>
              <div className='max-w-[317px] mb-6'>
                <input
                  className="gradient-input border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#7B8FFF] text-gray-900"
                  placeholder="Search here"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{padding:'7px'}}
                />
              </div>

              <div className="flex gap-4 flex-wrap mb-10">
                {isLoading ? (
                  <div className="w-full text-center py-4 text-gray-500">
                    Loading members...
                  </div>
                ) : filtered.length === 0 ? (
                  <div className="w-full text-center py-4 text-gray-500">
                    {notRelatedUsers.length === 0 
                      ? 'No members found for this product' 
                      : 'No members match your search'
                    }
                  </div>
                ) : (
                  filtered.map((user, index) => (
                    <div
                      key={user.id}
                      onClick={() => handleUserSelect(user.id)}
                      className={`cursor-pointer transition-all duration-200 ${
                        selectedUserIds.includes(user.id)
                          ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' 
                          : 'hover:scale-105'
                      }`}
                    >
                      <PeopleCard
                        imageLink={user.image}
                        name={user.name}
                        role={user.position}
                        filledLevels={user.capacity.length}
                        onDoubleClick={() => {
                          setSelectedUserId(user.id);
                          setIsUserDetailOpen(true);
                        }}
                      />
                    </div>
                  ))
                )}
              </div>
              <button
                className={`rounded-xl px-6 py-2 float-right font-semibold cursor-pointer transition-colors ${
                  selectedUserIds.length > 0 && !addTeamMemberMutation.isPending
                    ? 'text-white hover:opacity-90'
                    : 'bg-[#EAEDF2] text-gray-700'
                }`}
                style={{
                  boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
                  backgroundColor: selectedUserIds.length > 0 && !addTeamMemberMutation.isPending ? '#627899' : undefined,
                }}
                onClick={handleInvite}
                disabled={selectedUserIds.length === 0 || addTeamMemberMutation.isPending}
              >
                {addTeamMemberMutation.isPending ? 'Inviting...' : 'Invite'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {selectedUserId && (
        <UserDetailModal
          userID={selectedUserId}
          vehicleID={vehicleID}
          isOpen={isUserDetailOpen}
          onClose={() => {
            setIsUserDetailOpen(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </>
  );
};

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
