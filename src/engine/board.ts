import { DIRECTION_ROTATION_ORDER } from "@/constants/game";
import type { Board, Direction, Position, Tile } from "@/types/game";
import { isPositionInBounds } from "@/engine/position";

/**
 * Creates an empty square board filled with arrow placeholders.
 */
export function createEmptyBoard(size: number, fill: Tile): Board {
  return Array.from({ length: size }, () =>
    Array.from({ length: size }, () => ({ ...fill })),
  );
}

/**
 * Safely reads a tile when the position is in bounds.
 */
export function getTile(
  board: Board,
  position: Position,
): Tile | undefined {
  if (!isPositionInBounds(position, board.length)) {
    return undefined;
  }

  return board[position.row][position.col];
}

/**
 * Returns a new board with an updated tile at `position`.
 */
export function setTile(
  board: Board,
  position: Position,
  tile: Tile,
): Board {
  return board.map((row, rowIndex) =>
    row.map((cell, colIndex) =>
      rowIndex === position.row && colIndex === position.col ? tile : cell,
    ),
  );
}

/**
 * Lists every board position except those in `exclude`.
 */
export function getAvailablePositions(
  size: number,
  exclude: readonly Position[] = [],
): Position[] {
  const excluded = new Set(exclude.map((position) => `${position.row},${position.col}`));
  const positions: Position[] = [];

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const key = `${row},${col}`;

      if (!excluded.has(key)) {
        positions.push({ row, col });
      }
    }
  }

  return positions;
}

/**
 * Creates a random arrow tile using the supplied RNG callback.
 */
export function createRandomArrow(
  pickDirection: () => Direction,
): Tile {
  return {
    kind: "arrow",
    direction: pickDirection(),
  };
}

export const ALL_DIRECTIONS: readonly Direction[] = DIRECTION_ROTATION_ORDER;
