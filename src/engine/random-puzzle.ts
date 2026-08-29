import { generateBoard } from "@/engine/board-generator";
import { createGameState } from "@/engine/game-state";
import type { GameState } from "@/engine/game-state";
import { createRandomSeed } from "@/engine/random";
import type { Position } from "@/types/game";

export const RANDOM_PUZZLE_ID = "random";

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Returns true for procedurally generated puzzle ids (`random-<seed>`).
 */
export function isRandomPuzzleId(puzzleId: string | undefined): boolean {
  return puzzleId === RANDOM_PUZZLE_ID || puzzleId?.startsWith("random-") === true;
}

/**
 * Extracts the numeric seed encoded in a random puzzle id.
 */
export function getRandomPuzzleSeed(puzzleId: string | undefined): number | null {
  if (!puzzleId?.startsWith("random-")) {
    return null;
  }

  const seed = Number(puzzleId.slice("random-".length));
  return Number.isFinite(seed) ? seed : null;
}

function getRandomPuzzleLimits(size: number, shortestPathLength: number) {
  const targetMoves = Math.max(2, Math.ceil(shortestPathLength / 2));
  const moveLimit = targetMoves + Math.max(3, Math.floor(shortestPathLength / 2) + 1);

  return {
    targetMoves: size >= 6 ? targetMoves + 1 : targetMoves,
    moveLimit: size >= 6 ? moveLimit + 2 : moveLimit,
    shortestPathLength,
  };
}

/**
 * Creates a new solvable single-player puzzle from a procedural board.
 */
export function createRandomPuzzleGame(seed = createRandomSeed()): GameState {
  const size = seed % 5 === 0 ? 6 : 5;
  const generated = generateBoard({
    seed,
    size,
    playerCount: 1,
    maxAttempts: 100,
  });

  const goal = generated.goals.player1;

  if (!goal) {
    throw new Error("Random puzzle generation failed to place a goal.");
  }

  const shortestPathLength = manhattanDistance(generated.spawn, goal) + 1;
  const limits = getRandomPuzzleLimits(size, shortestPathLength);

  return createGameState(generated, {
    playerCount: 1,
    ...limits,
    puzzleId: `random-${generated.seed}`,
  });
}

/**
 * Builds either a catalog puzzle or a new random puzzle for the current selection.
 */
export function createPuzzleGameForSelection(
  puzzleId: string,
  createCatalogGame: (id: string) => GameState,
): GameState {
  if (puzzleId === RANDOM_PUZZLE_ID || isRandomPuzzleId(puzzleId)) {
    return createRandomPuzzleGame();
  }

  return createCatalogGame(puzzleId);
}
