import { create } from "zustand";

import { DEFAULT_PUZZLE_ID } from "@/data/puzzles";
import type { Position } from "@/types/game";
import type { PuzzleStarRating } from "@/types/puzzle";

interface PuzzleSessionStore {
  selectedPuzzleId: string;
  hintsUsed: number;
  hintPosition: Position | null;
  earnedStars: PuzzleStarRating | null;
  setSelectedPuzzleId: (puzzleId: string) => void;
  setHintPosition: (position: Position | null) => void;
  incrementHintsUsed: () => void;
  setEarnedStars: (stars: PuzzleStarRating | null) => void;
  resetPuzzleSession: () => void;
}

/**
 * Session-only puzzle progress (hints, stars, selection).
 */
export const usePuzzleSessionStore = create<PuzzleSessionStore>((set) => ({
  selectedPuzzleId: DEFAULT_PUZZLE_ID,
  hintsUsed: 0,
  hintPosition: null,
  earnedStars: null,
  setSelectedPuzzleId: (selectedPuzzleId) => set({ selectedPuzzleId }),
  setHintPosition: (hintPosition) => set({ hintPosition }),
  incrementHintsUsed: () =>
    set((state) => ({ hintsUsed: state.hintsUsed + 1 })),
  setEarnedStars: (earnedStars) => set({ earnedStars }),
  resetPuzzleSession: () =>
    set({
      hintsUsed: 0,
      hintPosition: null,
      earnedStars: null,
    }),
}));
