import type { InvalidMoveReason } from "@/types/game";

const moveErrorMessages: Record<InvalidMoveReason, string> = {
  "out-of-bounds": "That tile is outside the board.",
  "not-arrow": "Only arrow tiles can be rotated.",
  wall: "Walls cannot be rotated.",
  goal: "Goals cannot be rotated.",
  spawn: "The spawn tile cannot be rotated.",
  empty: "Empty tiles cannot be rotated.",
  "game-over": "This match has already ended.",
};

/**
 * Converts engine move errors into player-facing copy.
 */
export function getMoveErrorMessage(reason: InvalidMoveReason): string {
  return moveErrorMessages[reason];
}

/**
 * Maps UI game mode values to engine player counts.
 */
export function getPlayerCountForMode(
  gameMode: string,
): 1 | 2 {
  return gameMode === "pvp" ? 2 : 1;
}
