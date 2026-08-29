import type { GameState } from "@/engine/game-state";
import { cn } from "@/utils/cn";
import { getPuzzleDisplayInfo } from "@/utils/puzzle-display";
import type { PuzzleStarRating } from "@/types/puzzle";

export interface PuzzleHudProps {
  game: GameState;
  hintsUsed: number;
  earnedStars: PuzzleStarRating | null;
}

function renderStars(stars: PuzzleStarRating | null, max = 3) {
  return Array.from({ length: max }, (_, index) => (
    <span
      key={index}
      className={cn(
        "text-base",
        stars !== null && index < stars ? "text-warning" : "text-text-muted/40",
      )}
      aria-hidden
    >
      ★
    </span>
  ));
}

/**
 * Puzzle move counter, limits, and star display.
 */
export function PuzzleHud({ game, hintsUsed, earnedStars }: PuzzleHudProps) {
  const puzzleInfo = getPuzzleDisplayInfo(game);
  const moveLimit = game.moveLimit ?? 0;
  const targetMoves = game.targetMoves ?? 0;
  const movesRemaining = Math.max(moveLimit - game.movesPlayed, 0);

  return (
    <div className="space-y-2 rounded-2xl border border-bg-card bg-bg-card px-4 py-3 text-left text-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-text-primary">{puzzleInfo.title}</p>
          <p className="text-xs text-text-muted">{puzzleInfo.description}</p>
        </div>
        <div className="flex items-center gap-0.5" aria-label="Puzzle stars">
          {renderStars(earnedStars)}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
        <span>
          Moves {game.movesPlayed}
          {moveLimit > 0 ? ` / ${moveLimit}` : ""}
        </span>
        <span>{movesRemaining} remaining</span>
        <span>Par {targetMoves}</span>
        <span>Hints {hintsUsed}</span>
      </div>
    </div>
  );
}
