import { getTile, setTile } from "@/engine/board";
import { cloneBoard } from "@/engine/board-utils";
import { rotateDirectionClockwise } from "@/engine/direction";
import type { Board, Direction, Position, Tile } from "@/types/game";

/**
 * Clones a board for movement simulation that may mutate tiles mid-path.
 */
export function cloneBoardForSimulation(board: Board): Board {
  return cloneBoard(board);
}

/**
 * Converts every locked arrow on the board into a normal arrow.
 */
export function unlockAllLockedArrows(board: Board): Board {
  let nextBoard = board;

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board.length; col += 1) {
      const tile = board[row][col];

      if (tile.kind === "locked-arrow") {
        nextBoard = setTile(nextBoard, { row, col }, {
          kind: "arrow",
          direction: tile.direction,
        });
      }
    }
  }

  return nextBoard;
}

/**
 * Rotates a rotating arrow tile clockwise after the orb passes over it.
 */
export function rotateRotatingArrowAt(board: Board, position: Position): Board {
  const tile = getTile(board, position);

  if (!tile || tile.kind !== "rotating-arrow") {
    return board;
  }

  return setTile(board, position, {
    kind: "rotating-arrow",
    direction: rotateDirectionClockwise(tile.direction),
  });
}

/**
 * Destroys a bomb tile, leaving an empty cell behind.
 */
export function detonateBombAt(board: Board, position: Position): Board {
  return setTile(board, position, { kind: "empty" });
}

/**
 * Consumes a splitter tile after the orb passes through it.
 */
export function consumeSplitterAt(board: Board, position: Position): Board {
  const tile = getTile(board, position);

  if (!tile || tile.kind !== "splitter") {
    return board;
  }

  return setTile(board, position, { kind: "empty" });
}

export function isDirectionalArrowTile(
  tile: Tile | undefined,
): tile is { kind: "arrow" | "rotating-arrow" | "locked-arrow"; direction: Direction } {
  return (
    tile?.kind === "arrow" ||
    tile?.kind === "rotating-arrow" ||
    tile?.kind === "locked-arrow"
  );
}
