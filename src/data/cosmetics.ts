import type { CosmeticCategory, CosmeticDefinition } from "@/types/cosmetics";

export const DEFAULT_COSMETIC_IDS: Record<CosmeticCategory, string> = {
  board: "board-default",
  orb: "orb-default",
  arrow: "arrow-default",
  frame: "frame-default",
  title: "title-default",
};

export const COSMETIC_CATALOG: CosmeticDefinition[] = [
  {
    id: "board-default",
    category: "board",
    name: "Classic Grid",
    description: "The standard board look.",
    price: 0,
  },
  {
    id: "board-midnight",
    category: "board",
    name: "Midnight",
    description: "Deep blue tiles with a calm glow.",
    price: 150,
  },
  {
    id: "board-aurora",
    category: "board",
    name: "Aurora",
    description: "Northern-lights gradients on every tile.",
    price: 300,
    unlockAchievementId: "daily-challenge-winner",
  },
  {
    id: "orb-default",
    category: "orb",
    name: "Energy Core",
    description: "The classic blue energy orb.",
    price: 0,
  },
  {
    id: "orb-ember",
    category: "orb",
    name: "Ember",
    description: "A warm orange orb with a fiery trail.",
    price: 200,
  },
  {
    id: "orb-neon",
    category: "orb",
    name: "Neon Pulse",
    description: "Electric cyan glow for high-energy play.",
    price: 250,
    unlockAchievementId: "perfect-puzzle",
  },
  {
    id: "arrow-default",
    category: "arrow",
    name: "Standard Arrows",
    description: "Clean directional glyphs.",
    price: 0,
  },
  {
    id: "arrow-bold",
    category: "arrow",
    name: "Bold Arrows",
    description: "Thicker arrows with a soft glow.",
    price: 100,
  },
  {
    id: "arrow-minimal",
    category: "arrow",
    name: "Minimal Arrows",
    description: "Slim, understated arrow style.",
    price: 100,
  },
  {
    id: "frame-default",
    category: "frame",
    name: "Simple Frame",
    description: "A clean profile ring.",
    price: 0,
  },
  {
    id: "frame-gold",
    category: "frame",
    name: "Gold Frame",
    description: "Prestige gold border for your avatar.",
    price: 400,
    unlockAchievementId: "streak-10",
  },
  {
    id: "frame-neon",
    category: "frame",
    name: "Neon Ring",
    description: "Animated neon profile border.",
    price: 200,
  },
  {
    id: "title-default",
    category: "title",
    name: "No Title",
    description: "Play without a displayed title.",
    price: 0,
  },
  {
    id: "title-strategist",
    category: "title",
    name: "Strategist",
    description: "Shows under your display name.",
    price: 150,
  },
  {
    id: "title-orb-master",
    category: "title",
    name: "Orb Master",
    description: "For veterans of the grid.",
    price: 500,
    unlockAchievementId: "century-club",
  },
];

/**
 * Returns a cosmetic definition by id.
 */
export function getCosmeticById(cosmeticId: string): CosmeticDefinition | undefined {
  return COSMETIC_CATALOG.find((entry) => entry.id === cosmeticId);
}

/**
 * Returns all cosmetics in a category.
 */
export function getCosmeticsByCategory(
  category: CosmeticCategory,
): CosmeticDefinition[] {
  return COSMETIC_CATALOG.filter((entry) => entry.category === category);
}
