import { ACHIEVEMENTS } from "@/data/achievements";
import type { AchievementId } from "@/types/achievement";
import type { PlayerStatistics } from "@/types/statistics";

export interface AchievementSpotlight {
  id: AchievementId;
  title: string;
  description: string;
  current: number;
  target: number;
}

function getAchievementProgress(
  id: AchievementId,
  stats: PlayerStatistics,
): { current: number; target: number } | null {
  switch (id) {
    case "first-win":
      return { current: stats.wins, target: 1 };
    case "century-club":
      return { current: stats.gamesPlayed, target: 100 };
    case "streak-10":
      return { current: stats.bestStreak, target: 10 };
    case "puzzle-solver":
      return { current: stats.puzzlesCompleted, target: 1 };
    case "daily-challenge-winner":
      return { current: stats.dailyChallengesWon, target: 1 };
    default:
      return null;
  }
}

/**
 * Returns the closest in-progress achievement for the home spotlight card.
 */
export function getAchievementSpotlight(
  unlockedIds: AchievementId[],
  stats: PlayerStatistics,
): AchievementSpotlight | null {
  const unlocked = new Set(unlockedIds);
  let best: AchievementSpotlight | null = null;
  let bestRatio = -1;

  for (const achievement of ACHIEVEMENTS) {
    if (unlocked.has(achievement.id)) {
      continue;
    }

    const progress = getAchievementProgress(achievement.id, stats);

    if (!progress || progress.target <= 0) {
      continue;
    }

    const ratio = progress.current / progress.target;

    if (ratio >= 1 || ratio <= bestRatio) {
      continue;
    }

    bestRatio = ratio;
    best = {
      id: achievement.id,
      title: achievement.title,
      description: achievement.description,
      current: Math.min(progress.current, progress.target),
      target: progress.target,
    };
  }

  return best;
}
