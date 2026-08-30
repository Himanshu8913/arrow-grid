import type { InvalidMoveReason, PlayerId } from "@/types/game";

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
  if (gameMode === "puzzle" || gameMode === "daily") {
    return 1;
  }

  return 2;
}

/**
 * Returns true when the match is human vs AI.
 */
export function isPracticeMode(gameMode: string): boolean {
  return gameMode === "practice";
}

export function isPuzzleMode(gameMode: string): boolean {
  return gameMode === "puzzle";
}

export function isDailyChallengeMode(gameMode: string): boolean {
  return gameMode === "daily";
}

/**
 * Puzzle or daily challenge — shared single-player move-limit flow.
 */
export function isSoloChallengeMode(gameMode: string): boolean {
  return isPuzzleMode(gameMode) || isDailyChallengeMode(gameMode);
}

/**
 * Returns true when the local human can take a turn in the current mode.
 */
export function isHumanPlayerTurn(
  gameMode: string,
  currentPlayer: PlayerId,
): boolean {
  if (isPracticeMode(gameMode) && currentPlayer !== "player1") {
    return false;
  }

  return true;
}

const playerLabels: Record<PlayerId, string> = {
  player1: "Player 1",
  player2: "Player 2",
};

/**
 * Returns display label for a player id.
 */
export function getPlayerLabel(playerId: PlayerId, gameMode?: string): string {
  if (gameMode && isPracticeMode(gameMode)) {
    return playerId === "player1" ? "You" : "AI";
  }

  return playerLabels[playerId];
}
