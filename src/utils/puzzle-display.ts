import { getPuzzleById, isCatalogPuzzleId } from "@/data/puzzles";
import type { GameState } from "@/engine/game-state";
import {
  getRandomPuzzleSeed,
  isRandomPuzzleId,
} from "@/engine/random-puzzle";

export interface PuzzleDisplayInfo {
  title: string;
  description: string;
}

/**
 * Player-facing puzzle title and description for HUD and results.
 */
export function getPuzzleDisplayInfo(game: GameState): PuzzleDisplayInfo {
  if (isRandomPuzzleId(game.puzzleId)) {
    const seed = getRandomPuzzleSeed(game.puzzleId);

    return {
      title: "Random Puzzle",
      description:
        seed === null
          ? "Procedurally generated board."
          : `Procedurally generated board · seed ${seed}`,
    };
  }

  if (game.puzzleId && isCatalogPuzzleId(game.puzzleId)) {
    const puzzle = getPuzzleById(game.puzzleId);

    return {
      title: puzzle.title,
      description: puzzle.description,
    };
  }

  return {
    title: "Puzzle",
    description: "Reach the goal within the move limit.",
  };
}

/**
 * Target move par for star scoring.
 */
export function getPuzzleTargetMoves(game: GameState): number {
  if (game.targetMoves !== undefined) {
    return game.targetMoves;
  }

  if (game.puzzleId && isCatalogPuzzleId(game.puzzleId)) {
    return getPuzzleById(game.puzzleId).targetMoves;
  }

  return 3;
}
