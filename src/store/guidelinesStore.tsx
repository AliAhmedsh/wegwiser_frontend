import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface GuideLinesStore {
  isGuidelining: boolean;
  step: number;
  tutorialCompleted: boolean;
  incrementStep: () => void;
  setIsGuidelining: (value: boolean) => void;
  setStepOne: () => void;
  setTutorialCompleted: (value: boolean) => void;
}

export const useGuidelineStore = create<GuideLinesStore>()(
  persist(
    (set, get) => ({
      isGuidelining: false, // Default to false, will be set by Home component based on user status
      step: 1,
      tutorialCompleted: false,

      incrementStep: () => set({ step: get().step + 1 }),
      setIsGuidelining: (value) => {
        // Only update isGuidelining, don't automatically mark as completed
        // Tutorial will only be marked as completed when user clicks Skip or Done
        set({ isGuidelining: value });
      },
      setStepOne: () => set({ step: 1 }),
      setTutorialCompleted: (value) => set({ tutorialCompleted: value }),
    }),
    {
      name: 'guideline-storage',
      partialize: (state) => ({
        isGuidelining: state.isGuidelining,
        step: state.step,
        tutorialCompleted: state.tutorialCompleted,
      }),
    }
  )
);
