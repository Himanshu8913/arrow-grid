import { create } from "zustand";
import { persist } from "zustand/middleware";

import { SAVE_KEYS } from "@/constants/save";
import { getDailyDateKey } from "@/engine/daily-challenge";
import {
  createInitialDailyChallengeState,
  type DailyAttemptResult,
  type DailyChallengeState,
} from "@/types/daily-challenge";
import type { PuzzleStarRating } from "@/types/puzzle";

interface RecordDailyAttemptInput {
  dateKey: string;
  outcome: "win" | "loss";
  movesPlayed: number;
  score: number;
  stars: PuzzleStarRating | null;
}

interface DailyChallengeStore extends DailyChallengeState {
  hasAttemptedToday: (dateKey?: string) => boolean;
  getTodayResult: (dateKey?: string) => DailyAttemptResult | null;
  recordAttempt: (input: RecordDailyAttemptInput) => void;
  resetDailyChallenge: () => void;
}

/**
 * Persisted daily challenge attempts and history.
 */
export const useDailyChallengeStore = create<DailyChallengeStore>()(
  persist(
    (set, get) => ({
      ...createInitialDailyChallengeState(),
      hasAttemptedToday: (dateKey = getDailyDateKey()) =>
        Boolean(get().history[dateKey]),
      getTodayResult: (dateKey = getDailyDateKey()) =>
        get().history[dateKey] ?? null,
      recordAttempt: (input) => {
        const result: DailyAttemptResult = {
          dateKey: input.dateKey,
          outcome: input.outcome,
          movesPlayed: input.movesPlayed,
          score: input.score,
          stars: input.stars,
          completedAt: Date.now(),
        };

        set((state) => ({
          lastAttemptDateKey: input.dateKey,
          lastResult: result,
          history: {
            ...state.history,
            [input.dateKey]: result,
          },
        }));
      },
      resetDailyChallenge: () => set(createInitialDailyChallengeState()),
    }),
    {
      name: SAVE_KEYS.dailyChallenge,
      merge: (persistedState, currentState) => ({
        ...currentState,
        ...(persistedState as Partial<DailyChallengeState>),
      }),
    },
  ),
);
