import { getPuzzleById, resolveCatalogPuzzleId } from "@/data/puzzles";
import { isCustomPuzzleId } from "@/engine/custom-puzzle";
import {
  getSeasonalPuzzleById,
  isSeasonalPuzzleId,
  resolveSeasonalPuzzleId,
} from "@/data/seasonal-puzzles";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import type { PuzzleDefinition } from "@/types/puzzle";

/**
 * Resolves a puzzle id from the catalog, seasonal set, or community library.
 */
export function resolvePuzzleDefinition(puzzleId: string): PuzzleDefinition {
  if (isCustomPuzzleId(puzzleId)) {
    const record = useCustomPuzzleStore.getState().getPuzzle(puzzleId);

    if (!record) {
      throw new Error(`Custom puzzle not found: ${puzzleId}`);
    }

    return record.puzzle;
  }

  if (isSeasonalPuzzleId(puzzleId)) {
    return getSeasonalPuzzleById(resolveSeasonalPuzzleId(puzzleId));
  }

  return getPuzzleById(resolveCatalogPuzzleId(puzzleId));
}

/**
 * Returns true for catalog, seasonal, and locally saved community puzzles.
 */
export function isPlayablePuzzleId(puzzleId: string): boolean {
  if (isCustomPuzzleId(puzzleId)) {
    return useCustomPuzzleStore.getState().getPuzzle(puzzleId) !== undefined;
  }

  if (isSeasonalPuzzleId(puzzleId)) {
    return true;
  }

  return true;
}
