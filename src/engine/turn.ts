import { simulateOrbFleet } from "@/engine/orb-fleet";
import type { FleetSimulationResult } from "@/engine/orb-movement";
import { tryRotateArrow } from "@/engine/rotation";
import type {
  Board,
  InvalidMoveReason,
  OrbState,
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
  orbs: OrbState[];
  orbPaths: Record<string, Position[]>;
  movement: FleetSimulationResult;
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

  const movement = simulateOrbFleet(rotationResult.board, spawn, options);
  const orbPosition =
    movement.orbs[movement.orbs.length - 1]?.position ??
    movement.path[movement.path.length - 1] ??
    spawn;

  return {
    board: movement.board,
    orbPath: movement.path,
    orbPosition,
    orbs: movement.orbs,
    orbPaths: movement.orbPaths,
    movement,
  };
}
