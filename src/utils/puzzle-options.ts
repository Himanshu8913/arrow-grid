import { PUZZLE_CATALOG, RANDOM_PUZZLE_ID } from "@/data/puzzles";
import {
  getSeasonalPuzzleById,
  isSeasonalPuzzleId,
  resolveSeasonalPuzzleId,
} from "@/data/seasonal-puzzles";
import { isCustomPuzzleId } from "@/engine/custom-puzzle";
import { getActiveSeasonalEvent } from "@/utils/seasonal";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";

export type PuzzleOptionCategory =
  | "featured"
  | "seasonal"
  | "classic"
  | "mechanic"
  | "community";

export interface PuzzleModeOption {
  value: string;
  label: string;
  description: string;
  category: PuzzleOptionCategory;
}

export interface PuzzleOptionGroup {
  id: PuzzleOptionCategory;
  title: string;
  description?: string;
  options: PuzzleModeOption[];
}

const CATEGORY_LABELS: Record<PuzzleOptionCategory, string> = {
  featured: "Quick play",
  seasonal: "Seasonal",
  classic: "Classic",
  mechanic: "Mechanics",
  community: "Community",
};

function toCatalogOption(
  puzzle: (typeof PUZZLE_CATALOG)[number],
  category: "classic" | "mechanic",
): PuzzleModeOption {
  return {
    value: puzzle.id,
    label: puzzle.title,
    description: puzzle.description,
    category,
  };
}

/**
 * Catalog plus locally saved community puzzles, grouped for the play picker.
 */
export function getGroupedPuzzleOptions(): PuzzleOptionGroup[] {
  const groups: PuzzleOptionGroup[] = [
    {
      id: "featured",
      title: CATEGORY_LABELS.featured,
      description: "Shuffle a fresh board every run.",
      options: [
        {
          value: RANDOM_PUZZLE_ID,
          label: "Random Puzzle",
          description: "A new procedurally generated board every time.",
          category: "featured",
        },
      ],
    },
  ];

  const activeEvent = getActiveSeasonalEvent();

  if (activeEvent) {
    const seasonalPuzzle = getSeasonalPuzzleById(activeEvent.puzzleId);

    groups.push({
      id: "seasonal",
      title: CATEGORY_LABELS.seasonal,
      description: `${activeEvent.name} — limited-time challenge.`,
      options: [
        {
          value: activeEvent.puzzleId,
          label: seasonalPuzzle.title,
          description: seasonalPuzzle.description,
          category: "seasonal",
        },
      ],
    });
  }

  const classicOptions = PUZZLE_CATALOG.filter((puzzle) => !puzzle.procedural).map(
    (puzzle) => toCatalogOption(puzzle, "classic"),
  );

  if (classicOptions.length > 0) {
    groups.push({
      id: "classic",
      title: CATEGORY_LABELS.classic,
      description: "Handcrafted layouts to learn the basics.",
      options: classicOptions,
    });
  }

  const mechanicOptions = PUZZLE_CATALOG.filter((puzzle) => puzzle.procedural).map(
    (puzzle) => toCatalogOption(puzzle, "mechanic"),
  );

  if (mechanicOptions.length > 0) {
    groups.push({
      id: "mechanic",
      title: CATEGORY_LABELS.mechanic,
      description: "Special tiles with a new layout each run.",
      options: mechanicOptions,
    });
  }

  const communityOptions = useCustomPuzzleStore
    .getState()
    .listPuzzles("newest")
    .map((record) => ({
      value: record.puzzle.id,
      label: record.puzzle.title,
      description:
        record.puzzle.description || "A player-created puzzle from your library.",
      category: "community" as const,
    }));

  if (communityOptions.length > 0) {
    groups.push({
      id: "community",
      title: CATEGORY_LABELS.community,
      description: "Puzzles saved from the editor or community screen.",
      options: communityOptions,
    });
  }

  return groups;
}

/**
 * Flat list for legacy dropdown consumers.
 */
export function getPuzzleModeOptions(): Array<{ value: string; label: string }> {
  return getGroupedPuzzleOptions().flatMap((group) =>
    group.options.map((option) => ({
      value: option.value,
      label: option.label,
    })),
  );
}

/**
 * Resolves picker metadata for the current puzzle selection.
 */
export function getPuzzleOptionById(puzzleId: string): PuzzleModeOption {
  const grouped = getGroupedPuzzleOptions();

  for (const group of grouped) {
    const match = group.options.find((option) => option.value === puzzleId);

    if (match) {
      return match;
    }
  }

  if (isCustomPuzzleId(puzzleId)) {
    const record = useCustomPuzzleStore.getState().getPuzzle(puzzleId);

    if (record) {
      return {
        value: record.puzzle.id,
        label: record.puzzle.title,
        description:
          record.puzzle.description || "A player-created puzzle from your library.",
        category: "community",
      };
    }
  }

  if (isSeasonalPuzzleId(puzzleId)) {
    const puzzle = getSeasonalPuzzleById(resolveSeasonalPuzzleId(puzzleId));

    return {
      value: puzzle.id,
      label: puzzle.title,
      description: puzzle.description,
      category: "seasonal",
    };
  }

  const catalogPuzzle = PUZZLE_CATALOG.find((entry) => entry.id === puzzleId);

  if (catalogPuzzle) {
    return toCatalogOption(
      catalogPuzzle,
      catalogPuzzle.procedural ? "mechanic" : "classic",
    );
  }

  return {
    value: RANDOM_PUZZLE_ID,
    label: "Random Puzzle",
    description: "A new procedurally generated board every time.",
    category: "featured",
  };
}

export function getPuzzleCategoryLabel(category: PuzzleOptionCategory): string {
  return CATEGORY_LABELS[category];
}
