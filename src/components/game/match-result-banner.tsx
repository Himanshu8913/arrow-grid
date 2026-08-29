import type { GameState } from "@/engine/game-state";
import { getPlayerLabel } from "@/utils/game-messages";

export interface MatchResultBannerProps {
  game: GameState;
}

/**
 * Displays the winner when a match has ended.
 */
export function MatchResultBanner({ game }: MatchResultBannerProps) {
  if (game.status !== "won" || !game.winner) {
    return null;
  }

  const winnerLabel = getPlayerLabel(game.winner);
  const winnerPoints = game.players[game.winner].matchPoints;
  const winnerScore = game.players[game.winner].totalScore;

  return (
    <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-center">
      <p className="text-lg font-semibold text-success">
        {winnerLabel} wins the match!
      </p>
      <p className="mt-1 text-sm text-text-muted">
        {winnerPoints} match points · {winnerScore} total score
      </p>
      <p className="mt-2 text-xs text-text-muted">
        Press Play to start a new match.
      </p>
    </div>
  );
}
