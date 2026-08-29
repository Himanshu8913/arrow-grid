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

export const PUZZLE_CATALOG: PuzzleDefinition[] = [firstSteps, cornerRoute];

export const DEFAULT_PUZZLE_ID = firstSteps.id;

/**
 * Returns a puzzle definition by id, falling back to the first catalog entry.
 */
export function getPuzzleById(puzzleId: string): PuzzleDefinition {
  return (
    PUZZLE_CATALOG.find((puzzle) => puzzle.id === puzzleId) ?? PUZZLE_CATALOG[0]
  );
}
