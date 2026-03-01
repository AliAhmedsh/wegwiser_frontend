import { showToast } from '@/lib/utils/toast';
import { create } from 'zustand';
import { designFilesService, type CreateDesignFileRequest, type DesignFile, type UpdateDesignFileRequest } from './api';

interface DesignFilesStore {
  files: DesignFile[];
  isLoading: boolean;
  activeFetchKeys: Set<string>;
  fetchDesignFiles: (workspaceId: number, vehicleId?: number) => Promise<void>;
  fetchDesignFilesByProduct: (productId: number, vehicleId?: number) => Promise<void>;
  createDesignFile: (productId: number, data: CreateDesignFileRequest) => Promise<DesignFile | null>;
  updateDesignFile: (fileId: number, data: UpdateDesignFileRequest) => Promise<DesignFile | null>;
  deleteDesignFile: (fileId: number) => Promise<void>;
  clearFiles: () => void;
}

const addFetchKey = (keys: Set<string>, key: string) => {
  const next = new Set(keys);
  next.add(key);
  return next;
};

const removeFetchKey = (keys: Set<string>, key: string) => {
  const next = new Set(keys);
  next.delete(key);
  return next;
};

export const useDesignFilesStore = create<DesignFilesStore>((set, get) => ({
  files: [],
  isLoading: false,
  activeFetchKeys: new Set<string>(),

  fetchDesignFiles: async (workspaceId: number, vehicleId?: number) => {
    if (!workspaceId || Number.isNaN(workspaceId)) {
      return;
    }

    // vehicleId is required by backend
    if (!vehicleId) {
      showToast.error('Please select a vehicle first');
      return;
    }

    const fetchKey = `workspace-${workspaceId}-${vehicleId}`;
    if (get().activeFetchKeys.has(fetchKey)) {
      return;
    }

    set((state) => ({
      isLoading: true,
      activeFetchKeys: addFetchKey(state.activeFetchKeys, fetchKey),
    }));
    
    try {
      const response = await designFilesService.getDesignFiles(workspaceId, vehicleId);
      
      if (response.success) {
        set({ files: response.files });
      } else {
        if (response.error && !response.error.includes('404')) {
          showToast.error(response.error || 'Failed to fetch design files');
        }
        set({ files: [] });
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        showToast.error(error.message || 'Failed to fetch design files');
      }
    } finally {
      set((state) => {
        const nextKeys = removeFetchKey(state.activeFetchKeys, fetchKey);
        return {
          activeFetchKeys: nextKeys,
          isLoading: nextKeys.size > 0,
        };
      });
    }
  },

  fetchDesignFilesByProduct: async (productId: number, vehicleId?: number) => {
    if (!productId || Number.isNaN(productId)) {
      return;
    }

    // vehicleId is required by backend
    if (!vehicleId) {
      showToast.error('Please select a vehicle first');
      return;
    }

    const fetchKey = `product-${productId}-${vehicleId}`;
    if (get().activeFetchKeys.has(fetchKey)) {
      return;
    }

    set((state) => ({
      isLoading: true,
      activeFetchKeys: addFetchKey(state.activeFetchKeys, fetchKey),
    }));
    
    try {
      const response = await designFilesService.getDesignFilesByProduct(productId, vehicleId);

      if (response.success) {
        set({ files: response.files ?? [] });
      } else {
        if (response.error && !response.error.includes('404')) {
          showToast.error(response.error || 'Failed to fetch design files');
        }
        set({ files: [] });
      }
    } catch (error: any) {
      if (error?.response?.status !== 404) {
        showToast.error(error.message || 'Failed to fetch design files');
      }
      set({ files: [] });
    } finally {
      set((state) => {
        const nextKeys = removeFetchKey(state.activeFetchKeys, fetchKey);
        return {
          activeFetchKeys: nextKeys,
          isLoading: nextKeys.size > 0,
        };
      });
    }
  },

  createDesignFile: async (productId: number, data: CreateDesignFileRequest) => {
    try {
      const response = await designFilesService.createDesignFile(productId, data);
      
      if (response.success) {
        const { files } = get();
        set({ files: [response.file, ...files] });
        showToast.success('Design file created successfully');
        return response.file;
      } else {
        showToast.error(response.error || 'Failed to create design file');
        return null;
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to create design file');
      return null;
    }
  },

  updateDesignFile: async (fileId: number, data: UpdateDesignFileRequest) => {
    try {
      const response = await designFilesService.updateDesignFile(fileId, data);
      
      if (response.success) {
        const { files } = get();
        const updatedFiles = files.map(file => 
          file.id === fileId ? response.file : file
        );
        set({ files: updatedFiles });
        showToast.success('Design file updated successfully');
        return response.file;
      } else {
        showToast.error(response.error || 'Failed to update design file');
        return null;
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to update design file');
      return null;
    }
  },

  deleteDesignFile: async (fileId: number) => {
    try {
      const response = await designFilesService.deleteDesignFile(fileId);
      
      if (response.success) {
        const { files } = get();
        const filteredFiles = files.filter(file => file.id !== fileId);
        set({ files: filteredFiles });
        showToast.success('Design file deleted successfully');
      } else {
        showToast.error(response.error || 'Failed to delete design file');
      }
    } catch (error: any) {
      showToast.error(error.message || 'Failed to delete design file');
    }
  },

  clearFiles: () => set({ files: [] }),
}));
