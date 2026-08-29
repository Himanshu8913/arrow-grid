import { memo, type CSSProperties } from "react";

import { ARROW_ROTATION_MS } from "@/constants/animation";
import type { Direction } from "@/types/game";
import { cn } from "@/utils/cn";

const rotationDegrees: Record<Direction, number> = {
  up: 0,
  right: 90,
  down: 180,
  left: 270,
};

interface ArrowGlyphProps {
  direction: Direction;
  isRotating?: boolean;
  className?: string;
}

/**
 * Renders a centered arrow glyph rotated to match the tile direction.
 */
export const ArrowGlyph = memo(function ArrowGlyph({
  direction,
  isRotating = false,
  className,
}: ArrowGlyphProps) {
  const rotation = `${rotationDegrees[direction]}deg`;

  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block text-2xl font-bold leading-none sm:text-3xl",
        isRotating && "arrow-rotate-click",
        !isRotating && "transition-transform duration-200 ease-in-out",
        !isRotating && direction === "up" && "rotate-0",
        !isRotating && direction === "right" && "rotate-90",
        !isRotating && direction === "down" && "rotate-180",
        !isRotating && direction === "left" && "-rotate-90",
        className,
      )}
      style={
        isRotating
          ? ({
              "--arrow-rotation": rotation,
              animationDuration: `${ARROW_ROTATION_MS}ms`,
            } as CSSProperties)
          : undefined
      }
    >
      ↑
    </span>
  );
});
