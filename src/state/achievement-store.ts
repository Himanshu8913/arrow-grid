import { create } from "zustand";
import { persist } from "zustand/middleware";

import { ACHIEVEMENTS } from "@/data/achievements";
import {
  createInitialAchievementState,
  type AchievementId,
  type AchievementUnlockState,
} from "@/types/achievement";
import { getNewlyUnlockedAchievements } from "@/utils/achievements";

interface AchievementStore extends AchievementUnlockState {
  unlockAchievements: (ids: AchievementId[]) => AchievementId[];
  checkAndUnlock: (
    context: Parameters<typeof getNewlyUnlockedAchievements>[1],
  ) => AchievementId[];
  resetAchievements: () => void;
  isUnlocked: (id: AchievementId) => boolean;
}

/**
 * Persistent achievement progress.
 */
export const useAchievementStore = create<AchievementStore>()(
  persist(
    (set, get) => ({
      ...createInitialAchievementState(),
      unlockAchievements: (ids) => {
        if (ids.length === 0) {
          return [];
        }

        const state = get();
        const existing = new Set(state.unlockedIds);
        const nextIds = ids.filter((id) => !existing.has(id));

        if (nextIds.length === 0) {
          return [];
        }

        const unlockedAt = { ...state.unlockedAt };
        const timestamp = Date.now();

        nextIds.forEach((id) => {
          unlockedAt[id] = timestamp;
        });

        set({
          unlockedIds: [...state.unlockedIds, ...nextIds],
          unlockedAt,
        });

        return nextIds;
      },
      checkAndUnlock: (context) => {
        const newlyUnlocked = getNewlyUnlockedAchievements(
          get().unlockedIds,
          context,
        );

        return get().unlockAchievements(newlyUnlocked);
      },
      resetAchievements: () => set(createInitialAchievementState()),
      isUnlocked: (id) => get().unlockedIds.includes(id),
    }),
    {
      name: "arrow-grid-achievements",
    },
  ),
);

export function getAchievementCompletionPercent(unlockedIds: AchievementId[]) {
  if (ACHIEVEMENTS.length === 0) {
    return 0;
  }

  return Math.round((unlockedIds.length / ACHIEVEMENTS.length) * 100);
}
