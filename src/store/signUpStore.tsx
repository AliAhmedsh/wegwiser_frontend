import { create } from 'zustand';

interface InvitationData {
  productId: number | null;
  inviterName: string;
  productName: string;
  role: string;
}

interface signUpStore {
  isVeryfying: boolean;
  isVeryfied: boolean;
  email: string;
  invitationData: InvitationData | null;
  setEmail: (value: string) => void;
  setIsVeryfying: (value: boolean) => void;
  setIsVeryfied: (value: boolean) => void;
  setInvitationData: (data: InvitationData | null) => void;
  clearInvitationData: () => void;
  resetSignUpState: () => void;
}

export const useSignUpStore = create<signUpStore>((set) => ({
  isVeryfying: false,
  isVeryfied: false,
  email: '',
  invitationData: null,
  setIsVeryfying: (value: boolean) => set({ isVeryfying: value }),
  setIsVeryfied: (value: boolean) => set({ isVeryfied: value }),
  setEmail: (value: string) => set({ email: value }),
  setInvitationData: (data: InvitationData | null) => set({ invitationData: data }),
  clearInvitationData: () => set({ invitationData: null }),
  resetSignUpState: () => set({ 
    isVeryfying: false, 
    isVeryfied: false, 
    email: '', 
    invitationData: null 
  }),
}));
