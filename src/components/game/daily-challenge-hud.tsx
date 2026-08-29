import { getDailyDateKey } from "@/engine/daily-challenge";
import type { GameState } from "@/engine/game-state";
import { useDailyChallengeStore } from "@/state/daily-challenge-store";
import { formatDailyDateLabel, formatDailyStars } from "@/utils/daily-challenge";
import type { PuzzleStarRating } from "@/types/puzzle";

export interface DailyChallengeHudProps {
  game: GameState;
  earnedStars: PuzzleStarRating | null;
}

/**
 * HUD for the daily challenge mode with date and attempt status.
 */
export function DailyChallengeHud({ game, earnedStars }: DailyChallengeHudProps) {
  const dateKey = getDailyDateKey();
  const todayResult = useDailyChallengeStore(
    (state) => state.history[dateKey] ?? null,
  );
  const movesRemaining =
    game.moveLimit !== undefined
      ? Math.max(game.moveLimit - game.movesPlayed, 0)
      : null;

  return (
    <div className="rounded-2xl border border-accent-primary/30 bg-accent-primary/10 px-4 py-3 text-left">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-primary">
            Daily Challenge
          </p>
          <p className="text-sm font-medium text-text-primary">
            {formatDailyDateLabel(dateKey)}
          </p>
        </div>
        <p className="text-xs text-text-muted">One attempt per day</p>
      </div>

      <dl className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
        <div>
          <dt className="text-xs text-text-muted">Moves left</dt>
          <dd className="font-semibold tabular-nums text-text-primary">
            {movesRemaining ?? "—"}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Score</dt>
          <dd className="font-semibold tabular-nums text-text-primary">
            {game.players.player1.totalScore}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-text-muted">Stars</dt>
          <dd className="font-semibold text-warning">
            {game.status === "won"
              ? formatDailyStars(earnedStars)
              : todayResult?.stars
                ? formatDailyStars(todayResult.stars)
                : "—"}
          </dd>
        </div>
      </dl>
    </div>
  );
}
