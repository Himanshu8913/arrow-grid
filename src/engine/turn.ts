import {
  simulateOrbMovement,
  type OrbSimulationResult,
} from "@/engine/orb-movement";
import { tryRotateArrow } from "@/engine/rotation";
import type {
  Board,
  InvalidMoveReason,
  Position,
  RotateMove,
} from "@/types/game";

export interface ExecuteTurnOptions {
  emptyTilesEnabled?: boolean;
}

export interface ExecuteTurnResult {
  board: Board;
  orbPath: Position[];
  orbPosition: Position;
  movement: OrbSimulationResult;
}

/**
 * Applies one full player turn: rotate an arrow, then run automatic orb movement.
 * The orb always launches from `spawn` after the rotation.
 */
export function executePlayerTurn(
  board: Board,
  spawn: Position,
  move: RotateMove,
  options: ExecuteTurnOptions = {},
): ExecuteTurnResult | { error: InvalidMoveReason } {
  const rotationResult = tryRotateArrow(board, move, spawn);

  if ("error" in rotationResult) {
    return rotationResult;
  }

  const movement = simulateOrbMovement(rotationResult.board, spawn, options);
  const orbPosition = movement.path[movement.path.length - 1] ?? spawn;

  return {
    board: rotationResult.board,
    orbPath: movement.path,
    orbPosition,
    movement,
  };
}
