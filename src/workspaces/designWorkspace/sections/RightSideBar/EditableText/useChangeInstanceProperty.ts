import { useCanvasLayersStore } from '@/workspaces/designWorkspace/store/useCanvasLayers.store';
import type { CanvasInstance } from '@/workspaces/designWorkspace/types';

export const useChangeInstanceObjectProperty = () => {
  const { updateInstance } = useCanvasLayersStore();

  /**
   * Update one property inside instance.object
   */
  const changeObjectProperty = <O extends keyof NonNullable<CanvasInstance['object']>>(
    id: string,
    key: O,
    value: NonNullable<CanvasInstance['object']>[O]
  ) => {
    updateInstance(id, (instance) => {
      // if (!instance.object) return instance;
      return {
        ...instance,
        object: {
          ...instance.object,
          [key]: value,
        },
      } as CanvasInstance;
    });
  };

  return {
    changeObjectProperty,
  };
};
