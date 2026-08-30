import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SAVE_KEYS, SAVE_VERSION } from "@/constants/save";
import { DEFAULT_PUZZLE_ID } from "@/data/puzzles";
import type { AiDifficulty } from "@/constants/ai";
import type { MatchFormat } from "@/constants/match-format";
import type { GameState } from "@/engine/game-state";
import {
  createInitialGameProgress,
  type GameProgress,
  type PuzzleProgressRecord,
} from "@/types/progress";
import type { PuzzleStarRating } from "@/types/puzzle";

interface ProgressStore extends GameProgress {
  setGameMode: (gameMode: string) => void;
  setAiDifficulty: (aiDifficulty: AiDifficulty) => void;
  setMatchFormat: (matchFormat: MatchFormat) => void;
  setSelectedPuzzleId: (puzzleId: string) => void;
  syncActiveMatch: (game: GameState) => void;
  recordPuzzleCompletion: (puzzleId: string, stars: PuzzleStarRating) => void;
  getPuzzleProgress: (puzzleId: string) => PuzzleProgressRecord | undefined;
  resetProgress: () => void;
}

function upsertPuzzleProgress(
  puzzleProgress: Record<string, PuzzleProgressRecord>,
  puzzleId: string,
  stars: PuzzleStarRating,
): Record<string, PuzzleProgressRecord> {
  const existing = puzzleProgress[puzzleId];
  const bestStars =
    existing?.bestStars === null || existing?.bestStars === undefined
      ? stars
      : (Math.max(existing.bestStars, stars) as PuzzleStarRating);

  return {
    ...puzzleProgress,
    [puzzleId]: {
      completed: true,
      bestStars,
    },
  };
}

/**
 * Persisted gameplay progress, preferences, and in-progress matches.
 */
export const useProgressStore = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...createInitialGameProgress(),
      setGameMode: (gameMode) => set({ gameMode }),
      setAiDifficulty: (aiDifficulty) => set({ aiDifficulty }),
      setMatchFormat: (matchFormat) => set({ matchFormat }),
      setSelectedPuzzleId: (selectedPuzzleId) => set({ selectedPuzzleId }),
      syncActiveMatch: (game) =>
        set({
          activeMatch:
            game.status === "in-progress"
              ? { game, savedAt: Date.now() }
              : null,
        }),
      recordPuzzleCompletion: (puzzleId, stars) =>
        set((state) => ({
          puzzleProgress: upsertPuzzleProgress(
            state.puzzleProgress,
            puzzleId,
            stars,
          ),
        })),
      getPuzzleProgress: (puzzleId) => get().puzzleProgress[puzzleId],
      resetProgress: () => set(createInitialGameProgress()),
    }),
    {
      name: SAVE_KEYS.progress,
      version: SAVE_VERSION,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<GameProgress>),
        matchFormat:
          (persistedState as Partial<GameProgress>).matchFormat ??
          currentState.matchFormat,
        version: SAVE_VERSION,
      }),
    },
  ),
);

export function getInitialGamePreferences() {
  const progress = useProgressStore.getState();

  return {
    gameMode: progress.gameMode,
    aiDifficulty: progress.aiDifficulty,
    matchFormat: progress.matchFormat,
    selectedPuzzleId: progress.selectedPuzzleId || DEFAULT_PUZZLE_ID,
    activeMatch: progress.activeMatch,
  };
}
