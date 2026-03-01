import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { UserProfile } from './api/userService';

interface ProfileStore {
  profile: UserProfile | null;
  setProfile: (profile: UserProfile | null) => void;
  clearProfile: () => void;
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      profile: null,
      setProfile: (profile) => {
        set({ profile });
      },
      clearProfile: () => {
        set({ profile: null });
      },
    }),
    {
      name: 'profile-store',
      version: 1,
    }
  )
);

