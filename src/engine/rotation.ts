import { getTile, setTile } from "@/engine/board";
import { rotateDirectionClockwise } from "@/engine/direction";
import { isPositionInBounds, positionsEqual } from "@/engine/position";
import type {
  Board,
  InvalidMoveReason,
  MoveValidationResult,
  Position,
  RotateMove,
} from "@/types/game";

/**
 * Validates whether an arrow at `position` may be rotated.
 */
export function validateRotateMove(
  board: Board,
  position: Position,
  spawn: Position,
): MoveValidationResult {
  if (!isPositionInBounds(position, board.length)) {
    return { valid: false, reason: "out-of-bounds" };
  }

  if (positionsEqual(position, spawn)) {
    return { valid: false, reason: "spawn" };
  }

  const tile = getTile(board, position);

  if (!tile) {
    return { valid: false, reason: "out-of-bounds" };
  }

  switch (tile.kind) {
    case "arrow":
      return { valid: true };
    case "wall":
      return { valid: false, reason: "wall" };
    case "goal":
      return { valid: false, reason: "goal" };
    case "spawn":
      return { valid: false, reason: "spawn" };
    case "empty":
      return { valid: false, reason: "empty" };
    case "teleporter":
      return { valid: false, reason: "not-arrow" };
    default:
      return { valid: false, reason: "not-arrow" };
  }
}

/**
 * Returns every position where a clockwise rotation is legal.
 */
export function getLegalRotatePositions(
  board: Board,
  spawn: Position,
): Position[] {
  const positions: Position[] = [];

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board.length; col += 1) {
      const position = { row, col };
      const validation = validateRotateMove(board, position, spawn);

      if (validation.valid) {
        positions.push(position);
      }
    }
  }

  return positions;
}

/**
 * Rotates the arrow at `position` one step clockwise.
 * Call {@link validateRotateMove} before using this helper.
 */
export function rotateArrowAt(board: Board, position: Position): Board {
  const tile = getTile(board, position);

  if (!tile || tile.kind !== "arrow") {
    throw new Error("Cannot rotate a non-arrow tile.");
  }

  return setTile(board, position, {
    kind: "arrow",
    direction: rotateDirectionClockwise(tile.direction),
  });
}

/**
 * Validates and applies a rotate move, returning an error when illegal.
 */
export function tryRotateArrow(
  board: Board,
  move: RotateMove,
  spawn: Position,
): { board: Board } | { error: InvalidMoveReason } {
  const validation = validateRotateMove(board, move.position, spawn);

  if (!validation.valid) {
    return { error: validation.reason };
  }

  return {
    board: rotateArrowAt(board, move.position),
  };
}
