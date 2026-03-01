import { create } from 'zustand';

interface workSpaceStore {
  isFullScreen: boolean;
  setFullScreen: (value: boolean) => void;
  fullScreenStyles: string;
  notFullScreenStyles: string;
}

const useWorkspaceStore = create<workSpaceStore>((set) => ({
  isFullScreen: false,
  fullScreenStyles: 'scale-100 rounded-0 transition-all duration-300',
  notFullScreenStyles: 'scale-85 rounded-[12px] transition-all duration-300',
  setFullScreen: (value) => set({ isFullScreen: value }),
}));

export default useWorkspaceStore;
