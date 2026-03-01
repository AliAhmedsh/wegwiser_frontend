// store/useUIStore.ts
import { create } from 'zustand';

interface UIStore {
  showMouseMenu: boolean;
  setShowMouseMenu: (v: boolean) => void;

  showShapeMenu: boolean;
  setShowShapeMenu: (v: boolean) => void;

  showTextMenu: boolean;
  setShowTextMenu: (v: boolean) => void;

  showFrameMenu: boolean;
  setShowFrameMenu: (v: boolean) => void;

  showInclinedMenu: boolean;
  setShowInclinedMenu: (v: boolean) => void;
  showPenMenu: boolean;
  setShowPenMenu: (v: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  showMouseMenu: false,
  setShowMouseMenu: (v) => set({ showMouseMenu: v }),

  showShapeMenu: false,
  setShowShapeMenu: (v) => set({ showShapeMenu: v }),

  showTextMenu: false,
  setShowTextMenu: (v) => set({ showTextMenu: v }),

  showFrameMenu: false,
  setShowFrameMenu: (v) => set({ showFrameMenu: v }),

  showInclinedMenu: false,
  setShowInclinedMenu: (v) => set({ showInclinedMenu: v }),
  showPenMenu: false,
  setShowPenMenu: (v) => set({ showPenMenu: v }),
}));
