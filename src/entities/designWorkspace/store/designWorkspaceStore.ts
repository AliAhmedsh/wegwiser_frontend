import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { DesignLayer, DesignPage } from '../api/designWorkspaceService';

interface LayerState {
  id: string;
  name: string;
  type: 'element' | 'group';
  children?: LayerState[];
  selected?: boolean;
  expanded?: boolean;
  backendId?: number;
  parentId?: number;
}

interface DesignWorkspaceState {
  currentWorkspaceId: number | null;
  currentPageId: number | null;
  currentProductId: number | null;
  designWorkspaceId: number | null;
  selectedLayerId: number | null;
  
  pages: DesignPage[];
  currentPage: DesignPage | null;
  
  layers: LayerState[];
  
  editingLayer: string | null;
  editingLayerName: string;
  editingPage: number | null;
  editingPageName: string;
  
  isLoading: boolean;
  isCreatingLayer: boolean;
  isUpdatingLayer: boolean;
  isDeletingLayer: boolean;
  setCurrentWorkspace: (workspaceId: number) => void;
  setCurrentPage: (pageId: number) => void;
  setDesignWorkspaceId: (workspaceId: number) => void;
  setSelectedLayerId: (layerId: number | null) => void;
  setPages: (pages: DesignPage[]) => void;
  setCurrentPageData: (page: DesignPage) => void;
  setLayers: (layers: LayerState[]) => void;
  
  addLayer: (layer: LayerState) => void;
  addChildLayer: (parentId: string, child: LayerState) => void;
  updateLayer: (layerId: string, updates: Partial<LayerState>) => void;
  deleteLayer: (layerId: string) => void;
  selectLayer: (layerId: string) => void;
  toggleLayerExpansion: (layerId: string) => void;
  
  startEditingLayer: (layerId: string, currentName: string) => void;
  saveLayerEdit: (layerId: string, newName: string) => void;
  cancelLayerEdit: () => void;
  setEditingLayerName: (name: string) => void;
  
  startEditingPage: (pageIndex: number, currentName: string) => void;
  savePageEdit: (pageIndex: number, newName: string) => void;
  cancelPageEdit: () => void;
  setEditingPageName: (name: string) => void;
  
  setLoading: (loading: boolean) => void;
  setCreatingLayer: (creating: boolean) => void;
  setUpdatingLayer: (updating: boolean) => void;
  setDeletingLayer: (deleting: boolean) => void;
  convertBackendLayersToFrontend: (backendLayers: DesignLayer[]) => LayerState[];
  convertFrontendLayersToBackend: (frontendLayers: LayerState[]) => DesignLayer[];
  getLayerOrder: () => number[];
}

// Recursive function to convert a single backend layer (including its children) to frontend format
const convertSingleLayer = (backendLayer: DesignLayer, layerMap: Map<number, LayerState>): LayerState => {
  // Check if already converted
  if (layerMap.has(backendLayer.id)) {
    return layerMap.get(backendLayer.id)!;
  }
  
  // Convert children recursively if they exist
  const children: LayerState[] = backendLayer.children 
    ? backendLayer.children.map(child => convertSingleLayer(child, layerMap))
    : [];
  
  // Create frontend layer
  const frontendLayer: LayerState = {
    id: `layer-${backendLayer.id}`,
    name: backendLayer.name,
    type: children.length > 0 ? 'group' : 'element',
    backendId: backendLayer.id,
    parentId: backendLayer.parentId || undefined,
    selected: false,
    expanded: false, // Default to closed - user can expand manually
    children: children.length > 0 ? children : undefined
  };
  
  // Store in map
  layerMap.set(backendLayer.id, frontendLayer);
  
  return frontendLayer;
};

const convertBackendLayersToFrontend = (backendLayers: DesignLayer[]): LayerState[] => {
  const layerMap = new Map<number, LayerState>();
  const rootLayers: LayerState[] = [];
  
  // Process all layers (API returns root layers with nested children)
  backendLayers.forEach(layer => {
    const frontendLayer = convertSingleLayer(layer, layerMap);
    
    // Only add root layers (those without parentId or with parentId null)
    if (!layer.parentId) {
      rootLayers.push(frontendLayer);
    }
  });
  
  return rootLayers;
};

const flattenLayers = (layers: LayerState[], parentId?: number): LayerState[] => {
  const result: LayerState[] = [];
  
  layers.forEach((layer, index) => {
    const flatLayer = {
      ...layer,
      parentId: parentId ? parseInt(layer.id.replace('layer-', '')) : undefined
    };
    result.push(flatLayer);
    
    if (layer.children && layer.children.length > 0) {
      result.push(...flattenLayers(layer.children, layer.backendId));
    }
  });
  
  return result;
};

export const useDesignWorkspaceStore = create<DesignWorkspaceState>()(
  devtools(
    (set, get) => ({
      currentWorkspaceId: null,
      currentPageId: null,
      currentProductId: null,
      designWorkspaceId: null,
      selectedLayerId: null,
      pages: [],
      currentPage: null,
      layers: [],
      editingLayer: null,
      editingLayerName: '',
      editingPage: null,
      editingPageName: '',
      isLoading: false,
      isCreatingLayer: false,
      isUpdatingLayer: false,
      isDeletingLayer: false,
      
      setCurrentWorkspace: (workspaceId: number) => {
        set({ currentWorkspaceId: workspaceId });
      },
      
      setCurrentPage: (pageId: number) => {
        set({ currentPageId: pageId });
      },
      
      setDesignWorkspaceId: (workspaceId: number) => {
        set({ designWorkspaceId: workspaceId });
      },
      
      setSelectedLayerId: (layerId: number | null) => {
        set({ selectedLayerId: layerId });
      },
      
      setPages: (pages: DesignPage[]) => {
        set({ pages });
      },
      
      setCurrentPageData: (page: DesignPage) => {
        // Convert layers - if page.layers is undefined or empty, use empty array
        const pageLayers = page.layers || [];
        const frontendLayers = convertBackendLayersToFrontend(pageLayers);
        set({ 
          currentPage: page,
          currentPageId: page.id, // Also set currentPageId so layer creation works
          layers: frontendLayers // This will be empty array if no layers exist
        });
      },
      
      setLayers: (layers: LayerState[]) => {
        set({ layers });
      },
      
      addLayer: (layer: LayerState) => {
        set(state => ({
          layers: [...state.layers, layer]
        }));
      },
      
      addChildLayer: (parentId: string, child: LayerState) => {
        set(state => {
          const updateLayerChildren = (layers: LayerState[]): LayerState[] => {
            return layers.map(layer => {
              if (layer.id === parentId) {
                return {
                  ...layer,
                  type: 'group',
                  expanded: true,
                  children: [...(layer.children || []), child]
                };
              }
              return {
                ...layer,
                children: layer.children ? updateLayerChildren(layer.children) : undefined
              };
            });
          };
          
          return {
            layers: updateLayerChildren(state.layers)
          };
        });
      },
      
      updateLayer: (layerId: string, updates: Partial<LayerState>) => {
        set(state => {
          const updateLayerInTree = (layers: LayerState[]): LayerState[] => {
            return layers.map(layer => {
              if (layer.id === layerId) {
                return { ...layer, ...updates };
              }
              return {
                ...layer,
                children: layer.children ? updateLayerInTree(layer.children) : undefined
              };
            });
          };
          
          return {
            layers: updateLayerInTree(state.layers)
          };
        });
      },
      
      deleteLayer: (layerId: string) => {
        set(state => {
          const removeLayerFromTree = (layers: LayerState[]): LayerState[] => {
            return layers.filter(layer => {
              if (layer.id === layerId) {
                return false;
              }
              return {
                ...layer,
                children: layer.children ? removeLayerFromTree(layer.children) : undefined
              };
            });
          };
          
          return {
            layers: removeLayerFromTree(state.layers)
          };
        });
      },
      
      selectLayer: (layerId: string) => {
        set(state => {
          const updateLayerSelection = (layers: LayerState[]): LayerState[] => {
            return layers.map(layer => ({
              ...layer,
              selected: layer.id === layerId,
              children: layer.children ? updateLayerSelection(layer.children) : undefined
            }));
          };
          
          return {
            layers: updateLayerSelection(state.layers)
          };
        });
      },
      
      toggleLayerExpansion: (layerId: string) => {
        set(state => {
          const updateLayerExpansion = (layers: LayerState[]): LayerState[] => {
            return layers.map(layer => ({
              ...layer,
              expanded: layer.id === layerId ? !layer.expanded : layer.expanded,
              children: layer.children ? updateLayerExpansion(layer.children) : undefined
            }));
          };
          
          return {
            layers: updateLayerExpansion(state.layers)
          };
        });
      },
      
      startEditingLayer: (layerId: string, currentName: string) => {
        set({ editingLayer: layerId, editingLayerName: currentName });
      },
      
      saveLayerEdit: (layerId: string, newName: string) => {
        // Only update local state - API call will be handled by the component
        if (newName.trim()) {
          get().updateLayer(layerId, { name: newName.trim() });
        }
        set({ editingLayer: null, editingLayerName: '' });
      },
      
      cancelLayerEdit: () => {
        set({ editingLayer: null, editingLayerName: '' });
      },
      
      setEditingLayerName: (name: string) => {
        set({ editingLayerName: name });
      },
      
      startEditingPage: (pageIndex: number, currentName: string) => {
        set({ editingPage: pageIndex, editingPageName: currentName });
      },
      
      savePageEdit: (pageIndex: number, newName: string) => {
        if (newName.trim()) {
          set(state => {
            const updatedPages = [...state.pages];
            updatedPages[pageIndex] = { ...updatedPages[pageIndex], name: newName.trim() };
            return { pages: updatedPages };
          });
        }
        set({ editingPage: null, editingPageName: '' });
      },
      
      cancelPageEdit: () => {
        set({ editingPage: null, editingPageName: '' });
      },
      
      setEditingPageName: (name: string) => {
        set({ editingPageName: name });
      },
      
      setLoading: (loading: boolean) => {
        set({ isLoading: loading });
      },
      
      setCreatingLayer: (creating: boolean) => {
        set({ isCreatingLayer: creating });
      },
      
      setUpdatingLayer: (updating: boolean) => {
        set({ isUpdatingLayer: updating });
      },
      
      setDeletingLayer: (deleting: boolean) => {
        set({ isDeletingLayer: deleting });
      },
      
      convertBackendLayersToFrontend,
      
      convertFrontendLayersToBackend: (frontendLayers: LayerState[]) => {
        return flattenLayers(frontendLayers);
      },
      
      getLayerOrder: () => {
        const { layers } = get();
        const flattened = flattenLayers(layers);
        return flattened.map(layer => layer.backendId!).filter(Boolean);
      }
    }),
    {
      name: 'design-workspace-store',
    }
  )
);
