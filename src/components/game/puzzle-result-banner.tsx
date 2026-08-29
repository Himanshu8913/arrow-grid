import type { PuzzleStarRating } from "@/types/puzzle";

export interface PuzzleResultBannerProps {
  status: "won" | "lost";
  stars: PuzzleStarRating | null;
}

/**
 * Displays puzzle completion or failure messaging.
 */
export function PuzzleResultBanner({ status, stars }: PuzzleResultBannerProps) {
  if (status === "won") {
    return (
      <div className="rounded-2xl border border-success/30 bg-success/10 px-4 py-3 text-center">
        <p className="text-lg font-semibold text-success">Puzzle complete!</p>
        <p className="mt-1 text-sm text-text-muted">
          {stars === 3
            ? "Perfect solution — three stars."
            : stars === 2
              ? "Nice work — two stars."
              : "Solved — one star."}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-danger/30 bg-danger/10 px-4 py-3 text-center">
      <p className="text-lg font-semibold text-danger">Out of moves</p>
      <p className="mt-1 text-sm text-text-muted">
        Restart the puzzle or undo your last move to try again.
      </p>
    </div>
  );
}
