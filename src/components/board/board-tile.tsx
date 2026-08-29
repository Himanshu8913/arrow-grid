import { memo } from "react";

import { ArrowGlyph } from "@/components/board/arrow-glyph";
import { playSfx } from "@/audio";
import type { PlayerId, Position, Tile } from "@/types/game";
import { cn } from "@/utils/cn";
import { shouldUseVirtualTiles } from "@/utils/virtual-board";

export interface BoardTileProps {
  tile: Tile;
  position: Position;
  isSpawn?: boolean;
  isSelected?: boolean;
  isOnPath?: boolean;
  trailOpacity?: number;
  isGoalCelebrating?: boolean;
  isLoopTile?: boolean;
  isLoopPulsing?: boolean;
  isHinted?: boolean;
  isArrowRotating?: boolean;
  disabled?: boolean;
  onClick?: (position: Position) => void;
  boardSize?: number;
}

const goalStyles: Record<PlayerId, string> = {
  player1: "border-accent-primary/60 bg-accent-primary/20 text-accent-primary",
  player2: "border-accent-secondary/60 bg-accent-secondary/20 text-accent-secondary",
};

function boardTilePropsAreEqual(
  previous: BoardTileProps,
  next: BoardTileProps,
): boolean {
  return (
    previous.tile === next.tile &&
    previous.position.row === next.position.row &&
    previous.position.col === next.position.col &&
    previous.isSpawn === next.isSpawn &&
    previous.isSelected === next.isSelected &&
    previous.isOnPath === next.isOnPath &&
    previous.trailOpacity === next.trailOpacity &&
    previous.isGoalCelebrating === next.isGoalCelebrating &&
    previous.isLoopTile === next.isLoopTile &&
    previous.isLoopPulsing === next.isLoopPulsing &&
    previous.isHinted === next.isHinted &&
    previous.isArrowRotating === next.isArrowRotating &&
    previous.disabled === next.disabled &&
    previous.boardSize === next.boardSize &&
    previous.onClick === next.onClick
  );
}

/**
 * Renders a single board cell with tile-specific visuals.
 */
export const BoardTile = memo(function BoardTile({
  tile,
  position,
  isSpawn = false,
  isSelected = false,
  isOnPath = false,
  trailOpacity,
  isGoalCelebrating = false,
  isLoopTile = false,
  isLoopPulsing = false,
  isHinted = false,
  isArrowRotating = false,
  disabled = false,
  onClick,
  boardSize,
}: BoardTileProps) {
  const isInteractive = Boolean(onClick) && !disabled;
  const useVirtualTile =
    boardSize !== undefined && shouldUseVirtualTiles(boardSize);

  return (
    <button
      type="button"
      aria-label={`Tile row ${position.row + 1}, column ${position.col + 1}`}
      disabled={!isInteractive}
      onMouseEnter={() => {
        if (isInteractive) {
          playSfx("hover");
        }
      }}
      onClick={() => {
        if (isInteractive) {
          playSfx("click");
        }
        onClick?.(position);
      }}
      className={cn(
        "relative flex aspect-square items-center justify-center rounded-tile",
        useVirtualTile && "board-tile-virtual",
        "border border-bg-card/80 bg-bg-card shadow-[var(--shadow-soft)]",
        "transition-all duration-200 ease-out",
        isInteractive &&
          "cursor-pointer hover:-translate-y-0.5 hover:border-accent-primary/40 hover:shadow-[var(--shadow-medium)]",
        isSelected &&
          "ring-2 ring-accent-primary ring-offset-2 ring-offset-bg-surface tile-selection-breathe",
        isOnPath && !trailOpacity && "bg-accent-primary/10",
        trailOpacity !== undefined &&
          "bg-accent-primary/30 transition-opacity duration-500 ease-out",
        disabled && "cursor-not-allowed opacity-70",
        tile.kind === "wall" && "bg-bg-primary text-text-muted",
        tile.kind === "empty" && "bg-bg-surface/60",
        tile.kind === "goal" && goalStyles[tile.owner],
        isGoalCelebrating && "goal-tile-celebrate z-10",
        isLoopTile && "loop-tile-highlight",
        isLoopPulsing && "loop-tile-pulse z-10",
        isHinted && "ring-2 ring-warning ring-offset-2 ring-offset-bg-surface",
      )}
      style={
        trailOpacity !== undefined
          ? { opacity: 0.35 + trailOpacity * 0.45 }
          : undefined
      }
    >
      {tile.kind === "arrow" ? (
        <ArrowGlyph direction={tile.direction} isRotating={isArrowRotating} />
      ) : null}
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
    </button>
  );
}, boardTilePropsAreEqual);
