import type {
  SeasonalEventId,
  SeasonalMusicProfile,
  SeasonalParticleVariant,
  SeasonalVictoryVariant,
} from "@/types/seasonal";

export type { SeasonalEventId } from "@/types/seasonal";

export interface SeasonalDateRange {
  startMonth: number;
  startDay: number;
  endMonth: number;
  endDay: number;
}

export interface SeasonalEventDefinition {
  id: SeasonalEventId;
  name: string;
  tagline: string;
  description: string;
  emoji: string;
  dateRange: SeasonalDateRange;
  /** Player wins required to complete the seasonal challenge. */
  challengeTarget: number;
  rewardCoins: number;
  rewardXp: number;
  cosmeticIds: string[];
  musicProfile: SeasonalMusicProfile;
  particleVariant: SeasonalParticleVariant;
  victoryVariant: SeasonalVictoryVariant;
  puzzleId: string;
}

export const SEASONAL_PUZZLE_ID_PREFIX = "seasonal-";

export const SEASONAL_EVENTS: SeasonalEventDefinition[] = [
  {
    id: "anniversary",
    name: "Anniversary Celebration",
    tagline: "One year on the grid",
    description:
      "Celebrate Arrow Grid with exclusive cosmetics, community challenges, and a special puzzle.",
    emoji: "🎉",
    dateRange: { startMonth: 8, startDay: 25, endMonth: 9, endDay: 5 },
    challengeTarget: 5,
    rewardCoins: 250,
    rewardXp: 120,
    cosmeticIds: [
      "board-anniversary",
      "orb-anniversary",
      "frame-anniversary",
      "title-anniversary",
    ],
    musicProfile: "anniversary",
    particleVariant: "gold",
    victoryVariant: "fireworks",
    puzzleId: "seasonal-anniversary",
  },
  {
    id: "halloween",
    name: "Haunted Grid",
    tagline: "Spooky puzzles await",
    description:
      "Pumpkin boards, ghost orbs, and haunted music for a limited-time fright.",
    emoji: "🎃",
    dateRange: { startMonth: 10, startDay: 15, endMonth: 11, endDay: 5 },
    challengeTarget: 5,
    rewardCoins: 200,
    rewardXp: 100,
    cosmeticIds: ["board-pumpkin", "orb-ghost", "title-haunted"],
    musicProfile: "haunted",
    particleVariant: "ghost",
    victoryVariant: "default",
    puzzleId: "seasonal-halloween",
  },
  {
    id: "diwali",
    name: "Festival of Lights",
    tagline: "Golden paths and lantern glow",
    description:
      "Light up the board with golden particles, lantern themes, and firework victories.",
    emoji: "🪔",
    dateRange: { startMonth: 11, startDay: 1, endMonth: 11, endDay: 15 },
    challengeTarget: 5,
    rewardCoins: 200,
    rewardXp: 100,
    cosmeticIds: ["board-lantern", "orb-lantern", "title-festival"],
    musicProfile: "diwali",
    particleVariant: "gold",
    victoryVariant: "fireworks",
    puzzleId: "seasonal-diwali",
  },
  {
    id: "winter",
    name: "Winter Wonderland",
    tagline: "Snow, ice, and calm skies",
    description:
      "A frosty menu makeover with snow particles and crisp winter UI accents.",
    emoji: "❄️",
    dateRange: { startMonth: 12, startDay: 1, endMonth: 1, endDay: 15 },
    challengeTarget: 5,
    rewardCoins: 200,
    rewardXp: 100,
    cosmeticIds: ["board-snow", "orb-frost", "title-frostbound"],
    musicProfile: "winter",
    particleVariant: "snow",
    victoryVariant: "default",
    puzzleId: "seasonal-winter",
  },
];

/** Priority when multiple events overlap (first wins). */
export const SEASONAL_EVENT_PRIORITY: SeasonalEventId[] = [
  "anniversary",
  "halloween",
  "diwali",
  "winter",
];

export function getSeasonalEventById(
  eventId: SeasonalEventId,
): SeasonalEventDefinition | undefined {
  return SEASONAL_EVENTS.find((event) => event.id === eventId);
}
