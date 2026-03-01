import { create } from 'zustand';

interface SliderStore {
  isShown: boolean;
  isShowEngineering: boolean;
  isShowProduct: boolean;
  isShowDesign: boolean;
  hideAllTabs: () => void;
  setShowEngineering: () => void;
  setShowProduct: () => void;
  setShowDesign: () => void;
}

export const useSliderStore = create<SliderStore>((set) => ({
  isShown: false,
  isShowEngineering: false,
  isShowProduct: false,
  isShowDesign: false,

  hideAllTabs: () =>
    set({
      isShowEngineering: false,
      isShowProduct: false,
      isShowDesign: false,
      isShown: false,
    }),

  setShowEngineering: () =>
    set({
      isShown: true,
      isShowEngineering: true,
    }),

  setShowProduct: () =>
    set({
      isShowProduct: true,
    }),

  setShowDesign: () =>
    set({
      isShowDesign: true,
    }),
}));
