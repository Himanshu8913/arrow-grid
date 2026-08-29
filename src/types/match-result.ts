import type { GameState } from "@/engine/game-state";
import type { AchievementId } from "@/types/achievement";
import type { PuzzleStarRating } from "@/types/puzzle";
import type { MatchRewards } from "@/utils/match-rewards";

export interface MatchResultSummary {
  game: GameState;
  elapsedSeconds: number;
  stars: PuzzleStarRating | null;
  rewards: MatchRewards;
  unlockedAchievements: AchievementId[];
}
