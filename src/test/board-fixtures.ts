import type { Board, Position } from "@/types/game";

/**
 * Returns the first arrow tile position on a board.
 */
export function findArrowPosition(board: Board): Position | null {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col]?.kind === "arrow") {
        return { row, col };
      }
    }
  }

  return null;
}

/**
 * Returns every arrow tile position on a board.
 */
export function findArrowPositions(board: Board): Position[] {
  const positions: Position[] = [];

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col]?.kind === "arrow") {
        positions.push({ row, col });
      }
    }
  }

  return positions;
}
