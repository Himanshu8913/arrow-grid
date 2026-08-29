import type { GameState } from "@/engine/game-state";
import { getPlayerLabel } from "@/utils/game-messages";
import { Badge } from "@/ui/badge";

export interface TurnIndicatorProps {
  game: GameState;
}

/**
 * Shows whose turn it is during an in-progress PvP match.
 */
export function TurnIndicator({ game }: TurnIndicatorProps) {
  if (game.playerCount !== 2 || game.status !== "in-progress") {
    return null;
  }

  return (
    <div className="flex items-center justify-center gap-2">
      <Badge
        variant={game.currentPlayer === "player1" ? "primary" : "secondary"}
      >
        {getPlayerLabel(game.currentPlayer)}&apos;s turn
      </Badge>
      <span className="text-xs text-text-muted">Turn {game.turnNumber}</span>
    </div>
  );
}
