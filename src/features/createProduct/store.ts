import { create } from 'zustand';

import { Member } from '@/entities/product/model/types';

interface CreationProductStore {
  step: number;
  name: string;
  members: Member[];
  materialLink: string;
  materialFiles: File[] | [];
  prdContent: string;
  skippedPRDStep: boolean;
  incrementStep: () => void;
  decrimentStep: () => void;
  setName: (value: string) => void;
  setMaterialLink: (value: string) => void;
  addMaterialFile: (value: File) => void;
  deleteMaterialFile: (index: number) => void;
  addMember: (member: Member) => void;
  removeMember: (index: number) => void;
  setMembers: (members: Member[]) => void;
  batchAddMembers: (members: Member[]) => void;
  setPrdContent: (content: string) => void;
  setSkippedPRDStep: (skipped: boolean) => void;
  resetAll: () => void;
}

export const useCreationProductStore = create<CreationProductStore>(
  (set, get) => ({
    step: 1,
    name: '',
    materialLink: '',
    materialFiles: [],
    members: [],
    prdContent: '',
    skippedPRDStep: false,
    incrementStep: () => set({ step: get().step + 1 }),
    decrimentStep: () => set({ step: get().step - 1 }),
    setName: (value) => set({ name: value }),
    setMaterialLink: (value) => set({ materialLink: value }),
    addMaterialFile: (value) =>
      set({ materialFiles: [...get().materialFiles, value] }),
    deleteMaterialFile: (index) =>
      set({
        materialFiles: [
          ...get().materialFiles.filter(
            (item, itemIndex) => index !== itemIndex
          ),
        ],
      }),
    addMember: (member) =>
      set((state) => ({ members: [...state.members, member] })),
    removeMember: (index) =>
      set((state) => ({
        members: state.members.filter((_, i) => i !== index),
      })),
    setMembers: (members) => set({ members }),
    batchAddMembers: (members) =>
      set({ members: [...get().members, ...members] }),
    setPrdContent: (content) => set({ prdContent: content }),
    setSkippedPRDStep: (skipped) => set({ skippedPRDStep: skipped }),
    resetAll: () =>
      set({
        name: '',
        step: 1,
        materialLink: '',
        members: [],
        materialFiles: [],
        prdContent: '',
        skippedPRDStep: false,
      }),
  })
);
