import type { PuzzleDefinition } from "@/types/puzzle";

const firstSteps: PuzzleDefinition = {
  id: "first-steps",
  title: "First Steps",
  description: "Rotate one arrow to open a straight path to the goal.",
  size: 5,
  spawn: { row: 0, col: 2 },
  goal: { row: 4, col: 2 },
  targetMoves: 1,
  moveLimit: 6,
  shortestPathLength: 5,
  placements: [
    { row: 0, col: 2, tile: { kind: "arrow", direction: "down" } },
    { row: 1, col: 2, tile: { kind: "arrow", direction: "down" } },
    { row: 2, col: 2, tile: { kind: "arrow", direction: "right" } },
    { row: 3, col: 2, tile: { kind: "arrow", direction: "down" } },
    { row: 4, col: 2, tile: { kind: "goal", owner: "player1" } },
  ],
};

const cornerRoute: PuzzleDefinition = {
  id: "corner-route",
  title: "Corner Route",
  description: "Guide the orb through the corner with two careful rotations.",
  size: 5,
  spawn: { row: 0, col: 0 },
  goal: { row: 4, col: 4 },
  targetMoves: 2,
  moveLimit: 8,
  shortestPathLength: 9,
  placements: [
    { row: 0, col: 0, tile: { kind: "arrow", direction: "right" } },
    { row: 0, col: 1, tile: { kind: "arrow", direction: "right" } },
    { row: 0, col: 2, tile: { kind: "arrow", direction: "down" } },
    { row: 1, col: 2, tile: { kind: "arrow", direction: "down" } },
    { row: 2, col: 2, tile: { kind: "arrow", direction: "down" } },
    { row: 2, col: 3, tile: { kind: "arrow", direction: "down" } },
    { row: 3, col: 3, tile: { kind: "arrow", direction: "left" } },
    { row: 4, col: 3, tile: { kind: "arrow", direction: "right" } },
    { row: 4, col: 4, tile: { kind: "goal", owner: "player1" } },
  ],
};

const portalHop: PuzzleDefinition = {
  id: "portal-hop",
  title: "Portal Hop",
  description: "Use teleporters to cross the board. Every run is a new layout.",
  procedural: true,
};

const iceSlide: PuzzleDefinition = {
  id: "ice-slide",
  title: "Ice Slide",
  description:
    "Slide across the ice and steer the orb before it overshoots. Every run is new.",
  procedural: true,
};

const spinCycle: PuzzleDefinition = {
  id: "spin-cycle",
  title: "Spin Cycle",
  description:
    "Rotating arrows shift after you pass over them. Every run is a new layout.",
  procedural: true,
};

const blastZone: PuzzleDefinition = {
  id: "blast-zone",
  title: "Blast Zone",
  description:
    "Steer clear of bombs or the orb will detonate. Every run is a new layout.",
  procedural: true,
};

const lockAndKey: PuzzleDefinition = {
  id: "lock-and-key",
  title: "Lock & Key",
  description:
    "Collect the key to unlock frozen arrows on the route. Every run is new.",
  procedural: true,
};

const gustAlley: PuzzleDefinition = {
  id: "gust-alley",
  title: "Gust Alley",
  description:
    "Wind tiles push the orb an extra step. Every run is a new layout.",
  procedural: true,
};

const magnetPull: PuzzleDefinition = {
  id: "magnet-pull",
  title: "Magnet Pull",
  description:
    "Magnets yank the orb off course when you pass nearby. Every run is new.",
  procedural: true,
};

const twinSplit: PuzzleDefinition = {
  id: "twin-split",
  title: "Twin Split",
  description:
    "Split the orb in two and guide both to their goals. Every run is a new layout.",
  procedural: true,
};

export const PUZZLE_CATALOG: PuzzleDefinition[] = [
  firstSteps,
  cornerRoute,
  portalHop,
  iceSlide,
  spinCycle,
  blastZone,
  lockAndKey,
  gustAlley,
  magnetPull,
  twinSplit,
];

export const RANDOM_PUZZLE_ID = "random";

export const DEFAULT_PUZZLE_ID = RANDOM_PUZZLE_ID;

export const PUZZLE_MODE_OPTIONS = [
  { value: RANDOM_PUZZLE_ID, label: "Random Puzzle" },
  ...PUZZLE_CATALOG.map((puzzle) => ({
    value: puzzle.id,
    label: puzzle.title,
  })),
];

import { PROCEDURAL_MECHANIC_PUZZLE_IDS } from "@/engine/mechanic-puzzle-generator";

/**
 * Maps a runtime puzzle id to its catalog entry id.
 */
export function resolveCatalogPuzzleId(puzzleId: string): string {
  for (const baseId of PROCEDURAL_MECHANIC_PUZZLE_IDS) {
    if (puzzleId === baseId || puzzleId.startsWith(`${baseId}-`)) {
      return baseId;
    }
  }

  return puzzleId;
}

/**
 * Returns true for catalog puzzle ids, including procedural mechanic runs.
 */
export function isCatalogPuzzleId(puzzleId: string): boolean {
  return PUZZLE_CATALOG.some(
    (puzzle) => puzzle.id === resolveCatalogPuzzleId(puzzleId),
  );
}

/**
 * Returns true for handcrafted (fixed-layout) catalog puzzles.
 */
export function isHandcraftedPuzzleId(puzzleId: string): boolean {
  const catalogId = resolveCatalogPuzzleId(puzzleId);
  const puzzle = PUZZLE_CATALOG.find((entry) => entry.id === catalogId);

  return Boolean(puzzle && !puzzle.procedural);
}

/**
 * Returns a puzzle definition by id, falling back to the first catalog entry.
 */
export function getPuzzleById(puzzleId: string): PuzzleDefinition {
  const catalogId = resolveCatalogPuzzleId(puzzleId);

  return (
    PUZZLE_CATALOG.find((puzzle) => puzzle.id === catalogId) ?? PUZZLE_CATALOG[0]
  );
}
