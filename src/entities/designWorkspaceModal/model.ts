import { create } from 'zustand';

interface DesignWorkspaceModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useDesignWorkspaceModalStore = create<DesignWorkspaceModalState>(
  (set) => ({
    isOpen: false,
    openModal: () => set({ isOpen: true }),
    closeModal: () => set({ isOpen: false }),
  })
);
