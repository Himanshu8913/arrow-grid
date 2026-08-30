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
  {
    id: "board-pumpkin",
    category: "board",
    name: "Pumpkin Patch",
    description: "Orange harvest tiles for Halloween.",
    price: 0,
    unlockEventId: "halloween",
  },
  {
    id: "orb-ghost",
    category: "orb",
    name: "Ghost Orb",
    description: "A pale spectral glow trails your orb.",
    price: 0,
    unlockEventId: "halloween",
  },
  {
    id: "title-haunted",
    category: "title",
    name: "Haunted",
    description: "A spooky seasonal title.",
    price: 0,
    unlockEventId: "halloween",
  },
  {
    id: "board-snow",
    category: "board",
    name: "Snow Drift",
    description: "Frosty blue-white winter tiles.",
    price: 0,
    unlockEventId: "winter",
  },
  {
    id: "orb-frost",
    category: "orb",
    name: "Frost Orb",
    description: "An icy orb with a cool shimmer.",
    price: 0,
    unlockEventId: "winter",
  },
  {
    id: "title-frostbound",
    category: "title",
    name: "Frostbound",
    description: "Winter seasonal title.",
    price: 0,
    unlockEventId: "winter",
  },
  {
    id: "board-lantern",
    category: "board",
    name: "Lantern Glow",
    description: "Warm golden festival tiles.",
    price: 0,
    unlockEventId: "diwali",
  },
  {
    id: "orb-lantern",
    category: "orb",
    name: "Lantern Orb",
    description: "A radiant orb lit for Diwali.",
    price: 0,
    unlockEventId: "diwali",
  },
  {
    id: "title-festival",
    category: "title",
    name: "Festival",
    description: "Celebrate the festival of lights.",
    price: 0,
    unlockEventId: "diwali",
  },
  {
    id: "board-anniversary",
    category: "board",
    name: "Anniversary Grid",
    description: "Confetti gradients for the celebration.",
    price: 0,
    unlockEventId: "anniversary",
  },
  {
    id: "orb-anniversary",
    category: "orb",
    name: "Spark Orb",
    description: "A sparkling celebratory orb.",
    price: 0,
    unlockEventId: "anniversary",
  },
  {
    id: "frame-anniversary",
    category: "frame",
    name: "Anniversary Ring",
    description: "A limited anniversary profile frame.",
    price: 0,
    unlockEventId: "anniversary",
  },
  {
    id: "title-anniversary",
    category: "title",
    name: "Anniversary",
    description: "Mark the milestone on your profile.",
    price: 0,
    unlockEventId: "anniversary",
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
