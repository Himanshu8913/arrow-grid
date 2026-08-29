import { DIRECTION_ROTATION_ORDER } from "@/constants/game";
import type { Direction } from "@/types/game";

const directionIndex = new Map<Direction, number>(
  DIRECTION_ROTATION_ORDER.map((direction, index) => [direction, index]),
);

/**
 * Rotates a direction one step clockwise (`up → right → down → left`).
 */
export function rotateDirectionClockwise(direction: Direction): Direction {
  const currentIndex = directionIndex.get(direction);

  if (currentIndex === undefined) {
    throw new Error(`Invalid direction: ${direction}`);
  }

  const nextIndex = (currentIndex + 1) % DIRECTION_ROTATION_ORDER.length;
  return DIRECTION_ROTATION_ORDER[nextIndex];
}

/**
 * Returns the row/column delta for moving one tile in `direction`.
 */
export function getDirectionDelta(direction: Direction): {
  row: number;
  col: number;
} {
  switch (direction) {
    case "up":
      return { row: -1, col: 0 };
    case "down":
      return { row: 1, col: 0 };
    case "left":
      return { row: 0, col: -1 };
    case "right":
      return { row: 0, col: 1 };
  }
}

/**
 * Type guard for validating externally supplied direction strings.
 */
export function isDirection(value: string): value is Direction {
  return directionIndex.has(value as Direction);
}
