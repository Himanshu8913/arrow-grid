import type { PuzzleStarRating } from "@/types/puzzle";

export interface DailyAttemptResult {
  dateKey: string;
  outcome: "win" | "loss";
  movesPlayed: number;
  score: number;
  stars: PuzzleStarRating | null;
  completedAt: number;
}

/** Leaderboard payload shape for future server sync. */
export interface DailyLeaderboardEntry {
  playerName: string;
  dateKey: string;
  moves: number;
  score: number;
  stars: PuzzleStarRating;
  completedAt: number;
}

export interface DailyChallengeState {
  lastAttemptDateKey: string | null;
  lastResult: DailyAttemptResult | null;
  history: Record<string, DailyAttemptResult>;
}

export function createInitialDailyChallengeState(): DailyChallengeState {
  return {
    lastAttemptDateKey: null,
    lastResult: null,
    history: {},
  };
}
