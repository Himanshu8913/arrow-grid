import type { GameState } from "@/engine/game-state";
import {
  getMechanicPuzzleSeed,
  isProceduralMechanicPuzzleId,
} from "@/engine/mechanic-puzzle-generator";
import {
  getRandomPuzzleSeed,
  isRandomPuzzleId,
} from "@/engine/random-puzzle";
import { getPuzzleById, isCatalogPuzzleId, resolveCatalogPuzzleId } from "@/data/puzzles";

export interface PuzzleDisplayInfo {
  title: string;
  description: string;
}

function formatSeedDescription(baseDescription: string, seed: number | null): string {
  if (seed === null) {
    return `${baseDescription} Procedurally generated board.`;
  }

  return `${baseDescription} Procedurally generated board · seed ${seed}`;
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

  if (game.puzzleId && isProceduralMechanicPuzzleId(game.puzzleId)) {
    const puzzle = getPuzzleById(game.puzzleId);

    return {
      title: puzzle.title,
      description: formatSeedDescription(
        puzzle.description,
        getMechanicPuzzleSeed(game.puzzleId),
      ),
    };
  }

  if (game.puzzleId && isCatalogPuzzleId(game.puzzleId)) {
    const puzzle = getPuzzleById(resolveCatalogPuzzleId(game.puzzleId));

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
    const puzzle = getPuzzleById(game.puzzleId);

    if (puzzle.targetMoves !== undefined) {
      return puzzle.targetMoves;
    }
  }

  return 3;
}
