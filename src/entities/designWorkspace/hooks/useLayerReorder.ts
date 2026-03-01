import { useCallback } from 'react';
import { useDesignWorkspaceStore } from '../store/designWorkspaceStore';
import { useDesignWorkspace } from './useDesignWorkspace';

export function useLayerReorder(pageId: number) {
  const { layers, setLayers } = useDesignWorkspaceStore();
  const { reorderLayers } = useDesignWorkspace();

  const flattenLayers = useCallback((layers: any[], result: any[] = []): any[] => {
    layers.forEach(layer => {
      result.push(layer);
      if (layer.children && layer.children.length > 0) {
        flattenLayers(layer.children, result);
      }
    });
    return result;
  }, []);

  const saveLayerOrder = useCallback(async () => {
    const flattenedLayers = flattenLayers(layers);
    const layerIds = flattenedLayers
      .map(layer => layer.backendId)
      .filter(Boolean);
    
    if (layerIds.length > 0) {
      await reorderLayers({ pageId, data: { layerIds } });
    }
  }, [layers, pageId, reorderLayers, flattenLayers]);

  const moveLayerUp = useCallback((layerId: string) => {
    const updateLayerOrder = (layers: any[]): any[] => {
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].id === layerId && i > 0) {
          const newLayers = [...layers];
          [newLayers[i - 1], newLayers[i]] = [newLayers[i], newLayers[i - 1]];
          return newLayers;
        }
        
        if (layers[i].children) {
          const updatedChildren = updateLayerOrder(layers[i].children);
          if (updatedChildren !== layers[i].children) {
            return layers.map((layer, index) => 
              index === i ? { ...layer, children: updatedChildren } : layer
            );
          }
        }
      }
      return layers;
    };

    const newLayers = updateLayerOrder(layers);
    if (newLayers !== layers) {
      setLayers(newLayers);
      setTimeout(() => saveLayerOrder(), 100);
    }
  }, [layers, setLayers, saveLayerOrder]);

  const moveLayerDown = useCallback((layerId: string) => {
    const updateLayerOrder = (layers: any[]): any[] => {
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].id === layerId && i < layers.length - 1) {
          const newLayers = [...layers];
          [newLayers[i], newLayers[i + 1]] = [newLayers[i + 1], newLayers[i]];
          return newLayers;
        }
        
        if (layers[i].children) {
          const updatedChildren = updateLayerOrder(layers[i].children);
          if (updatedChildren !== layers[i].children) {
            return layers.map((layer, index) => 
              index === i ? { ...layer, children: updatedChildren } : layer
            );
          }
        }
      }
      return layers;
    };

    const newLayers = updateLayerOrder(layers);
    if (newLayers !== layers) {
      setLayers(newLayers);
      setTimeout(() => saveLayerOrder(), 100);
    }
  }, [layers, setLayers, saveLayerOrder]);

  const moveLayerToParent = useCallback((layerId: string, newParentId: string | null) => {
    const findAndRemoveLayer = (layers: any[]): { layer: any | null, newLayers: any[] } => {
      for (let i = 0; i < layers.length; i++) {
        if (layers[i].id === layerId) {
          const layer = layers[i];
          const newLayers = layers.filter((_, index) => index !== i);
          return { layer, newLayers };
        }
        
        if (layers[i].children) {
          const result = findAndRemoveLayer(layers[i].children);
          if (result.layer) {
            return {
              layer: result.layer,
              newLayers: layers.map((l, index) => 
                index === i ? { ...l, children: result.newLayers } : l
              )
            };
          }
        }
      }
      return { layer: null, newLayers: layers };
    };

    const addLayerToParent = (layers: any[], parentId: string | null, layer: any): any[] => {
      if (parentId === null) {
        return [...layers, layer];
      }
      
      return layers.map(l => {
        if (l.id === parentId) {
          return {
            ...l,
            type: 'group',
            expanded: true,
            children: [...(l.children || []), layer]
          };
        }
        if (l.children) {
          return {
            ...l,
            children: addLayerToParent(l.children, parentId, layer)
          };
        }
        return l;
      });
    };

    const { layer, newLayers } = findAndRemoveLayer(layers);
    if (layer) {
      const updatedLayers = addLayerToParent(newLayers, newParentId, layer);
      setLayers(updatedLayers);
      setTimeout(() => saveLayerOrder(), 100);
    }
  }, [layers, setLayers, saveLayerOrder]);

  return {
    moveLayerUp,
    moveLayerDown,
    moveLayerToParent,
    saveLayerOrder,
    flattenLayers: () => flattenLayers(layers)
  };
}
