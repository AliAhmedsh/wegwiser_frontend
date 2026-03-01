import { create } from 'zustand';

interface InvitationStore {
  isAcceptingInvitation: boolean;
  setIsAcceptingInvitation: (value: boolean) => void;
}

export const useInvitationStore = create<InvitationStore>((set) => ({
  isAcceptingInvitation: false,
  setIsAcceptingInvitation: (value: boolean) => set({ isAcceptingInvitation: value }),
}));

