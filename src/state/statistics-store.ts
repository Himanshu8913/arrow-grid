import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  createInitialStatistics,
  type PlayerStatistics,
  type RecordMatchEndInput,
} from "@/types/statistics";
import { isPuzzleMode } from "@/utils/game-messages";

interface StatisticsStore {
  stats: PlayerStatistics;
  recordMatchEnd: (input: RecordMatchEndInput) => void;
  recordPvpGame: (movesPlayed: number) => void;
  resetStatistics: () => void;
}

function applyMatchEnd(
  stats: PlayerStatistics,
  input: RecordMatchEndInput,
): PlayerStatistics {
  const nextStats: PlayerStatistics = {
    ...stats,
    gamesPlayed: stats.gamesPlayed + 1,
    totalMoves: stats.totalMoves + input.movesPlayed,
  };

  if (input.outcome === "win") {
    nextStats.wins += 1;
    nextStats.currentStreak += 1;
    nextStats.bestStreak = Math.max(nextStats.bestStreak, nextStats.currentStreak);
    nextStats.bestScore = Math.max(nextStats.bestScore, input.score);

    if (
      nextStats.fastestWinMoves === null ||
      input.movesPlayed < nextStats.fastestWinMoves
    ) {
      nextStats.fastestWinMoves = input.movesPlayed;
    }
  } else {
    nextStats.losses += 1;
    nextStats.currentStreak = 0;
  }

  if (isPuzzleMode(input.gameMode) && input.outcome === "win") {
    nextStats.puzzlesCompleted += 1;
  }

  return nextStats;
}

/**
 * Persistent player statistics for solo and competitive modes.
 */
export const useStatisticsStore = create<StatisticsStore>()(
  persist(
    (set) => ({
      stats: createInitialStatistics(),
      recordMatchEnd: (input) =>
        set((state) => ({
          stats: applyMatchEnd(state.stats, input),
        })),
      recordPvpGame: (movesPlayed) =>
        set((state) => ({
          stats: {
            ...state.stats,
            gamesPlayed: state.stats.gamesPlayed + 1,
            totalMoves: state.stats.totalMoves + movesPlayed,
          },
        })),
      resetStatistics: () => set({ stats: createInitialStatistics() }),
    }),
    {
      name: "arrow-grid-statistics",
    },
  ),
);
