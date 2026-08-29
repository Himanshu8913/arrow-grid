import type { Direction } from "@/types/game";
import { cn } from "@/utils/cn";

const rotationByDirection: Record<Direction, string> = {
  up: "rotate-0",
  right: "rotate-90",
  down: "rotate-180",
  left: "-rotate-90",
};

interface ArrowGlyphProps {
  direction: Direction;
  className?: string;
}

/**
 * Renders a centered arrow glyph rotated to match the tile direction.
 */
export function ArrowGlyph({ direction, className }: ArrowGlyphProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block text-2xl font-bold leading-none transition-transform duration-200 ease-in-out sm:text-3xl",
        rotationByDirection[direction],
        className,
      )}
    >
      ↑
    </span>
  );
}
