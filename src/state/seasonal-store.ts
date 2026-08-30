import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SAVE_KEYS } from "@/constants/save";
import {
  getSeasonalEventById,
} from "@/data/seasonal-events";
import { useCosmeticsStore } from "@/state/cosmetics-store";
import { useProfileStore } from "@/state/profile-store";
import type {
  SeasonalChallengeProgress,
  SeasonalEventId,
} from "@/types/seasonal";

interface SeasonalStore {
  progressByEvent: Partial<Record<SeasonalEventId, SeasonalChallengeProgress>>;
  recordWin: (eventId: SeasonalEventId) => SeasonalRewardResult | null;
  getProgress: (eventId: SeasonalEventId) => SeasonalChallengeProgress;
  resetSeasonal: () => void;
}

export interface SeasonalRewardResult {
  eventId: SeasonalEventId;
  coins: number;
  xp: number;
  cosmeticIds: string[];
}

export const DEFAULT_SEASONAL_PROGRESS: SeasonalChallengeProgress = {
  wins: 0,
  rewardClaimed: false,
};

function claimEventRewards(eventId: SeasonalEventId): SeasonalRewardResult | null {
  const event = getSeasonalEventById(eventId);

  if (!event) {
    return null;
  }

  for (const cosmeticId of event.cosmeticIds) {
    useCosmeticsStore.getState().unlock(cosmeticId);
  }

  useProfileStore
    .getState()
    .addRewards(event.rewardXp, event.rewardCoins);

  return {
    eventId,
    coins: event.rewardCoins,
    xp: event.rewardXp,
    cosmeticIds: event.cosmeticIds,
  };
}

export const useSeasonalStore = create<SeasonalStore>()(
  persist(
    (set, get) => ({
      progressByEvent: {},
      getProgress: (eventId) =>
        get().progressByEvent[eventId] ?? DEFAULT_SEASONAL_PROGRESS,
      recordWin: (eventId) => {
        const event = getSeasonalEventById(eventId);

        if (!event) {
          return null;
        }

        const current = get().getProgress(eventId);

        if (current.rewardClaimed) {
          return null;
        }

        const wins = current.wins + 1;
        const completed = wins >= event.challengeTarget;

        set((state) => ({
          progressByEvent: {
            ...state.progressByEvent,
            [eventId]: {
              wins,
              rewardClaimed: completed,
            },
          },
        }));

        if (!completed) {
          return null;
        }

        return claimEventRewards(eventId);
      },
      resetSeasonal: () => set({ progressByEvent: {} }),
    }),
    {
      name: SAVE_KEYS.seasonal,
    },
  ),
);
