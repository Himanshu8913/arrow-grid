import { generateBoard } from "@/engine/board-generator";
import { createGameState } from "@/engine/game-state";
import type { GameState } from "@/engine/game-state";

export const DAILY_BOARD_SIZE = 5;
export const DAILY_TARGET_MOVES = 3;
export const DAILY_MOVE_LIMIT = 8;
const DAILY_SHORTEST_PATH = 5;

/**
 * Returns the UTC date key used for the global daily puzzle (YYYY-MM-DD).
 */
export function getDailyDateKey(date = new Date()): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Derives a deterministic seed from a daily date key.
 */
export function getDailySeed(dateKey: string): number {
  let hash = 0;

  for (let index = 0; index < dateKey.length; index += 1) {
    hash = (hash * 31 + dateKey.charCodeAt(index)) >>> 0;
  }

  return hash || 1;
}

/**
 * Builds the puzzle id for a daily challenge date.
 */
export function getDailyPuzzleId(dateKey: string): string {
  return `daily-${dateKey}`;
}

export function isDailyPuzzleId(puzzleId: string | undefined): boolean {
  return puzzleId?.startsWith("daily-") ?? false;
}

/**
 * Creates the same single-player board for everyone on a given UTC day.
 */
export function createDailyChallengeGame(
  dateKey: string = getDailyDateKey(),
): GameState {
  const generated = generateBoard({
    seed: getDailySeed(dateKey),
    size: DAILY_BOARD_SIZE,
    playerCount: 1,
    maxAttempts: 100,
  });

  return createGameState(generated, {
    playerCount: 1,
    targetMoves: DAILY_TARGET_MOVES,
    moveLimit: DAILY_MOVE_LIMIT,
    shortestPathLength: DAILY_SHORTEST_PATH,
    puzzleId: getDailyPuzzleId(dateKey),
  });
}
