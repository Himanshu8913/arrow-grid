import type { GameState } from "@/engine/game-state";
import { getPlayerLabel, isPracticeMode } from "@/utils/game-messages";
import { Badge } from "@/ui/badge";

export interface TurnIndicatorProps {
  game: GameState;
  gameMode: string;
  isAiThinking?: boolean;
}

/**
 * Shows whose turn it is during an in-progress match.
 */
export function TurnIndicator({
  game,
  gameMode,
  isAiThinking = false,
}: TurnIndicatorProps) {
  if (game.status !== "in-progress") {
    return null;
  }

  if (isPracticeMode(gameMode)) {
    if (isAiThinking) {
      return null;
    }

    return (
      <div
        className="flex items-center justify-center gap-2"
        aria-live="polite"
        aria-atomic="true"
      >
        <Badge variant={game.currentPlayer === "player1" ? "primary" : "secondary"}>
          {game.currentPlayer === "player1"
            ? "Your turn"
            : `${getPlayerLabel("player2", gameMode)}'s turn`}
        </Badge>
        <span className="text-xs text-text-muted">Turn {game.turnNumber}</span>
      </div>
    );
  }

  if (game.playerCount !== 2) {
    return null;
  }

  return (
    <div
      className="flex items-center justify-center gap-2"
      aria-live="polite"
      aria-atomic="true"
    >
      <Badge
        variant={game.currentPlayer === "player1" ? "primary" : "secondary"}
      >
        {getPlayerLabel(game.currentPlayer, gameMode)}&apos;s turn
      </Badge>
      <span className="text-xs text-text-muted">Turn {game.turnNumber}</span>
    </div>
  );
}
