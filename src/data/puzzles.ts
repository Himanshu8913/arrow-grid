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
  description: "Use the teleporter to reach the far side of the board.",
  size: 5,
  spawn: { row: 0, col: 0 },
  goal: { row: 4, col: 0 },
  targetMoves: 1,
  moveLimit: 6,
  shortestPathLength: 4,
  placements: [
    { row: 0, col: 0, tile: { kind: "arrow", direction: "right" } },
    { row: 0, col: 1, tile: { kind: "arrow", direction: "up" } },
    { row: 0, col: 2, tile: { kind: "teleporter", portalId: "alpha", target: { row: 4, col: 2 } } },
    { row: 4, col: 2, tile: { kind: "arrow", direction: "left" } },
    { row: 4, col: 1, tile: { kind: "arrow", direction: "left" } },
    { row: 4, col: 0, tile: { kind: "goal", owner: "player1" } },
  ],
};

export const PUZZLE_CATALOG: PuzzleDefinition[] = [
  firstSteps,
  cornerRoute,
  portalHop,
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

/**
 * Returns true for handcrafted catalog puzzle ids.
 */
export function isCatalogPuzzleId(puzzleId: string): boolean {
  return PUZZLE_CATALOG.some((puzzle) => puzzle.id === puzzleId);
}

/**
 * Returns a puzzle definition by id, falling back to the first catalog entry.
 */
export function getPuzzleById(puzzleId: string): PuzzleDefinition {
  return (
    PUZZLE_CATALOG.find((puzzle) => puzzle.id === puzzleId) ?? PUZZLE_CATALOG[0]
  );
}
