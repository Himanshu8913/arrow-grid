import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  COSMETIC_CATALOG,
  DEFAULT_COSMETIC_IDS,
  getCosmeticById,
} from "@/data/cosmetics";
import { SAVE_KEYS } from "@/constants/save";
import { useAchievementStore } from "@/state/achievement-store";
import { useProfileStore } from "@/state/profile-store";
import type { CosmeticCategory, EquippedCosmetics } from "@/types/cosmetics";

interface CosmeticsStore {
  ownedIds: string[];
  equipped: EquippedCosmetics;
  unlock: (cosmeticId: string) => void;
  purchase: (cosmeticId: string) => boolean;
  equip: (cosmeticId: string) => boolean;
  syncAchievementUnlocks: () => void;
  resetCosmetics: () => void;
}

function createDefaultEquipped(): EquippedCosmetics {
  return { ...DEFAULT_COSMETIC_IDS };
}

function createDefaultOwnedIds(): string[] {
  return Object.values(DEFAULT_COSMETIC_IDS);
}

function isOwned(ownedIds: string[], cosmeticId: string): boolean {
  return ownedIds.includes(cosmeticId);
}

export const useCosmeticsStore = create<CosmeticsStore>()(
  persist(
    (set, get) => ({
      ownedIds: createDefaultOwnedIds(),
      equipped: createDefaultEquipped(),
      unlock: (cosmeticId) => {
        if (!getCosmeticById(cosmeticId)) {
          return;
        }

        set((state) =>
          isOwned(state.ownedIds, cosmeticId)
            ? state
            : { ownedIds: [...state.ownedIds, cosmeticId] },
        );
      },
      purchase: (cosmeticId) => {
        const cosmetic = getCosmeticById(cosmeticId);

        if (!cosmetic) {
          return false;
        }

        const state = get();

        if (isOwned(state.ownedIds, cosmeticId)) {
          return get().equip(cosmeticId);
        }

        if (cosmetic.unlockAchievementId) {
          const unlocked = useAchievementStore
            .getState()
            .unlockedIds.includes(cosmetic.unlockAchievementId);

          if (unlocked) {
            get().unlock(cosmeticId);
            return get().equip(cosmeticId);
          }
        }

        if (cosmetic.unlockEventId) {
          return false;
        }

        if (cosmetic.price <= 0) {
          get().unlock(cosmeticId);
          return get().equip(cosmeticId);
        }

        const spent = useProfileStore.getState().trySpendCoins(cosmetic.price);

        if (!spent) {
          return false;
        }

        get().unlock(cosmeticId);
        return get().equip(cosmeticId);
      },
      equip: (cosmeticId) => {
        const cosmetic = getCosmeticById(cosmeticId);

        if (!cosmetic || !isOwned(get().ownedIds, cosmeticId)) {
          return false;
        }

        set((state) => ({
          equipped: {
            ...state.equipped,
            [cosmetic.category]: cosmeticId,
          },
        }));
        return true;
      },
      syncAchievementUnlocks: () => {
        const unlockedAchievements = useAchievementStore.getState().unlockedIds;

        for (const cosmetic of COSMETIC_CATALOG) {
          if (
            cosmetic.unlockAchievementId &&
            unlockedAchievements.includes(cosmetic.unlockAchievementId)
          ) {
            get().unlock(cosmetic.id);
          }
        }
      },
      resetCosmetics: () =>
        set({
          ownedIds: createDefaultOwnedIds(),
          equipped: createDefaultEquipped(),
        }),
    }),
    {
      name: SAVE_KEYS.cosmetics,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<CosmeticsStore>),
        equipped: {
          ...createDefaultEquipped(),
          ...((persistedState as Partial<CosmeticsStore> | undefined)?.equipped ??
            {}),
        },
      }),
    },
  ),
);

export function getEquippedCosmeticId(category: CosmeticCategory): string {
  return useCosmeticsStore.getState().equipped[category];
}
