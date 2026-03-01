import { create } from 'zustand';

interface MessagingModalState {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
}

export const useMessagingModalStore = create<MessagingModalState>((set) => ({
  isOpen: false,
  openModal: () => set({ isOpen: true }),
  closeModal: () => set({ isOpen: false }),
}));
