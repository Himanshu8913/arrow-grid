import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SAVE_KEYS } from "@/constants/save";
import { createDefaultProfile, type PlayerProfile } from "@/types/profile";

interface ProfileStore extends PlayerProfile {
  setDisplayName: (displayName: string) => void;
  resetProfile: () => void;
}

/**
 * Persisted player identity shown in profile and match UI.
 */
export const useProfileStore = create<ProfileStore>()(
  persist(
    (set) => ({
      ...createDefaultProfile(),
      setDisplayName: (displayName) => set({ displayName }),
      resetProfile: () => set(createDefaultProfile()),
    }),
    {
      name: SAVE_KEYS.profile,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<PlayerProfile>),
      }),
    },
  ),
);
