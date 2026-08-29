import type { DailyAttemptResult, DailyLeaderboardEntry } from "@/types/daily-challenge";
import type { PuzzleStarRating } from "@/types/puzzle";

/**
 * Builds a leaderboard-ready entry from a completed daily attempt.
 */
export function buildDailyLeaderboardEntry(
  playerName: string,
  result: DailyAttemptResult,
): DailyLeaderboardEntry | null {
  if (result.outcome !== "win" || result.stars === null) {
    return null;
  }

  return {
    playerName,
    dateKey: result.dateKey,
    moves: result.movesPlayed,
    score: result.score,
    stars: result.stars,
    completedAt: result.completedAt,
  };
}

/**
 * Formats a daily date key for display.
 */
export function formatDailyDateLabel(dateKey: string): string {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));

  return date.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Returns a star display string for a daily rating.
 */
export function formatDailyStars(stars: PuzzleStarRating | null): string {
  if (!stars) {
    return "—";
  }

  return `${"★".repeat(stars)}${"☆".repeat(3 - stars)}`;
}
