import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import { CanvasInstance } from '@/workspaces/designWorkspace/types/canvasTypes';
import { useCallback, useEffect, useRef } from 'react';
import { designWorkspaceService } from '../api/designWorkspaceService';
import { useSelectedVehicleStore } from '@/entities/vehicle/selectedVehicleStore';

interface UseCanvasAutoSaveProps {
  layerId?: number;
  pageId?: number;
  enabled?: boolean;
  debounceMs?: number;
}

const canvasInstanceToElement = (instance: CanvasInstance, order: number) => {
  const baseElement = {
    type: instance.type,
    order,
  };

  if (instance.type === 'group') {
    return {
      ...baseElement,
      properties: {},
      position: { x: 0, y: 0 },
      size: { width: 0, height: 0 },
    };
  }

  // For shape instances with object property
  if ('object' in instance && instance.object) {
    const obj = instance.object as any;
    return {
      ...baseElement,
      properties: {
        fill: obj.fill || '#000000',
        stroke: obj.stroke || '#000000',
        strokeWidth: obj.strokeWidth || 1,
        ...obj,
      },
      position: {
        x: obj.x || 0,
        y: obj.y || 0,
      },
      size: {
        width: obj.width || obj.radius * 2 || 100,
        height: obj.height || obj.radius * 2 || 100,
      },
    };
  }

  return baseElement;
};

const elementToCanvasInstance = (element: any): CanvasInstance | null => {
  const baseInstance = {
    id: `element-${element.id}`,
    name: element.type,
    type: element.type as any,
  };

  if (element.type === 'group') {
    return {
      ...baseInstance,
      type: 'group',
      children: [],
      isOpen: true,
    } as CanvasInstance;
  }

  // For shape instances
  const object = {
    ...element.properties,
    x: element.position?.x || 0,
    y: element.position?.y || 0,
    width: element.size?.width || 100,
    height: element.size?.height || 100,
  };

  return {
    ...baseInstance,
    object,
  } as CanvasInstance;
};

export function useCanvasAutoSave({
  layerId,
  pageId,
  enabled = true,
  debounceMs = 2000,
}: UseCanvasAutoSaveProps) {
  const { layers } = useCanvasLayersStore();
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousLayersRef = useRef<string>('');
  const elementIdsRef = useRef<Map<string, number>>(new Map()); // Map canvas instance ID to backend element ID
  const isSavingRef = useRef<boolean>(false); // Prevent concurrent saves

  const flattenInstances = useCallback((instances: CanvasInstance[]): CanvasInstance[] => {
    const result: CanvasInstance[] = [];
    instances.forEach((instance) => {
      result.push(instance);
      if (instance.type === 'group' && instance.children) {
        result.push(...flattenInstances(instance.children));
      }
    });
    return result;
  }, []);

  const saveCanvasState = useCallback(async () => {
    if (!layerId || !enabled) return;
    
    // Prevent concurrent saves
    if (isSavingRef.current) {
      console.log('[AutoSave] Save already in progress, skipping...');
      return;
    }

    try {
      isSavingRef.current = true;
      
      // Get current layers from store at the time of save
      const currentLayers = useCanvasLayersStore.getState().layers;
      
      // Don't save if layers are empty
      if (!currentLayers || currentLayers.length === 0) {
        return;
      }
      
      const flatInstances = flattenInstances(currentLayers);
      
      // Save each instance as a design element
      for (let i = 0; i < flatInstances.length; i++) {
        const instance = flatInstances[i];
        const elementData = canvasInstanceToElement(instance, i);
        
        const existingElementId = elementIdsRef.current.get(instance.id);
        
        if (existingElementId) {
          // Update existing element
          await designWorkspaceService.updateDesignElement(existingElementId, elementData);
        } else {
          // Create new element
          const { selectedVehicleId } = useSelectedVehicleStore.getState();
          const elementDataWithVehicle = {
            ...elementData,
            vehicleId: selectedVehicleId || undefined
          };
          const response = await designWorkspaceService.createDesignElement(layerId, elementDataWithVehicle);
          if (response.success && response.element) {
            elementIdsRef.current.set(instance.id, response.element.id);
          }
        }
      }
      
    } catch (error) {
      console.error('Error auto-saving canvas state:', error);
    } finally {
      isSavingRef.current = false;
    }
  }, [layerId, enabled, flattenInstances]);

  // Store the latest save function in a ref to avoid dependency issues
  const saveCanvasStateRef = useRef(saveCanvasState);
  useEffect(() => {
    saveCanvasStateRef.current = saveCanvasState;
  }, [saveCanvasState]);

  // Debounced auto-save
  useEffect(() => {
    if (!enabled || !layerId) return;

    // Skip auto-save if AI is generating/editing (to prevent conflicts)
    const { isAIGenerated } = useCanvasLayersStore.getState();
    if (isAIGenerated) {
      console.log('[AutoSave] Skipping save - AI operation in progress');
      return;
    }

    const layersString = JSON.stringify(layers);
    
    // Only save if layers have actually changed
    if (layersString === previousLayersRef.current) return;
    
    previousLayersRef.current = layersString;

    // Clear existing timeout
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    // Set new timeout for debounced save
    saveTimeoutRef.current = setTimeout(() => {
      // Use ref to get latest function without causing re-renders
      saveCanvasStateRef.current();
    }, debounceMs);

    // Cleanup
    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [layers, enabled, layerId, debounceMs]);

  const loadCanvasState = useCallback(async () => {
    if (!layerId && !pageId) {
      return;
    }

    try {
      if (layerId) {
        const { selectedVehicleId } = useSelectedVehicleStore.getState();
        const response = await designWorkspaceService.getLayerElements(layerId, selectedVehicleId || undefined);
        
        if (response.success && response.elements) {
          const canvasInstances = response.elements
            .map(elementToCanvasInstance)
            .filter(Boolean) as CanvasInstance[];
          
          useCanvasLayersStore.setState({ layers: canvasInstances });
          
          response.elements.forEach((element) => {
            elementIdsRef.current.set(`element-${element.id}`, element.id);
          });
          
        } else {
          useCanvasLayersStore.setState({ layers: [] });
        }
      } else if (pageId) {
        const response = await designWorkspaceService.getPageAllLayersElements(pageId);
        
        if (response.success && response.elements) {
          const canvasInstances = response.elements
            .map(elementToCanvasInstance)
            .filter(Boolean) as CanvasInstance[];
          
          useCanvasLayersStore.setState({ layers: canvasInstances });
          
          response.elements.forEach((element) => {
            elementIdsRef.current.set(`element-${element.id}`, element.id);
          });
        } else {
          useCanvasLayersStore.setState({ layers: [] });
        }
      }
    } catch (error) {
      console.error('Error loading canvas state:', error);
    }
  }, [layerId, pageId]);

  useEffect(() => {
    const { isAIGenerated } = useCanvasLayersStore.getState();
    if (isAIGenerated) {
      return;
    }
    
    if (pageId && !layerId && enabled) {
      useCanvasLayersStore.setState({ layers: [] });
      elementIdsRef.current.clear();
    }
  }, [pageId, layerId, enabled]);

  useEffect(() => {
    const { isAIGenerated } = useCanvasLayersStore.getState();
    if (isAIGenerated) {
      return;
    }
    
    if (layerId && enabled) {
      loadCanvasState();
    }
  }, [layerId, enabled, loadCanvasState]);

  return {
    saveCanvasState,
    loadCanvasState,
    isSaving: false, // Could add a loading state if needed
  };
}
