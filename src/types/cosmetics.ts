import type { AchievementId } from "@/types/achievement";

export type CosmeticCategory =
  | "board"
  | "orb"
  | "arrow"
  | "frame"
  | "title";

export interface CosmeticDefinition {
  id: string;
  category: CosmeticCategory;
  name: string;
  description: string;
  /** Coin price; `0` means free default or achievement-only. */
  price: number;
  /** Unlocked automatically when this achievement is earned. */
  unlockAchievementId?: AchievementId;
  /** Unlocked during an active seasonal event or by completing its challenge. */
  unlockEventId?: string;
}

export type EquippedCosmetics = Record<CosmeticCategory, string>;

export interface CosmeticsState {
  ownedIds: string[];
  equipped: EquippedCosmetics;
}
