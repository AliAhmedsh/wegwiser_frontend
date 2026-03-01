export type DependencyStatus = 'On track' | 'At risk';

export interface Dependency {
  id: string;
  title: string;
  description: string;
  status: DependencyStatus;
  progress: number; // 0..1
}

import { create } from 'zustand';

interface DependenciesState {
  dependencies: Dependency[];
  setDependencies: (deps: Dependency[]) => void;
}

export const useDependenciesStore = create<DependenciesState>((set) => ({
  dependencies: [],
  setDependencies: (dependencies) => set({ dependencies }),
}));
