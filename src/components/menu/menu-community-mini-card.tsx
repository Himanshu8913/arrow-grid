import { playSfx } from "@/audio";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import { getAverageRating } from "@/engine/custom-puzzle";
import { GlobeIcon } from "@/ui/icons";

export interface MenuCommunityMiniCardProps {
  onOpenCommunity: () => void;
}

export function MenuCommunityMiniCard({ onOpenCommunity }: MenuCommunityMiniCardProps) {
  const featured = useCustomPuzzleStore((state) => state.listPuzzles("rating")[0]);

  return (
    <button
      type="button"
      className="menu-dashboard__card menu-dashboard__mini-card h-full"
      onClick={() => {
        playSfx("click");
        onOpenCommunity();
      }}
      onMouseEnter={() => playSfx("hover")}
    >
      <GlobeIcon size={18} className="text-accent-primary" />
      <p className="mt-2 text-sm font-semibold text-text-primary">Community</p>
      <p className="mt-1 text-xs text-text-muted">
        {featured
          ? `Top rated · ${getAverageRating(featured).toFixed(1)}★`
          : "Browse shared puzzles"}
      </p>
      <p className="mt-2 text-xs font-semibold text-accent-primary">Open library</p>
    </button>
  );
}
