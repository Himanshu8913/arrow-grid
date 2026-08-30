import { PUZZLE_CATALOG, RANDOM_PUZZLE_ID } from "@/data/puzzles";
import { getSeasonalPuzzleById } from "@/data/seasonal-puzzles";
import { getActiveSeasonalEvent } from "@/utils/seasonal";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";

export interface PuzzleModeOption {
  value: string;
  label: string;
}

/**
 * Catalog plus locally saved community puzzles for the play dropdown.
 */
export function getPuzzleModeOptions(): PuzzleModeOption[] {
  const customOptions = useCustomPuzzleStore
    .getState()
    .listPuzzles("newest")
    .map((record) => ({
      value: record.puzzle.id,
      label: `${record.puzzle.title} (Community)`,
    }));

  const activeEvent = getActiveSeasonalEvent();
  const seasonalOptions = activeEvent
    ? [
        {
          value: activeEvent.puzzleId,
          label: `${getSeasonalPuzzleById(activeEvent.puzzleId).title} (Seasonal)`,
        },
      ]
    : [];

  return [
    { value: RANDOM_PUZZLE_ID, label: "Random Puzzle" },
    ...seasonalOptions,
    ...PUZZLE_CATALOG.map((puzzle) => ({
      value: puzzle.id,
      label: puzzle.title,
    })),
    ...customOptions,
  ];
}
