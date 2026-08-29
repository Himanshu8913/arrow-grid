import type { Position } from "@/types/game";

/**
 * Returns true when two board positions refer to the same cell.
 */
export function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

/**
 * Returns true when `position` lies within a square board of `size`.
 */
export function isPositionInBounds(position: Position, size: number): boolean {
  return (
    position.row >= 0 &&
    position.row < size &&
    position.col >= 0 &&
    position.col < size
  );
}

/**
 * Applies a row/column delta to a position without bounds checking.
 */
export function translatePosition(
  position: Position,
  delta: { row: number; col: number },
): Position {
  return {
    row: position.row + delta.row,
    col: position.col + delta.col,
  };
}

/**
 * Serializes a position for loop-detection sets.
 */
export function positionKey(position: Position): string {
  return `${position.row},${position.col}`;
}
