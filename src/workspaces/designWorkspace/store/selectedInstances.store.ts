// store/useToolStore.ts
import { create } from 'zustand';

import { CanvasInstance } from '@/workspaces/designWorkspace/types';

interface SelectedInstancesStore {
  selectedInstancesIds: string[];
  selectedInstance: CanvasInstance | null;
  setSelectedInstance: (instance: CanvasInstance) => void;
  setSelectedInstancesIds: (ids: string[]) => void;
  removeSelectedInstance: () => void;
}

export const useSelectedInstances = create<SelectedInstancesStore>((set) => ({
  selectedInstancesIds: [],
  selectedInstance: null,
  setSelectedInstance: (instance: CanvasInstance) => set({selectedInstance:instance}),
  setSelectedInstancesIds: (ids: string[]) => set({selectedInstancesIds:ids}),
  removeSelectedInstance: () => set({selectedInstance:null}),
}));
