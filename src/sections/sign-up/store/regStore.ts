import { create } from 'zustand';

interface regStore {
  name: string;
  surname: string;
  accuratePosition: string;
  isManager: boolean;
  email: string;
  position: string;
  shortName: string;
  setName: (name: string) => void;
  setSurname: (surname: string) => void;
  setAccuratePosition: (accuratePosition: string) => void;
  setIsManager: (isManager: boolean) => void;
  setEmail: (email: string) => void;
  setPosition: (position: string) => void;
  setShortName: (shortName: string) => void;
  resetRegState: () => void;
}

const useRegStore = create<regStore>((set) => ({
  name: '',
  surname: '',
  accuratePosition: '',
  isManager: false,
  email: '',
  position: '',
  shortName: '',
  isShowAiWindow: false,
  setName: (name: string) => {
    set(() => ({
      name,
    }));
  },
  setSurname: (surname: string) => {
    set(() => ({
      surname,
    }));
  },
  setAccuratePosition: (accuratePosition: string) => {
    set(() => ({
      accuratePosition,
    }));
  },
  setIsManager: (isManager: boolean) => {
    set(() => ({
      isManager,
    }));
  },
  setEmail: (email: string) => {
    set(() => ({
      email,
    }));
  },
  setPosition: (position: string) => {
    set(() => ({
      position,
    }));
  },
  setShortName: (shortName: string) => {
    set(() => ({
      shortName,
    }));
  },
  resetRegState: () => set({
    name: '',
    surname: '',
    accuratePosition: '',
    isManager: false,
    email: '',
    position: '',
    shortName: '',
  }),
}));

export default useRegStore;
