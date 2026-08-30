import { useMemo } from "react";

import type { GameState } from "@/engine/game-state";
import { getPlayerLabel, isPracticeMode } from "@/utils/game-messages";

export interface GameStatusAnnouncerProps {
  game: GameState;
  gameMode: string;
  isAiThinking?: boolean;
  isInputLocked?: boolean;
}

/**
 * Screen-reader announcements for turn and match status changes.
 */
export function GameStatusAnnouncer({
  game,
  gameMode,
  isAiThinking = false,
  isInputLocked = false,
}: GameStatusAnnouncerProps) {
  const message = useMemo(() => {
    if (game.status === "won" && game.winner) {
      return `${getPlayerLabel(game.winner, gameMode)} won the match.`;
    }

    if (game.status === "lost") {
      return "The match ended in a loss.";
    }

    if (game.status !== "in-progress") {
      return "";
    }

    if (isAiThinking) {
      return isPracticeMode(gameMode)
        ? "AI is thinking."
        : `${getPlayerLabel("player2", gameMode)} is thinking.`;
    }

    if (isInputLocked) {
      return "Waiting for orb movement.";
    }

    if (isPracticeMode(gameMode)) {
      return game.currentPlayer === "player1"
        ? "Your turn. Use arrow keys to move between tiles."
        : `${getPlayerLabel("player2", gameMode)}'s turn.`;
    }

    return `${getPlayerLabel(game.currentPlayer, gameMode)}'s turn. Turn ${game.turnNumber}.`;
  }, [game, gameMode, isAiThinking, isInputLocked]);

  if (!message) {
    return null;
  }

  return (
    <p className="sr-only" aria-live="polite" aria-atomic="true">
      {message}
    </p>
  );
}
