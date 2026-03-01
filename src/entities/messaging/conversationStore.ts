import { create } from 'zustand';
import { productApiService } from '../product/api/api';
import { formatRole } from '@/lib/utils/formatRole';

interface Person {
  id: string;
  name: string;
  position: string;
}

interface Group {
  id: string;
  name: string;
  members: Person[];
}

interface ConversationState {
  people: Person[];
  groups: Group[];
  isLoading: boolean;
  error: string | null;
  addPerson: (person: Person) => void;
  addGroup: (group: Group) => void;
  fetchUsers: (productId?: number, currentUserId?: number) => Promise<void>;
  clearError: () => void;
  clearAll: () => void;
}

export const useConversationStore = create<ConversationState>((set, get) => ({
  people: [],
  groups: [],
  isLoading: false,
  error: null,
  
  addPerson: (person) =>
    set((state) => ({
      people: [...state.people, person],
    })),
    
  addGroup: (group) =>
    set((state) => ({
      groups: [...state.groups, group],
    })),

  fetchUsers: async (productId?: number, currentUserId?: number) => {
    set({ isLoading: true, error: null });
    try {
      if (productId) {
        // Fetch users from the selected product
        const membersResponse = await productApiService.getMembers(productId);
        const people: Person[] = membersResponse.members
          .filter((member) => member.user.id !== currentUserId) // Filter out current user
          .map((member) => {
            const rawRole = member.user.role || member.role || 'member';
            return {
              id: member.user.id.toString(),
              name: member.user.name,
              position: formatRole(rawRole),
            };
          });

        console.log('Mapped people with formatted roles (excluding current user):', people);
        set({ people, isLoading: false });
        return;
      } else {
        // No product selected - show no users
        console.log('No product selected, showing empty user list');
        set({ people: [], isLoading: false });
        return;
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      set({ 
        error: 'Failed to load users. Please try again.', 
        isLoading: false 
      });
    }
  },

  clearError: () => set({ error: null }),
  
  clearAll: () => set({ people: [], groups: [], error: null, isLoading: false }),
}));
