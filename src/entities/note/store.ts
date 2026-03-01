import { handleProductApiError } from '@/entities/product/utils/errorHandler';
import { getCookie, API_CONFIG } from '@/lib/config/api';
import { showToast } from '@/lib/utils/toast';
import { jwtDecode } from 'jwt-decode';
import { create } from 'zustand';
import { notesService } from './api/notesService';
import { useProductStore } from '@/entities/product/store';

interface Mention {
  userId: string;
  username: string;
  email: string;
}

interface NoteProps {
  id?: string;
  title: string;
  text: string;
  x: number;
  y: number;
  vehicleId?: number;
  productId?: number;
  canvasArea?: string;
  mentions?: Mention[];
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  category?: 'general' | 'design' | 'development' | 'feedback' | 'bug' | 'feature';
  color?: string;
  isPrivate?: boolean;
  ownerId?: string;
  owner?: {
    id: string;
    name: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

interface NoteStore {
  notes: NoteProps[];
  isCreate: boolean;
  isShow: boolean;
  isLoading: boolean;
  setIsShow: (value: boolean) => void;
  setIsCreate: (value: boolean) => void;
  fetchNotes: (productId?: number) => Promise<void>;
  addNote: (note: NoteProps) => Promise<any>;
  updateNote: (id: string, data: any) => Promise<any>;
  updateNotePosition: (id: string, x: number, y: number) => Promise<void>;
  deleteNote: (id: string, productId?: number, taskId?: number) => Promise<boolean>;
  clearAllNotes: (productId?: number) => Promise<void>;
}

export const useNoteStore = create<NoteStore>((set, get) => ({
  notes: [],
  isCreate: false,
  isShow: false,
  isLoading: false,
  setIsShow: (value: boolean) => set({ isShow: value }),
  setIsCreate: (value) => set({ isCreate: value }),

  fetchNotes: async (productId?: number) => {
    const token = getCookie('access_token');
    
    
    if (!token) {
   
      return;
    }

    if (!productId) {
      set({ notes: [], isLoading: false });
      return;
    }

    const maxRetries = 3;
    let retryCount = 0;
    
    set({ isLoading: true });
    
    while (retryCount < maxRetries) {
      try {
        // vehicleId removed - notes are only linked to products
        const params: any = { productId };
        const response = await notesService.getNotes(params);
      
        if (response.success) {        

          set({ notes: response.notes, isLoading: false });
          return;
        } else {
          set({ isLoading: false });
          showToast.error(response.error || 'Failed to fetch notes.');
          return;
        }
      } catch (error: any) {
        retryCount++;
        
        if (retryCount >= maxRetries) {
          set({ isLoading: false });
          try {
            handleProductApiError(error, 'Failed to fetch notes after multiple attempts');
          } catch (handlerError) {
            showToast.error('Failed to fetch notes after multiple attempts');
          }
          return;
        }
        
        console.log(`fetchNotes: Retry attempt ${retryCount}/${maxRetries} after error:`, error.message);
        
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  },

  addNote: async (note: NoteProps) => {
    const token = getCookie('access_token');
    if (!token) {
      showToast.error('Please log in to create notes.');
      return null;
    }

    try {
      const noteData = {
        ...note,
        title: note.title || 'New Note'
      };
      const response = await notesService.createNote(noteData);
      if (response.success) {
        set((state) => ({
          notes: [...state.notes, response.note]
        }));
        showToast.success('Note created successfully!');
        return response;
      } else {
        showToast.error(response.error || 'Failed to create note.');
        return null;
      }
    } catch (error: any) {
      try {
        handleProductApiError(error, 'Failed to create note');
      } catch (handlerError) {
        showToast.error('Failed to create note');
      }
      return null;
    }
  },

  updateNote: async (id: string, data: any) => {
    const token = getCookie('access_token');
    if (!token) {
      showToast.error('Please log in to update notes.');
      return null;
    }

    try {
      // vehicleId removed - notes are only linked to products
      const updateData = {
        ...data,
        vehicleId: null // Always null - notes are only linked to products
      };
      
      const response = await notesService.updateNote(id, updateData);
      if (response.success) {
      
        set((state) => ({
          notes: state.notes.map(note => 
            note.id === id ? { ...note, ...response.note } : note
          )
        }));
        showToast.success('Note updated successfully!');
        return response;
      } else {
        showToast.error(response.error || 'Failed to update note.');
        return null;
      }
    } catch (error: any) {
      try {
        handleProductApiError(error, 'Failed to update note');
      } catch (handlerError) {
        showToast.error('Failed to update note');
      }
      return null;
    }
  },

  updateNotePosition: async (id: string, x: number, y: number) => {
    const token = getCookie('access_token');
    if (!token) {
      showToast.error('Please log in to update notes.');
      return;
    }

    const response = await fetch(`${API_CONFIG.BASE_URL}/notes/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ x, y })
    });

    if (!response.ok) {
      const errorData = await response.json();
      
      if (response.status === 404) {
        showToast.error('Insufficient permission');
      } else if (response.status === 401) {
        showToast.error('Please log in again to update notes.');
      } else if (response.status === 403) {
        showToast.error('You do not have permission to update this note.');
      } else if (errorData.error) {
        showToast.error(errorData.error);
      } else {
        showToast.error('Failed to update note position. Please try again.');
      }
      return;
    }
  },

  deleteNote: async (id: string, productId?: number, taskId?: number) => {
    const token = getCookie('access_token');
    if (!token) {
      showToast.error('Please log in to delete notes.');
      return false;
    }

    try {
      // vehicleId removed - notes are only linked to products
      const response = await notesService.deleteNote(id, productId, taskId);
      if (response.success) {
        set((state) => ({
          notes: state.notes.filter(note => note.id !== id)
        }));
        showToast.success('Note deleted successfully!');
        return true;
      } else {
        showToast.error(response.error || 'Failed to delete note.');
        return false;
      }
    } catch (error: any) {
      try {
        handleProductApiError(error, 'Failed to delete note');
      } catch (handlerError) {
        showToast.error('Failed to delete note');
      }
      return false;
    }
  },

  clearAllNotes: async (productId?: number) => {
    const token = getCookie('access_token');
    if (!token) {
      showToast.error('Please log in to clear notes.');
      return;
    }

    try {
      // vehicleId removed - notes are only linked to products
      const response = await notesService.clearAllNotes(productId);
      if (response.success) {
        // Determine current user identifiers (email & numeric ID)
        const tokenValue = getCookie('access_token') || getCookie('token');
        let currentUserEmail: string | null = null;
        let currentUserId: number | null = null;

        if (tokenValue) {
          try {
            const decoded: any = jwtDecode(tokenValue);
            currentUserEmail =
              decoded.email ||
              decoded['https://wegwiser-api/email'] ||
              decoded['http://wegwiser-api/email'] ||
              decoded['https://wegwiser.ai/email'] ||
              decoded['http://wegwiser.ai/email'] ||
              null;

            if (decoded.id) {
              const parsed = Number(decoded.id);
              currentUserId = isNaN(parsed) ? null : parsed;
            } else if (decoded.sub) {
              const subParts = decoded.sub.split('|');
              const parsed = Number(subParts[subParts.length - 1]);
              currentUserId = isNaN(parsed) ? null : parsed;
            }
          } catch (decodeError) {
            // Ignore decoding issues; fallback to email when possible
            currentUserId = null;
          }
        }

        const chosenProductId =
          productId ??
          useProductStore.getState().chosenProduct?.id ??
          null;

        // vehicleId removed - notes are only linked to products

        set((state) => {
          const filteredNotes = state.notes.filter(note => {
            const matchesProduct = chosenProductId
              ? note.productId === chosenProductId
              : true;

            // vehicleId removed - notes are only linked to products
            const ownerIdMatch =
              currentUserId !== null && Number(note.ownerId) === currentUserId;
            const ownerEmailMatch =
              currentUserEmail && note.owner?.email === currentUserEmail;

            const isOwnedByUser = ownerIdMatch || ownerEmailMatch;

            // Only remove notes owned by the user within the selected product scope
            if (matchesProduct && isOwnedByUser) {
              return false;
            }

            return true;
          });

          return { notes: filteredNotes };
        });

        // Reset the canvas state so removed notes disappear immediately
        const message = chosenProductId
          ? 'All of your notes for this product were deleted.'
          : 'All of your notes were deleted.';
        showToast.success(message);

        if (chosenProductId) {
          await get().fetchNotes(chosenProductId);
        } else {
          set({ notes: [] });
        }
      } else {
        showToast.error(response.error || 'Failed to delete notes.');
      }
    } catch (error: any) {
      try {
        handleProductApiError(error, 'Failed to clear notes');
      } catch (handlerError) {
        showToast.error('Failed to delete notes');
      }
    }
  },
}));
