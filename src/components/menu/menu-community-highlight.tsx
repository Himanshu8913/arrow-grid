import { playSfx } from "@/audio";
import { getAverageRating } from "@/engine/custom-puzzle";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import { GlobeIcon } from "@/ui/icons";

export interface MenuCommunityHighlightProps {
  onOpenCommunity: () => void;
}

/**
 * Highlights the top-rated community puzzle when available.
 */
export function MenuCommunityHighlight({
  onOpenCommunity,
}: MenuCommunityHighlightProps) {
  useCustomPuzzleStore((state) => state.puzzles);
  const featured = useCustomPuzzleStore.getState().listPuzzles("rating")[0];

  if (!featured) {
    return null;
  }

  return (
    <button
      type="button"
      className="menu-insight-card menu-interactive-card w-full text-left"
      onClick={() => {
        playSfx("click");
        onOpenCommunity();
      }}
      onMouseEnter={() => playSfx("hover")}
    >
      <div className="flex items-start gap-3">
        <span className="menu-feature-icon" aria-hidden="true">
          <GlobeIcon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-accent-primary">
            Community highlight
          </p>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {featured.puzzle.title}
          </p>
          <p className="mt-1 text-xs text-text-muted">
            Top rated · {getAverageRating(featured).toFixed(1)} stars · by{" "}
            {featured.meta.authorName || "Community"}
          </p>
        </span>
      </div>
    </button>
  );
}
