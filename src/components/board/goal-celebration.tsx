import { useMemo } from "react";
import type { CSSProperties } from "react";

import {
  BOARD_TILE_GAP_PX,
  GOAL_CELEBRATION_MS,
  GOAL_PARTICLE_COUNT,
} from "@/constants/animation";
import { useSeasonalParticleVariant } from "@/hooks/use-seasonal";
import type { PlayerId, Position } from "@/types/game";
import { cn } from "@/utils/cn";

export interface GoalCelebrationProps {
  position: Position;
  gridSize: number;
  score: number;
  owner: PlayerId;
  gap?: number;
}

function getTileCenterStyle(
  row: number,
  col: number,
  size: number,
  gap: number,
): CSSProperties {
  const cellExpr = `(100% - ${(size - 1) * gap}px) / ${size}`;

  return {
    left: `calc((${cellExpr}) * ${col} + ${gap * col}px + (${cellExpr}) / 2)`,
    top: `calc((${cellExpr}) * ${row} + ${gap * row}px + (${cellExpr}) / 2)`,
    transform: "translate(-50%, -50%)",
  };
}

const ownerGlow: Record<PlayerId, string> = {
  player1: "bg-accent-primary/35 shadow-[0_0_28px_rgba(59,130,246,0.75)]",
  player2: "bg-accent-secondary/35 shadow-[0_0_28px_rgba(168,85,247,0.75)]",
};

const ownerParticle: Record<PlayerId, string> = {
  player1: "bg-accent-primary",
  player2: "bg-accent-secondary",
};

const ownerScoreText: Record<PlayerId, string> = {
  player1: "text-accent-primary",
  player2: "text-accent-secondary",
};

/**
 * Goal celebration overlay with particles, glow pulse, and score popup.
 */
export function GoalCelebration({
  position,
  gridSize,
  score,
  owner,
  gap = BOARD_TILE_GAP_PX,
}: GoalCelebrationProps) {
  const particleVariant = useSeasonalParticleVariant();
  const useSeasonalParticles = particleVariant !== "default";

  const centerStyle = useMemo(
    () => getTileCenterStyle(position.row, position.col, gridSize, gap),
    [gap, gridSize, position.col, position.row],
  );

  const particles = useMemo(
    () =>
      Array.from({ length: GOAL_PARTICLE_COUNT }, (_, index) => {
        const angle = (index / GOAL_PARTICLE_COUNT) * Math.PI * 2;
        const distance = 28;
        return {
          id: index,
          style: {
            "--particle-tx": `${Math.cos(angle) * distance}px`,
            "--particle-ty": `${Math.sin(angle) * distance}px`,
          } as CSSProperties,
        };
      }),
    [],
  );

  return (
    <div
      className="pointer-events-none absolute inset-0 z-20"
      style={{ animationDuration: `${GOAL_CELEBRATION_MS}ms` }}
      aria-hidden
    >
      <span
        className={cn(
          "goal-glow-pulse absolute size-16 rounded-full",
          ownerGlow[owner],
        )}
        style={centerStyle}
      />

      {particles.map((particle) => (
        <span
          key={particle.id}
          className={cn(
            "goal-particle absolute size-2 rounded-full",
            useSeasonalParticles ? "seasonal-particle" : ownerParticle[owner],
          )}
          style={{ ...centerStyle, ...particle.style }}
        />
      ))}

      <span
        className={cn(
          "score-popup-rise absolute whitespace-nowrap text-lg font-bold",
          ownerScoreText[owner],
        )}
        style={centerStyle}
      >
        +{score}
      </span>
    </div>
  );
}
