import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PeopleCard from '@/shared/ui/peopleCard';
import { useTicketActionMutation } from '@/entities/tickets/api/hooks';
import { formatRole } from '@/lib/utils/formatRole';
import { notesService } from '@/entities/note/api/notesService';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { useProductStore } from '@/entities/product';
import UserDetailModal from '@/entities/vehicle/components/userInfoFull/UserDetailModal';

interface ReassignModalProps {
  onClose: () => void;
  productId: number;
  ticketId: string;
}

export default function ReassignModal({ onClose, productId, ticketId }: ReassignModalProps) {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [vehicleMembers, setVehicleMembers] = useState<any[]>([]);
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [userDetailUserId, setUserDetailUserId] = useState<string | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const { selectedVehicleId } = useSelectedVehicleStore();
  const { chosenProduct } = useProductStore();
  const ticketActionMutation = useTicketActionMutation();
  
  // Fetch vehicle members when modal opens
  useEffect(() => {
    const fetchVehicleMembers = async () => {
      if (!selectedVehicleId || !chosenProduct?.id) {
        setVehicleMembers([]);
        return;
      }

      setIsLoadingMembers(true);
      try {
        const response = await notesService.searchUsersForMention({
          vehicleId: selectedVehicleId,
          productId: chosenProduct.id,
          limit: 100
        });
        
        if (response.success && response.users) {
          setVehicleMembers(response.users);
        } else {
          setVehicleMembers([]);
        }
      } catch (error) {
        console.error('Failed to fetch vehicle members:', error);
        setVehicleMembers([]);
      } finally {
        setIsLoadingMembers(false);
      }
    };

    fetchVehicleMembers();
  }, [selectedVehicleId, chosenProduct?.id]);

  const members = vehicleMembers.map((user: any, index: number) => {
    const rawRole = user.role || user.productRole || user.vehicleRole || 'member';
    const formattedRole = formatRole(rawRole);

    // Ensure unique ID - use user.id if available, otherwise use index
    const userId = user.id ? String(user.id) : `user-${index}-${user.email || Date.now()}`;

    return {
      id: userId,
      name: user.name,
      role: formattedRole || 'MEMBER',
      filledLevels: 2, 
      imageLink: '/Ellipse 5.svg', 
      email: user.email,
    };
  });

  const filtered = members.filter((member) =>
    member.name.toLowerCase().includes(search.toLowerCase()) ||
    member.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleUserSelect = (userId: string) => {
    setSelectedUserId(userId);
  };

  const handleUserDoubleClick = (userId: string) => {
    setUserDetailUserId(userId);
    setIsUserDetailOpen(true);
  };

  const handleReassign = async () => {
    if (!selectedUserId) return;
    
    try {
      await ticketActionMutation.mutateAsync({
        productId,
        ticketId,
        data: {
          action: 'reassign',
          assignedTo: selectedUserId,
        },
      });
      onClose();
    } catch (error) {

      console.error('Failed to reassign ticket:', error);
    }
  };

  return (
    <>
    <AnimatePresence>
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
            onClick={onClose}
          >
            ✕
          </button>
          <h2 className="font-semibold text-base mb-4 text-gray-900">
            Re-assign ticket
          </h2>
          {selectedUserId && (
            <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-sm text-blue-700">
                Selected: {members.find(m => m.id === selectedUserId)?.name}
              </p>
            </div>
          )}
          <div className='max-w-[317px] mb-6'>
            <input
              className="gradient-input border border-gray-300 rounded-lg px-4 py-2 outline-none focus:border-[#7B8FFF] text-gray-900"
              placeholder="Search here"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{padding:'7px'}}
            />
          </div>

          <div className="flex gap-4 flex-wrap mb-10">
            {!selectedVehicleId ? (
              <div className="w-full text-center py-4 text-gray-500">
                Please select a vehicle first
              </div>
            ) : isLoadingMembers ? (
              <div className="w-full text-center py-4 text-gray-500">
                Loading members...
              </div>
            ) : filtered.length === 0 ? (
              <div className="w-full text-center py-4 text-gray-500">
                {members.length === 0 
                  ? 'No members found for this vehicle' 
                  : 'No members match your search'
                }
              </div>
            ) : (
                filtered.map((member, index) => (
                <div
                    key={`member-${member.id}-${index}`}
                  onClick={() => handleUserSelect(member.id)}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedUserId === member.id 
                      ? 'ring-2 ring-blue-500 ring-offset-2 rounded-xl' 
                      : 'hover:scale-105'
                  }`}
                >
                  <PeopleCard
                    imageLink={member.imageLink}
                    name={member.name}
                    role={member.role}
                    filledLevels={member.filledLevels}
                      onDoubleClick={() => handleUserDoubleClick(member.id)}
                  />
                </div>
              ))
            )}
          </div>
          <button
            className="rounded-xl px-6 py-2 float-right font-semibold cursor-pointer transition-colors bg-[#EAEDF2]"
            style={{
              boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
              color: '#535354', // Text Dark Grey
            }}
            onClick={handleReassign}
            disabled={!selectedUserId || ticketActionMutation.isPending}
          >
            {ticketActionMutation.isPending ? 'Reassigning...' : 'Re-assign'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
      
      {userDetailUserId && (
        <UserDetailModal
          userID={userDetailUserId}
          vehicleID={selectedVehicleId}
          isOpen={isUserDetailOpen}
          onClose={() => {
            setIsUserDetailOpen(false);
            setUserDetailUserId(null);
          }}
        />
      )}
    </>
  );
}
