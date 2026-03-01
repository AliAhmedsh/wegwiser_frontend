import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import PeopleCard from '@/shared/ui/peopleCard';
import { formatRole } from '@/lib/utils/formatRole';
import { notesService } from '@/entities/note/api/notesService';
import { useProductStore } from '@/entities/product';
import UserDetailModal from '@/entities/vehicle/components/userInfoFull/UserDetailModal';
import { invitationService } from '@/entities/invitation/api/invitationService';
import { showToast } from '@/lib/utils/toast';
import { useQueryClient } from '@tanstack/react-query';

interface AddFacilitatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  productId: number;
  vehicleId: number;
  vehicleName: string;
  onFacilitatorAdded?: () => void;
}

export default function AddFacilitatorModal({ 
  isOpen,
  onClose, 
  productId, 
  vehicleId,
  vehicleName,
  onFacilitatorAdded
}: AddFacilitatorModalProps) {
  const [search, setSearch] = useState('');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [userDetailUserId, setUserDetailUserId] = useState<string | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const { chosenProduct } = useProductStore();
  const queryClient = useQueryClient();
  
  // Fetch all users from product and all vehicles
  useEffect(() => {
    const fetchAllUsers = async () => {
      if (!productId) {
        setAllUsers([]);
        return;
      }

      setIsLoadingUsers(true);
      try {
        // Pass empty query to get all users from product
        const response = await notesService.searchUsersForMention({
          q: '',
          productId: productId,
          limit: 100
        });
        
        if (response.success && response.users) {
          setAllUsers(response.users);
        } else {
          setAllUsers([]);
        }
      } catch (error) {
        console.error('Failed to fetch users:', error);
        setAllUsers([]);
      } finally {
        setIsLoadingUsers(false);
      }
    };

    fetchAllUsers();
  }, [productId]);

  const members = allUsers.map((user: any, index: number) => {
    const rawRole = user.role || user.productRole || user.vehicleRole || 'member';
    const formattedRole = formatRole(rawRole);

    // Ensure unique ID - use user.id if available, otherwise use index
    const userId = user.id ? String(user.id) : `user-${index}-${user.email || Date.now()}`;

    return {
      id: userId,
      name: user.name,
      role: formattedRole || 'MEMBER',
      filledLevels: 2, 
      imageLink: user.avatar || '/Ellipse 5.svg', 
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

  const handleAddFacilitator = async () => {
    if (!selectedUserId || !chosenProduct) return;
    
    const selectedUser = members.find(m => m.id === selectedUserId);
    if (!selectedUser) return;
    
    setIsAdding(true);
    try {
      await invitationService.sendFacilitatorInvitation({
        vehicleId: vehicleId,
        productId: chosenProduct.id,
        email: selectedUser.email,
        name: selectedUser.name
      });
      
      showToast.success(`Facilitator invitation sent to ${selectedUser.name}!`);
      
      // Refresh vehicle data to show updated facilitators
      await queryClient.invalidateQueries({ queryKey: ['vehicles', 'detail', vehicleId] });
      await queryClient.invalidateQueries({ queryKey: ['vehicles'] });
      
      // Call callback to refresh vehicle data in parent component
      if (onFacilitatorAdded) {
        onFacilitatorAdded();
      }
      
      onClose();
    } catch (error: any) {
      console.error('Failed to add facilitator:', error);
      const errorMessage = error.response?.data?.error || 
                          error.response?.data?.message || 
                          error.message || 
                          'Failed to add facilitator. Please try again.';
      showToast.error(errorMessage);
    } finally {
      setIsAdding(false);
    }
  };

  if (!isOpen) return null;

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
            className="absolute top-4 right-4 text-gray-400 cursor-pointer text-xl font-bold hover:text-gray-600"
            onClick={onClose}
            style={{ fontSize: '20px', width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            ✕
          </button>
          <h2 className="font-semibold text-lg mb-4 text-gray-900">
            Add Facilitator
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
              className="gradient-input border border-gray-300 rounded-lg px-4 py-3 outline-none focus:border-[#7B8FFF] text-gray-900"
              placeholder="Search here"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{
                padding: '10px 14px',
                fontSize: '14px',
                lineHeight: '1.5'
              }}
            />
          </div>

          <div className="flex gap-4 flex-wrap mb-10">
            {isLoadingUsers ? (
              <div className="w-full text-center py-4 text-gray-500" style={{ fontSize: '14px' }}>
                Loading users...
              </div>
            ) : filtered.length === 0 ? (
              <div className="w-full text-center py-4 text-gray-500" style={{ fontSize: '14px' }}>
                {allUsers.length === 0 
                  ? 'No users found for this product' 
                  : 'No users match your search'
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
            className="rounded-xl px-6 py-3 float-right font-semibold cursor-pointer transition-colors bg-[#EAEDF2]"
            style={{
              boxShadow: '2px 2px 2px 0px #A7B1C499, -2px -2px 2px 0px #FFFFFF',
              color: '#535354', // Text Dark Grey
              minHeight: '44px',
              fontSize: '14px',
              fontWeight: 600
            }}
            onClick={handleAddFacilitator}
            disabled={!selectedUserId || isAdding}
          >
            {isAdding ? 'Adding...' : 'Add Facilitator'}
          </button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
      
      {userDetailUserId && (
        <UserDetailModal
          userID={userDetailUserId}
          vehicleID={vehicleId.toString()}
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

