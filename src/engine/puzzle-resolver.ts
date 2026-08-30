import { getPuzzleById, resolveCatalogPuzzleId } from "@/data/puzzles";
import { isCustomPuzzleId } from "@/engine/custom-puzzle";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import type { PuzzleDefinition } from "@/types/puzzle";

/**
 * Resolves a puzzle id from the catalog or the local community library.
 */
export function resolvePuzzleDefinition(puzzleId: string): PuzzleDefinition {
  if (isCustomPuzzleId(puzzleId)) {
    const record = useCustomPuzzleStore.getState().getPuzzle(puzzleId);

    if (!record) {
      throw new Error(`Custom puzzle not found: ${puzzleId}`);
    }

    return record.puzzle;
  }

  return getPuzzleById(resolveCatalogPuzzleId(puzzleId));
}

/**
 * Returns true for catalog and locally saved community puzzles.
 */
export function isPlayablePuzzleId(puzzleId: string): boolean {
  if (isCustomPuzzleId(puzzleId)) {
    return useCustomPuzzleStore.getState().getPuzzle(puzzleId) !== undefined;
  }

  return true;
}
