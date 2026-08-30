import type { DailyAttemptResult } from "@/types/daily-challenge";
import { formatDailyStars } from "@/utils/daily-challenge";

/**
 * Milliseconds until the next UTC daily puzzle resets.
 */
export function getDailyTimeRemainingMs(now = new Date()): number {
  const nextUtcDay = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1),
  );

  return Math.max(0, nextUtcDay.getTime() - now.getTime());
}

/**
 * Formats remaining time until the next daily challenge.
 */
export function formatDailyTimeRemaining(ms: number): string {
  const totalMinutes = Math.floor(ms / 60_000);
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")} remaining`;
}

/**
 * Counts consecutive days with a daily attempt ending at today (UTC).
 */
export function getDailyChallengeStreak(
  history: Record<string, DailyAttemptResult>,
  now = new Date(),
): number {
  let streak = 0;
  const cursor = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  while (true) {
    const dateKey = cursor.toISOString().slice(0, 10);

    if (!history[dateKey]) {
      break;
    }

    streak += 1;
    cursor.setUTCDate(cursor.getUTCDate() - 1);
  }

  return streak;
}

export function formatDailyChallengeStars(
  stars: DailyAttemptResult["stars"],
): string {
  return formatDailyStars(stars);
}
