import { SEASONAL_PUZZLE_ID_PREFIX } from "@/data/seasonal-events";
import type { PuzzleDefinition } from "@/types/puzzle";

export const SEASONAL_PUZZLE_IDS = [
  "seasonal-anniversary",
  "seasonal-halloween",
  "seasonal-diwali",
  "seasonal-winter",
] as const;

export const SEASONAL_PUZZLES: PuzzleDefinition[] = [
  {
    id: "seasonal-anniversary",
    title: "Anniversary Lights",
    description:
      "A celebratory seasonal puzzle. Every run is a new layout.",
    procedural: true,
  },
  {
    id: "seasonal-halloween",
    title: "Pumpkin Path",
    description: "A haunted seasonal route. Every run is a new layout.",
    procedural: true,
  },
  {
    id: "seasonal-diwali",
    title: "Lantern Lane",
    description: "A festival seasonal puzzle. Every run is a new layout.",
    procedural: true,
  },
  {
    id: "seasonal-winter",
    title: "Frosty Crossing",
    description: "A winter seasonal puzzle. Every run is a new layout.",
    procedural: true,
  },
];

export function isSeasonalPuzzleId(puzzleId: string | undefined): boolean {
  return puzzleId?.startsWith(SEASONAL_PUZZLE_ID_PREFIX) ?? false;
}

export function resolveSeasonalPuzzleId(puzzleId: string): string {
  const match = SEASONAL_PUZZLES.find(
    (entry) => puzzleId === entry.id || puzzleId.startsWith(`${entry.id}-`),
  );

  if (!match) {
    throw new Error(`Seasonal puzzle not found: ${puzzleId}`);
  }

  return match.id;
}

export function getSeasonalPuzzleById(puzzleId: string): PuzzleDefinition {
  const baseId = resolveSeasonalPuzzleId(puzzleId);
  const puzzle = SEASONAL_PUZZLES.find((entry) => entry.id === baseId);

  if (!puzzle) {
    throw new Error(`Seasonal puzzle not found: ${puzzleId}`);
  }

  return puzzle;
}

export function getSeasonalPuzzleSeed(puzzleId: string | undefined): number | null {
  if (!puzzleId) {
    return null;
  }

  for (const entry of SEASONAL_PUZZLES) {
    if (!puzzleId.startsWith(`${entry.id}-`)) {
      continue;
    }

    const seed = Number(puzzleId.slice(entry.id.length + 1));
    return Number.isFinite(seed) ? seed : null;
  }

  return null;
}
