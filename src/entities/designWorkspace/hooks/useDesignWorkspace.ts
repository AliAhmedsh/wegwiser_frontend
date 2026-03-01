import { showToast } from '@/lib/utils/toast';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  CreateLayerRequest,
  CreatePageRequest,
  designWorkspaceService,
  ReorderLayersRequest,
  UpdateLayerRequest,
  UpdatePageRequest
} from '../api/designWorkspaceService';
import { useDesignWorkspaceStore } from '../store/designWorkspaceStore';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';

export const designWorkspaceKeys = {
  all: ['design-workspace'] as const,
  pages: (productId: number, vehicleId?: number) => [...designWorkspaceKeys.all, 'pages', productId, vehicleId] as const,
  page: (pageId: number) => [...designWorkspaceKeys.all, 'page', pageId] as const,
  layers: (pageId: number) => [...designWorkspaceKeys.all, 'layers', pageId] as const,
};

export function useDesignPages(productId: number, vehicleId?: number) {
  const { setPages, setLoading, setDesignWorkspaceId, setCurrentPageData } = useDesignWorkspaceStore();
  
  const query = useQuery({
    queryKey: designWorkspaceKeys.pages(productId, vehicleId),
    queryFn: async () => {
      // Early return if vehicleId is not provided
      if (!vehicleId) {
        throw new Error('vehicleId is required');
      }
      setLoading(true);
      const { currentPageId } = useDesignWorkspaceStore.getState();
      // Pass currentPageId to the API so backend knows which page is selected
      const response = await designWorkspaceService.getPages(productId, vehicleId, currentPageId || undefined);
      if (response.success) {
        setPages(response.pages);
        if (response.workspaceId) {
          setDesignWorkspaceId(response.workspaceId);
        }
        
        // Clear layers if no pages exist
        if (response.pages.length === 0) {
          const { setLayers } = useDesignWorkspaceStore.getState();
          setLayers([]);
          return response.pages;
        }
        
        // Only update currentPageData if currentPageId exists and matches a page
        const { currentPageId: latestCurrentPageId } = useDesignWorkspaceStore.getState();
        if (latestCurrentPageId) {
          const currentPage = response.pages.find(p => p.id === latestCurrentPageId);
          if (currentPage) {
            // Only update if the page data has changed (to avoid unnecessary re-renders)
            setCurrentPageData(currentPage);
          } else {
            // If currentPageId doesn't exist in pages, clear layers but don't change selection
            const { setLayers } = useDesignWorkspaceStore.getState();
            setLayers([]);
          }
        }
        // If no currentPageId, don't auto-select - let the component handle initial selection
        
        return response.pages;
      }
      throw new Error(response.error || 'Failed to fetch pages');
    },
    enabled: !!productId && !!vehicleId, // Only enable if vehicleId is provided
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Fetch when component mounts
  });

  useEffect(() => {
    if (!query.isLoading) {
      setLoading(false);
    }
  }, [query.isLoading, setLoading]);

  return query;
}

export function useDesignPage(productId: number, pageId: number, enabled: boolean = false, vehicleId?: number) {
  const { setCurrentPageData, setLoading } = useDesignWorkspaceStore();
  
  const query = useQuery({
    queryKey: designWorkspaceKeys.page(pageId),
    queryFn: async () => {
      // Early return if vehicleId is not provided
      if (!vehicleId) {
        throw new Error('vehicleId is required');
      }
      setLoading(true);
      const response = await designWorkspaceService.getPage(productId, pageId, vehicleId);
      if (response.success) {
        // Only set page data if page exists and has valid data
        if (response.page) {
          setCurrentPageData(response.page);
          return response.page;
        } else {
          // If page is null/undefined, clear layers
          const { setLayers } = useDesignWorkspaceStore.getState();
          setLayers([]);
          throw new Error('Page not found');
        }
      }
      throw new Error(response.error || 'Failed to fetch page');
    },
    enabled: enabled && !!productId && !!pageId && !!vehicleId, // Only enable if vehicleId is provided
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Fetch when component mounts
  });

  useEffect(() => {
    if (!query.isLoading) {
      setLoading(false);
    }
  }, [query.isLoading, setLoading]);

  return query;
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  const { setCreatingLayer } = useDesignWorkspaceStore();
  
  return useMutation({
    mutationFn: async ({ productId, data }: { productId: number; data: CreatePageRequest }) => {
      setCreatingLayer(true);
      // Automatically add vehicleId if not already present
      const { selectedVehicleId } = useSelectedVehicleStore.getState();
      const pageData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (selectedVehicleId || undefined)
      };
      const response = await designWorkspaceService.createPage(productId, pageData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create page');
      }
      return response.page;
    },
    onSuccess: async (newPage, { productId }) => {
      // Invalidate and refetch pages to get the updated list
      const { selectedVehicleId } = useSelectedVehicleStore.getState();
      // Only refetch if vehicleId is available
      if (selectedVehicleId) {
        await queryClient.invalidateQueries({ queryKey: designWorkspaceKeys.pages(productId, selectedVehicleId) });
        await queryClient.refetchQueries({ queryKey: designWorkspaceKeys.pages(productId, selectedVehicleId) });
      }
      showToast.success('Page created successfully');
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
    onSettled: () => {
      setCreatingLayer(false);
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  const { setUpdatingLayer } = useDesignWorkspaceStore();
  
  return useMutation({
    mutationFn: async ({ pageId, data }: { pageId: number; data: UpdatePageRequest }) => {
      setUpdatingLayer(true);
      const { selectedVehicleId } = useSelectedVehicleStore.getState();
      const pageData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (selectedVehicleId || undefined)
      };
      
      // vehicleId is required by backend
      if (!pageData.vehicleId) {
        throw new Error('vehicleId is required');
      }
      
      const response = await designWorkspaceService.updatePage(pageId, pageData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update page');
      }
      return response.page;
    },
    onSuccess: (updatedPage) => {
      // Get productId from the page's workspace or use selectedVehicleId to invalidate correctly
      const { selectedVehicleId } = useSelectedVehicleStore.getState();
      const { currentWorkspace } = useDesignWorkspaceStore.getState();
      // Try to get productId from currentWorkspace or use a fallback
      const productId = currentWorkspace || (updatedPage as any).workspace?.productId;
      queryClient.invalidateQueries({ queryKey: designWorkspaceKeys.page(updatedPage.id) });
      // Only invalidate if both productId and vehicleId are available
      if (productId && selectedVehicleId) {
        queryClient.invalidateQueries({ queryKey: designWorkspaceKeys.pages(productId, selectedVehicleId) });
      }
      showToast.success('Page updated successfully');
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
    onSettled: () => {
      setUpdatingLayer(false);
    },
  });
}

export function useCreateLayer() {
  const queryClient = useQueryClient();
  const { setCreatingLayer, addLayer, addChildLayer, setSelectedLayerId, toggleLayerExpansion } = useDesignWorkspaceStore();
  
  return useMutation({
    mutationFn: async ({ pageId, data }: { pageId: number; data: CreateLayerRequest }) => {
      setCreatingLayer(true);
      // Automatically add vehicleId if not already present
      const { selectedVehicleId } = useSelectedVehicleStore.getState();
      const layerData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (selectedVehicleId || undefined)
      };
      const response = await designWorkspaceService.createLayer(pageId, layerData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to create layer');
      }
      return response.layer;
    },
    onSuccess: async (newLayer, { data, pageId }) => {
      // Invalidate and refetch the page to get updated layers
      // This will automatically update the layers in the store via setCurrentPageData
      await queryClient.invalidateQueries({ queryKey: designWorkspaceKeys.page(pageId) });
      await queryClient.refetchQueries({ queryKey: designWorkspaceKeys.page(pageId) });
      
      // If this is a child layer, expand the parent so it's visible
      if (data.parentId) {
        const parentLayerId = `layer-${data.parentId}`;
        // Expand parent layer to show the new child
        setTimeout(() => {
          const { layers } = useDesignWorkspaceStore.getState();
          const findLayerById = (layerList: any[], targetId: string): any => {
            for (const layer of layerList) {
              if (layer.id === targetId) {
                return layer;
              }
              if (layer.children && layer.children.length > 0) {
                const found = findLayerById(layer.children, targetId);
                if (found) return found;
              }
            }
            return null;
          };
          
          const parentLayer = findLayerById(layers, parentLayerId);
          if (parentLayer && !parentLayer.expanded) {
            toggleLayerExpansion(parentLayerId);
          }
        }, 200);
      }
      
      // Automatically select the newly created layer after refetch
      // Use setTimeout to ensure refetch completes first
      setTimeout(() => {
        setSelectedLayerId(newLayer.id);
      }, 100);
      
      showToast.success('Layer created successfully');
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
    onSettled: () => {
      setCreatingLayer(false);
    },
  });
}

export function useUpdateLayer() {
  const queryClient = useQueryClient();
  const { setUpdatingLayer, updateLayer, currentPageId } = useDesignWorkspaceStore();
  
  return useMutation({
    mutationFn: async ({ layerId, data }: { layerId: number; data: UpdateLayerRequest }) => {
      setUpdatingLayer(true);
      const { selectedVehicleId } = useSelectedVehicleStore.getState();
      const { currentPageId: latestCurrentPageId } = useDesignWorkspaceStore.getState();
      
      const layerData = {
        ...data,
        vehicleId: data.vehicleId !== undefined ? data.vehicleId : (selectedVehicleId || undefined),
        pageId: data.pageId !== undefined ? data.pageId : (latestCurrentPageId || undefined)
      };
      
      // vehicleId is required by backend
      if (!layerData.vehicleId) {
        throw new Error('vehicleId is required');
      }
      
      // pageId is required (layer belongs to a page)
      if (!layerData.pageId) {
        throw new Error('pageId is required');
      }
      
      const response = await designWorkspaceService.updateLayer(layerId, layerData);
      if (!response.success) {
        throw new Error(response.error || 'Failed to update layer');
      }
      return response.layer;
    },
    onSuccess: (updatedLayer) => {
      queryClient.invalidateQueries({ queryKey: designWorkspaceKeys.page(updatedLayer.pageId) });
      
      const frontendLayerId = `layer-${updatedLayer.id}`;
      updateLayer(frontendLayerId, {
        name: updatedLayer.name,
        backendId: updatedLayer.id
      });
      
      showToast.success('Layer updated successfully');
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
    onSettled: () => {
      setUpdatingLayer(false);
    },
  });
}

export function useDeleteLayer() {
  const queryClient = useQueryClient();
  const { setDeletingLayer, deleteLayer } = useDesignWorkspaceStore();
  
  return useMutation({
    mutationFn: async (layerId: number) => {
      setDeletingLayer(true);
      const response = await designWorkspaceService.deleteLayer(layerId);
      if (!response.success) {
        throw new Error(response.error || 'Failed to delete layer');
      }
      return layerId;
    },
    onSuccess: (deletedLayerId) => {
      queryClient.invalidateQueries({ queryKey: designWorkspaceKeys.all });
      
      const frontendLayerId = `layer-${deletedLayerId}`;
      deleteLayer(frontendLayerId);
      
      showToast.success('Layer deleted successfully');
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
    onSettled: () => {
      setDeletingLayer(false);
    },
  });
}

export function useReorderLayers() {
  const queryClient = useQueryClient();
  const { setLoading } = useDesignWorkspaceStore();
  
  return useMutation({
    mutationFn: async ({ pageId, data }: { pageId: number; data: ReorderLayersRequest }) => {
      setLoading(true);
      const response = await designWorkspaceService.reorderLayers(pageId, data);
      if (!response.success) {
        throw new Error(response.error || 'Failed to reorder layers');
      }
      return response;
    },
    onSuccess: (_, { pageId }) => {
      queryClient.invalidateQueries({ queryKey: designWorkspaceKeys.page(pageId) });
      showToast.success('Layers reordered successfully');
    },
    onError: (error: Error) => {
      showToast.error(error.message);
    },
    onSettled: () => {
      setLoading(false);
    },
  });
}

export function useDesignWorkspace(productId?: number, pageId?: number, enablePageQuery: boolean = false) {
  const { selectedVehicleId } = useSelectedVehicleStore();
  const pagesQuery = useDesignPages(productId!, selectedVehicleId || undefined);
  const pageQuery = useDesignPage(productId!, pageId!, enablePageQuery, selectedVehicleId || undefined);
  
  const createPage = useCreatePage();
  const updatePage = useUpdatePage();
  const createLayer = useCreateLayer();
  const updateLayer = useUpdateLayer();
  const deleteLayer = useDeleteLayer();
  const reorderLayers = useReorderLayers();
  
  const currentPage = pageId && pagesQuery.data ? pagesQuery.data.find((p: any) => p.id === pageId) : undefined;
  
  return {
    pages: pagesQuery.data || [],
    currentPage: currentPage || pageQuery.data,
    isLoadingPages: pagesQuery.isLoading,
    isLoadingPage: pageQuery.isLoading,
    isError: pagesQuery.isError || pageQuery.isError,
    error: pagesQuery.error || pageQuery.error,
    
    createPage: createPage.mutate,
    updatePage: updatePage.mutate,
    createLayer: createLayer.mutate,
    updateLayer: updateLayer.mutate,
    deleteLayer: deleteLayer.mutate,
    reorderLayers: reorderLayers.mutate,
    
    isCreatingPage: createPage.isPending,
    isUpdatingPage: updatePage.isPending,
    isCreatingLayer: createLayer.isPending,
    isUpdatingLayer: updateLayer.isPending,
    isDeletingLayer: deleteLayer.isPending,
    isReorderingLayers: reorderLayers.isPending,
    
    refreshPages: pagesQuery.refetch,
    refreshPage: pageQuery.refetch,
  };
}
