import { ArrowGlyph } from "@/components/board/arrow-glyph";
import type { PlayerId, Position, Tile } from "@/types/game";
import { cn } from "@/utils/cn";

export interface BoardTileProps {
  tile: Tile;
  position: Position;
  isSpawn?: boolean;
  isSelected?: boolean;
  isOrb?: boolean;
  isOnPath?: boolean;
  disabled?: boolean;
  onClick?: (position: Position) => void;
}

const goalStyles: Record<PlayerId, string> = {
  player1: "border-accent-primary/60 bg-accent-primary/20 text-accent-primary",
  player2: "border-accent-secondary/60 bg-accent-secondary/20 text-accent-secondary",
};

/**
 * Renders a single board cell with tile-specific visuals.
 */
export function BoardTile({
  tile,
  position,
  isSpawn = false,
  isSelected = false,
  isOrb = false,
  isOnPath = false,
  disabled = false,
  onClick,
}: BoardTileProps) {
  const isInteractive = Boolean(onClick) && !disabled;

  return (
    <button
      type="button"
      aria-label={`Tile row ${position.row + 1}, column ${position.col + 1}`}
      disabled={!isInteractive}
      onClick={() => onClick?.(position)}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-tile",
        "border border-bg-card/80 bg-bg-card shadow-[var(--shadow-soft)]",
        "transition-all duration-200 ease-out",
        isInteractive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-accent-primary/40 hover:shadow-[var(--shadow-medium)]",
        isSelected &&
          "ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-surface",
        isOnPath && "bg-accent-primary/10",
        disabled && "cursor-not-allowed opacity-70",
        tile.kind === "wall" && "bg-bg-primary text-text-muted",
        tile.kind === "empty" && "bg-bg-surface/60",
        tile.kind === "goal" && goalStyles[tile.owner],
      )}
    >
      {tile.kind === "arrow" ? <ArrowGlyph direction={tile.direction} /> : null}
      {tile.kind === "wall" ? (
        <span className="text-lg font-bold text-text-muted">■</span>
      ) : null}
      {tile.kind === "goal" ? (
        <span className="text-xs font-bold uppercase tracking-wide">Goal</span>
      ) : null}
      {tile.kind === "empty" ? (
        <span className="size-2 rounded-full bg-bg-card" />
      ) : null}

      {isSpawn ? (
        <span
          aria-label="Spawn point"
          className="absolute right-1 top-1 size-2 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]"
        />
      ) : null}

      {isOrb ? (
        <span
          aria-label="Energy orb"
          className="absolute inset-[28%] rounded-full bg-accent-primary shadow-[0_0_16px_rgba(59,130,246,0.9)] ring-2 ring-white/40"
        />
      ) : null}
    </button>
  );
}
