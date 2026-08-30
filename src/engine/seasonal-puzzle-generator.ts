import { generateBoard } from "@/engine/board-generator";
import { createGameState } from "@/engine/game-state";
import type { GameState } from "@/engine/game-state";
import { createRandomSeed } from "@/engine/random";
import type { Position } from "@/types/game";

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

function getSeasonalPuzzleLimits(size: number, shortestPathLength: number) {
  const targetMoves = Math.max(2, Math.ceil(shortestPathLength / 2));
  const moveLimit = targetMoves + Math.max(3, Math.floor(shortestPathLength / 2) + 1);

  return {
    targetMoves: size >= 6 ? targetMoves + 1 : targetMoves,
    moveLimit: size >= 6 ? moveLimit + 2 : moveLimit,
    shortestPathLength,
  };
}

/**
 * Creates a new procedurally generated board for a seasonal puzzle mode.
 */
export function createSeasonalPuzzleGame(
  basePuzzleId: string,
  seed = createRandomSeed(),
): GameState {
  const size = seed % 5 === 0 ? 6 : 5;
  const generated = generateBoard({
    seed,
    size,
    playerCount: 1,
    maxAttempts: 100,
  });

  const goal = generated.goals.player1;

  if (!goal) {
    throw new Error("Seasonal puzzle generation failed to place a goal.");
  }

  const shortestPathLength = manhattanDistance(generated.spawn, goal) + 1;
  const limits = getSeasonalPuzzleLimits(size, shortestPathLength);

  return createGameState(generated, {
    playerCount: 1,
    ...limits,
    puzzleId: `${basePuzzleId}-${generated.seed}`,
  });
}
