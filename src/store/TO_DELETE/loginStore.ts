import { useConversationStore } from '@/entities/messaging/conversationStore';
import { useProductStore } from '@/entities/product/store';
import { authService } from '@/lib/api/services/authService';
import { getCookie, removeCookie } from '@/lib/config/api';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  name: string;
  email: string;
  password: string;
  position: string;
  createdAt?: string | Date;
}

interface LoginState {
  user: User | null;
  isInitialized: boolean;
  isOfflineMode: boolean;
  lastUserId: string | null;
  login: (
    email: string,
    password: string,
    name: string,
    position: string,
    createdAt?: string | Date
  ) => void;
  logout: () => void;
  initializeFromToken: () => void;
  setOfflineMode: (offline: boolean) => void;
}

const useLoginStore = create<LoginState>()(
  persist(
    (set, get) => ({
      user: null,
      isInitialized: false,
      isOfflineMode: false,
      lastUserId: null,
      login: (email, password, name, position, createdAt) =>
        set({ user: { email, password, name, position, createdAt } }),
      logout: async () => {
        // Clear both possible cookie names
        removeCookie('access_token');
        removeCookie('token');
        // Clear user role from sessionStorage
        sessionStorage.removeItem('userRole');
        
        // Dispatch custom event to notify components of role change
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('userRoleChanged'));
        }
        try {
          await authService.logout(); 
        } catch (error) {
          console.error('Error during backend logout:', error);
        }
        

        try {
          const productStore = useProductStore.getState();
          productStore.clearChosenProduct();
          
          // Force clear all Zustand stores from localStorage
          localStorage.removeItem('product-store');
          localStorage.removeItem('login-store');
          localStorage.removeItem('conversation-store');
          localStorage.removeItem('ai-store');
          localStorage.removeItem('guideline-storage');
          localStorage.removeItem('workspace-storage');
          
          // Clear all sessionStorage as well
          sessionStorage.clear();
          
          const conversationStore = useConversationStore.getState();
          conversationStore.clearAll();
          
          // Force reload the page to ensure complete state reset
          window.location.reload();
        } catch (error) {
          console.error('Error clearing stores during logout:', error);
          // Even if there's an error, still reload to ensure clean state
          window.location.reload();
        }
        
        set({ user: null, lastUserId: null });
      },
      setOfflineMode: (offline: boolean) => {
        set({ isOfflineMode: offline });
       
      },
      initializeFromToken: () => {
        if (get().isInitialized) return;
        
       
        
        try {
          
          let token = getCookie('access_token');
          if (!token) {
            token = getCookie('token');
          }
          
          console.log('LoginStore: Token found:', !!token);
          if (token) {
        
            const decoded = jwtDecode<any>(token);

            
            const email = decoded.email || decoded['https://wegwiser-api/email'] || 'user@example.com';
            const name = decoded.name || decoded['https://wegwiser-api/name'] || 'User';
            const role = decoded.role || decoded['https://wegwiser-api/roles']?.[0] || 'user';
            
            const currentUserId = email;
            const { lastUserId } = get();
            
            // If user has changed, clear user-specific stores
            if (lastUserId && lastUserId !== currentUserId) {
              console.log('User changed, clearing stores...');
              try {
                const productStore = useProductStore.getState();
                productStore.clearChosenProduct();
                
                const conversationStore = useConversationStore.getState();
                conversationStore.clearAll();
              } catch (error) {
                console.error('Error clearing stores on user change:', error);
              }
            }
            
            set({ 
              user: { 
                email, 
                name, 
                password: '', 
                position: role 
              },
              isInitialized: true,
              lastUserId: currentUserId
            });
           
          } else {
            // Clear stores when no token (user logged out)
            try {
              const productStore = useProductStore.getState();
              productStore.clearChosenProduct();
              
              // Force clear all Zustand stores from localStorage
              localStorage.removeItem('product-store');
              localStorage.removeItem('login-store');
              localStorage.removeItem('conversation-store');
              localStorage.removeItem('ai-store');
              localStorage.removeItem('guideline-storage');
              localStorage.removeItem('workspace-storage');
              
              // Clear all sessionStorage as well
              sessionStorage.clear();
              
              const conversationStore = useConversationStore.getState();
              conversationStore.clearAll();
            } catch (error) {
              console.error('Error clearing stores on logout:', error);
            }
            
            set({ isInitialized: true, user: null, lastUserId: null });
          }
        } catch (error) {
          set({ isInitialized: true, user: null, lastUserId: null });
        }
      },
    }),
    {
      name: 'login-store',
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          return item ? JSON.parse(item) : null;
        },
        setItem: (name, value) => {
          localStorage.setItem(name, JSON.stringify(value));
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

export default useLoginStore;