import type { PuzzleStarRating } from "@/types/puzzle";

export type AchievementId =
  | "first-win"
  | "century-club"
  | "perfect-puzzle"
  | "no-loops"
  | "streak-10"
  | "puzzle-solver";

export interface AchievementDefinition {
  id: AchievementId;
  title: string;
  description: string;
  icon: string;
}

export interface AchievementUnlockState {
  unlockedIds: AchievementId[];
  unlockedAt: Partial<Record<AchievementId, number>>;
}

export interface AchievementCheckContext {
  stats: {
    gamesPlayed: number;
    wins: number;
    bestStreak: number;
    puzzlesCompleted: number;
  };
  match?: {
    outcome: "win" | "loss";
    gameMode: string;
    loopsInMatch: number;
    hintsUsed: number;
    stars: PuzzleStarRating | null;
  };
}

export function createInitialAchievementState(): AchievementUnlockState {
  return {
    unlockedIds: [],
    unlockedAt: {},
  };
}
