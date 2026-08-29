import type {
  AchievementCheckContext,
  AchievementId,
} from "@/types/achievement";
import { isPuzzleMode } from "@/utils/game-messages";

/**
 * Returns achievement IDs that should unlock for the given context.
 */
export function getNewlyUnlockedAchievements(
  unlockedIds: AchievementId[],
  context: AchievementCheckContext,
): AchievementId[] {
  const unlocked = new Set(unlockedIds);
  const candidates: AchievementId[] = [];

  if (!unlocked.has("first-win") && context.stats.wins >= 1) {
    candidates.push("first-win");
  }

  if (!unlocked.has("century-club") && context.stats.gamesPlayed >= 100) {
    candidates.push("century-club");
  }

  if (!unlocked.has("streak-10") && context.stats.bestStreak >= 10) {
    candidates.push("streak-10");
  }

  if (
    !unlocked.has("puzzle-solver") &&
    context.stats.puzzlesCompleted >= 1
  ) {
    candidates.push("puzzle-solver");
  }

  if (context.match?.outcome === "win") {
    if (
      !unlocked.has("no-loops") &&
      context.match.loopsInMatch === 0
    ) {
      candidates.push("no-loops");
    }

    if (
      !unlocked.has("perfect-puzzle") &&
      isPuzzleMode(context.match.gameMode) &&
      context.match.stars === 3 &&
      context.match.hintsUsed === 0
    ) {
      candidates.push("perfect-puzzle");
    }
  }

  return candidates;
}
