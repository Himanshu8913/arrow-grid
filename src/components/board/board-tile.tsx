import { memo, useRef, type Ref } from "react";

import { ArrowGlyph } from "@/components/board/arrow-glyph";
import { playSfx } from "@/audio";
import type { PlayerId, Position, Tile } from "@/types/game";
import { cn } from "@/utils/cn";
import { shouldUseVirtualTiles } from "@/utils/virtual-board";

export interface BoardTileProps {
  tile: Tile;
  position: Position;
  ariaLabel: string;
  tabIndex?: number;
  tileRef?: Ref<HTMLButtonElement>;
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
  onFocus?: (position: Position) => void;
  boardSize?: number;
}

const goalStyles: Record<PlayerId, string> = {
  player1:
    "goal-tile-player1 border-accent-primary/60 bg-accent-primary/20 text-accent-primary",
  player2:
    "goal-tile-player2 border-accent-secondary/60 bg-accent-secondary/20 text-accent-secondary",
};

const directionMarkers: Record<string, string> = {
  up: "N",
  right: "E",
  down: "S",
  left: "W",
};

function boardTilePropsAreEqual(
  previous: BoardTileProps,
  next: BoardTileProps,
): boolean {
  return (
    previous.tile === next.tile &&
    previous.position.row === next.position.row &&
    previous.position.col === next.position.col &&
    previous.ariaLabel === next.ariaLabel &&
    previous.tabIndex === next.tabIndex &&
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
    previous.onClick === next.onClick &&
    previous.onFocus === next.onFocus &&
    previous.tileRef === next.tileRef
  );
}

/**
 * Renders a single board cell with tile-specific visuals.
 */
export const BoardTile = memo(function BoardTile({
  tile,
  position,
  ariaLabel,
  tabIndex,
  tileRef,
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
  onFocus,
  boardSize,
}: BoardTileProps) {
  const isInteractive = Boolean(onClick) && !disabled;
  const useVirtualTile =
    boardSize !== undefined && shouldUseVirtualTiles(boardSize);
  const canPlayHoverSfx = useRef(
    typeof window === "undefined" ||
      window.matchMedia("(hover: hover) and (pointer: fine)").matches,
  ).current;

  return (
    <button
      ref={tileRef}
      type="button"
      role="gridcell"
      aria-label={ariaLabel}
      aria-disabled={disabled || undefined}
      tabIndex={isInteractive ? tabIndex : undefined}
      disabled={!isInteractive}
      onFocus={() => onFocus?.(position)}
      onMouseEnter={() => {
        if (isInteractive && canPlayHoverSfx) {
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
        "board-tile-button relative flex aspect-square items-center justify-center rounded-tile",
        useVirtualTile && "board-tile-virtual",
        tile.kind === "arrow" && "board-tile-arrow",
        "border border-bg-card/80 bg-bg-card shadow-[var(--shadow-soft)]",
        "transition-all duration-200 ease-out",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-surface",
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
      data-direction={
        tile.kind === "arrow" ? directionMarkers[tile.direction] : undefined
      }
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
        <span className="text-lg font-bold text-text-muted" aria-hidden="true">
          ■
        </span>
      ) : null}
      {tile.kind === "goal" ? (
        <span className="text-xs font-bold uppercase tracking-wide">
          <span className="sr-only">
            {tile.owner === "player1" ? "Player 1" : "Player 2"} goal
          </span>
          <span aria-hidden="true">
            {tile.owner === "player1" ? "P1" : "P2"}
          </span>
        </span>
      ) : null}
      {tile.kind === "empty" ? (
        <span className="size-2 rounded-full bg-bg-card" aria-hidden="true" />
      ) : null}

      {isSpawn ? (
        <span
          aria-hidden="true"
          className="absolute right-1 top-1 size-2 rounded-full bg-warning shadow-[0_0_8px_rgba(245,158,11,0.8)]"
          title="Spawn point"
        />
      ) : null}
    </button>
  );
}, boardTilePropsAreEqual);
