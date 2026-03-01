import React, { useEffect, useState, useCallback } from 'react';
import { useProductStore } from '@/entities/product/store';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';
import { notesService } from '@/entities/note/api/notesService';
import { showToast } from '@/lib/utils/toast';
import SearchIcon from '@/shared/icons/SearchIcon';
import PeopleCard from '@/shared/ui/peopleCard';
import Spinner from '@/shared/ui/Spinner';
import UserDetailModal from '@/entities/vehicle/components/userInfoFull/UserDetailModal';

interface User {
  id: number | string;
  name: string;
  email: string;
  username?: string;
  avatar?: string;
  position?: string;
  role?: string;
  isOnline?: boolean;
}

const PeoplePanel: React.FC = () => {
  const { chosenProduct } = useProductStore();
  const { selectedVehicleId } = useSelectedVehicleStore();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isUserDetailOpen, setIsUserDetailOpen] = useState(false);

  const fetchUsers = useCallback(async () => {
    // Don't fetch if vehicleId is not available (required for vehicle members)
    if (!chosenProduct?.id || !selectedVehicleId) {
      setUsers([]);
      setFilteredUsers([]);
      return;
    }

    try {
      setIsLoading(true);
      // Use the same API call as tickets modals - get vehicle members
      const response = await notesService.searchUsersForMention({
        vehicleId: selectedVehicleId,
        productId: chosenProduct.id,
        limit: 100
      });

      if (response.success && response.users) {
        // Map API response to User interface
        const mappedUsers: User[] = response.users.map((user: any) => ({
          id: user.id,
          name: user.name,
          email: user.email,
          username: user.username,
          avatar: user.avatar,
          position: user.position || user.role, // Use position or fallback to role
          role: user.role,
        }));
        setUsers(mappedUsers);
        setFilteredUsers(mappedUsers);
      } else {
        console.error('Failed to fetch users:', response);
        setUsers([]);
        setFilteredUsers([]);
        showToast.error('Failed to load team members');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setUsers([]);
      setFilteredUsers([]);
      showToast.error('Failed to load team members');
    } finally {
      setIsLoading(false);
    }
  }, [chosenProduct?.id, selectedVehicleId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  useEffect(() => {
    if (searchQuery.trim().length === 0) {
      setFilteredUsers(users);
      return;
    }

    const filtered = users.filter(user => 
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (user.username && user.username.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (user.position && user.position.toLowerCase().includes(searchQuery.toLowerCase()))
    );
    setFilteredUsers(filtered);
  }, [searchQuery, users]);

  const formatRole = (position?: string, role?: string) => {
    // Use position or role, whichever is available
    const roleText = position || role;
    if (!roleText) return 'Member';
    
    const trimmedRole = roleText.trim();
    const roleLower = trimmedRole.toLowerCase();
    
    // Convert product_manager or product manager to PM
    if (roleLower === 'product_manager' || roleLower === 'product manager') {
      return 'PM';
    }
    
    // For other roles, capitalize first letter and preserve rest of the case
    // This handles: "designer" → "Designer", "ENGINEER/QA" → "ENGINEER/QA"
    return trimmedRole.charAt(0).toUpperCase() + trimmedRole.slice(1);
  };

  return (
    <div className="flex flex-col gap-4 h-full w-full">
      <div className="relative h-9 w-full">
        <input
          type="text"
          className="text-sm h-full w-full border border-gray-400 rounded-md p-1 pr-10"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <div className="absolute top-[25%] right-4 text-gray-500 pointer-events-none">
          <SearchIcon width={18} />
        </div>
      </div>
      <div className="flex flex-col items-center gap-2 flex-1 pt-2 pb-4 overflow-y-auto min-h-0">
        {isLoading ? (
          <div className="flex items-center justify-center">
            <div className="text-gray-500 flex items-center text-xs font-normal">
              <Spinner size="sm" className="mr-2" />
              Loading team members...
            </div>
          </div>
        ) : (
          filteredUsers.map((user) => (
            <PeopleCard 
              key={user.id} 
              filledLevels={3} 
              imageLink={user.avatar || '/Ellipse 5.svg'} 
              name={user.name} 
              role={formatRole(user.position, user.role)} 
              onDoubleClick={() => {
                setSelectedUserId(user.id.toString());
                setIsUserDetailOpen(true);
              }}
            />
          ))
        )}
      </div>
      <div className="flex flex-col gap-25">
        <div className="py-2 border-t border-[#E8E8E8]">
          <p className="text-xs font-normal text-[#181818]">Comments</p>
        </div>
        <div className="py-2 border-t-1 border-[#E8E8E8]">
          <p className="text-xs font-normal text-[#181818]">Code Activity </p>
        </div>
      </div>
      
      {selectedUserId && (
        <UserDetailModal
          userID={selectedUserId}
          vehicleID={selectedVehicleId}
          isOpen={isUserDetailOpen}
          onClose={() => {
            setIsUserDetailOpen(false);
            setSelectedUserId(null);
          }}
        />
      )}
    </div>
  );
};

export default PeoplePanel;
