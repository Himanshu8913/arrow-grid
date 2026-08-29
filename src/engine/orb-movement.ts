import { MAX_ORB_PATH_STEPS } from "@/constants/game";
import { getDirectionDelta } from "@/engine/direction";
import { getTile } from "@/engine/board";
import {
  isPositionInBounds,
  positionKey,
  translatePosition,
} from "@/engine/position";
import type { Board, Direction, PlayerId, Position } from "@/types/game";

export type MovementStopReason =
  | "goal"
  | "wall"
  | "empty"
  | "out-of-bounds"
  | "loop"
  | "no-direction"
  | "max-steps";

export interface OrbSimulationResult {
  path: Position[];
  stoppedReason: MovementStopReason;
  goalOwner?: PlayerId;
  /** Tiles that form the detected loop cycle, when `stoppedReason` is `loop`. */
  loopSegment?: Position[];
}

/**
 * Resolves the outgoing direction for the tile under the orb.
 * Spawn cells are rendered separately but always contain an arrow underneath.
 */
function getOutgoingDirection(
  board: Board,
  position: Position,
  emptyTilesEnabled: boolean,
): Direction | null {
  const tile = getTile(board, position);

  if (!tile) {
    return null;
  }

  if (tile.kind === "arrow") {
    return tile.direction;
  }

  if (tile.kind === "empty" && emptyTilesEnabled) {
    return null;
  }

  if (tile.kind === "wall" || tile.kind === "goal" || tile.kind === "spawn") {
    return null;
  }

  return null;
}

/**
 * Simulates automatic orb movement from `start` until a stop condition is met.
 */
export function simulateOrbMovement(
  board: Board,
  start: Position,
  options: { emptyTilesEnabled?: boolean } = {},
): OrbSimulationResult {
  const emptyTilesEnabled = options.emptyTilesEnabled ?? false;
  const path: Position[] = [start];
  const visited = new Set<string>([positionKey(start)]);
  let position = start;

  for (let step = 0; step < MAX_ORB_PATH_STEPS; step += 1) {
    const currentTile = getTile(board, position);

    if (!currentTile) {
      return { path, stoppedReason: "out-of-bounds" };
    }

    if (currentTile.kind === "goal") {
      return {
        path,
        stoppedReason: "goal",
        goalOwner: currentTile.owner,
      };
    }

    if (currentTile.kind === "wall") {
      return { path, stoppedReason: "wall" };
    }

    const direction = getOutgoingDirection(
      board,
      position,
      emptyTilesEnabled,
    );

    if (!direction) {
      return { path, stoppedReason: "no-direction" };
    }

    const nextPosition = translatePosition(position, getDirectionDelta(direction));

    if (!isPositionInBounds(nextPosition, board.length)) {
      return { path, stoppedReason: "out-of-bounds" };
    }

    const nextKey = positionKey(nextPosition);

    if (visited.has(nextKey)) {
      const loopStartIndex = path.findIndex(
        (visitedPosition) => positionKey(visitedPosition) === nextKey,
      );
      const loopSegment =
        loopStartIndex >= 0
          ? [...path.slice(loopStartIndex), nextPosition]
          : path;

      return { path, stoppedReason: "loop", loopSegment };
    }

    path.push(nextPosition);
    visited.add(nextKey);
    position = nextPosition;

    const landedTile = getTile(board, position);

    if (landedTile?.kind === "goal") {
      return {
        path,
        stoppedReason: "goal",
        goalOwner: landedTile.owner,
      };
    }

    if (landedTile?.kind === "wall") {
      return { path, stoppedReason: "wall" };
    }

    if (landedTile?.kind === "empty" && emptyTilesEnabled) {
      return { path, stoppedReason: "empty" };
    }
  }

  return { path, stoppedReason: "max-steps" };
}

/**
 * Returns true when the orb reaches any goal on the initial board (instant win).
 */
export function isInstantWinBoard(
  board: Board,
  spawn: Position,
  options: { emptyTilesEnabled?: boolean } = {},
): boolean {
  const result = simulateOrbMovement(board, spawn, options);
  return result.stoppedReason === "goal";
}
