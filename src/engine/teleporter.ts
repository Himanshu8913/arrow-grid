import { getTile } from "@/engine/board";
import { isPositionInBounds, positionKey } from "@/engine/position";
import type { Board, Position } from "@/types/game";

/**
 * Maps each teleporter cell to its configured exit position.
 */
export function buildTeleporterTargetMap(board: Board): Map<string, Position> {
  const targets = new Map<string, Position>();

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board.length; col += 1) {
      const tile = board[row][col];

      if (tile.kind !== "teleporter") {
        continue;
      }

      targets.set(positionKey({ row, col }), { ...tile.target });
    }
  }

  return targets;
}

/**
 * Ensures teleporter exits are in bounds and do not point at walls.
 */
export function validateTeleporterTargets(board: Board): void {
  const size = board.length;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const tile = getTile(board, { row, col });

      if (tile?.kind !== "teleporter") {
        continue;
      }

      if (!isPositionInBounds(tile.target, size)) {
        throw new Error(
          `Teleporter at (${row}, ${col}) targets an out-of-bounds position.`,
        );
      }

      const targetTile = getTile(board, tile.target);

      if (targetTile?.kind === "wall") {
        throw new Error(
          `Teleporter at (${row}, ${col}) targets a wall tile.`,
        );
      }
    }
  }
}
