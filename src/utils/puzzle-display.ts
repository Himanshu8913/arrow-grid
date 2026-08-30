import type { GameState } from "@/engine/game-state";
import { isCustomPuzzleId } from "@/engine/custom-puzzle";
import {
  getMechanicPuzzleSeed,
  isProceduralMechanicPuzzleId,
} from "@/engine/mechanic-puzzle-generator";
import {
  getRandomPuzzleSeed,
  isRandomPuzzleId,
} from "@/engine/random-puzzle";
import { getPuzzleById, isCatalogPuzzleId, resolveCatalogPuzzleId } from "@/data/puzzles";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";

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

  if (game.puzzleId && isCustomPuzzleId(game.puzzleId)) {
    const record = useCustomPuzzleStore.getState().getPuzzle(game.puzzleId);

    return {
      title: record?.puzzle.title ?? "Community Puzzle",
      description: record?.puzzle.description ?? "A player-created puzzle.",
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

  if (game.puzzleId && isCustomPuzzleId(game.puzzleId)) {
    const record = useCustomPuzzleStore.getState().getPuzzle(game.puzzleId);

    if (record?.puzzle.targetMoves !== undefined) {
      return record.puzzle.targetMoves;
    }
  }

  if (game.puzzleId && isCatalogPuzzleId(game.puzzleId)) {
    const puzzle = getPuzzleById(game.puzzleId);

    if (puzzle.targetMoves !== undefined) {
      return puzzle.targetMoves;
    }
  }

  return 3;
}
