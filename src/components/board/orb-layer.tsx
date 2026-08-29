import { useMemo } from "react";
import type { CSSProperties } from "react";

import {
  BOARD_TILE_GAP_PX,
  ORB_SPAWN_MS,
  ORB_STEP_MS,
} from "@/constants/animation";
import type { Position } from "@/types/game";
import { cn } from "@/utils/cn";

export interface OrbLayerProps {
  position: Position;
  gridSize: number;
  gap?: number;
  isSpawning?: boolean;
  isFading?: boolean;
  className?: string;
}

function getOrbCenterStyle(
  row: number,
  col: number,
  size: number,
  gap: number,
): CSSProperties {
  const cellExpr = `(100% - ${(size - 1) * gap}px) / ${size}`;

  return {
    left: `calc((${cellExpr}) * ${col} + ${gap * col}px + (${cellExpr}) / 2)`,
    top: `calc((${cellExpr}) * ${row} + ${gap * row}px + (${cellExpr}) / 2)`,
    width: `calc((${cellExpr}) * 0.44)`,
    height: `calc((${cellExpr}) * 0.44)`,
    transform: "translate(-50%, -50%)",
    transition: `left ${ORB_STEP_MS}ms ease-out, top ${ORB_STEP_MS}ms ease-out`,
  };
}

/**
 * Absolutely positioned energy orb that glides between tile centers.
 */
export function OrbLayer({
  position,
  gridSize,
  gap = BOARD_TILE_GAP_PX,
  isSpawning = false,
  isFading = false,
  className,
}: OrbLayerProps) {
  const style = useMemo(
    () => ({
      ...getOrbCenterStyle(position.row, position.col, gridSize, gap),
      transition: isSpawning
        ? "none"
        : `left ${ORB_STEP_MS}ms ease-out, top ${ORB_STEP_MS}ms ease-out`,
      animationDuration: isSpawning ? `${ORB_SPAWN_MS}ms` : undefined,
    }),
    [gap, gridSize, isSpawning, position.col, position.row],
  );

  return (
    <span
      aria-label="Energy orb"
      className={cn(
        "pointer-events-none absolute z-10 rounded-full bg-accent-primary",
        "shadow-[0_0_16px_rgba(59,130,246,0.9)] ring-2 ring-white/40",
        isSpawning && "orb-spawn-enter",
        isFading && "orb-fade-out",
        className,
      )}
      style={style}
    />
  );
}
