import { MAX_ORB_PATH_STEPS } from "@/constants/game";
import { getDirectionDelta } from "@/engine/direction";
import { getTile } from "@/engine/board";
import {
  isPositionInBounds,
  positionKey,
  translatePosition,
} from "@/engine/position";
import { buildTeleporterTargetMap } from "@/engine/teleporter";
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

function isIceTileAt(board: Board, position: Position): boolean {
  return getTile(board, position)?.kind === "ice";
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

  if (
    tile.kind === "wall" ||
    tile.kind === "goal" ||
    tile.kind === "spawn" ||
    tile.kind === "teleporter" ||
    tile.kind === "ice"
  ) {
    return null;
  }

  return null;
}

function createLoopResult(
  path: Position[],
  nextPosition: Position,
): OrbSimulationResult {
  const loopStartIndex = path.findIndex(
    (visitedPosition) => positionKey(visitedPosition) === positionKey(nextPosition),
  );
  const loopSegment =
    loopStartIndex >= 0
      ? [...path.slice(loopStartIndex), nextPosition]
      : path;

  return { path, stoppedReason: "loop", loopSegment };
}

function applyIceMomentum(
  board: Board,
  position: Position,
  travelDirection: Direction,
  momentum: Direction | null,
): Direction | null {
  if (!isIceTileAt(board, position)) {
    return null;
  }

  return momentum ?? travelDirection;
}

/**
 * Handles goal, wall, empty, and teleporter resolution after the orb lands on a cell.
 */
function resolveLanding(
  board: Board,
  path: Position[],
  visited: Set<string>,
  position: Position,
  teleporterTargets: Map<string, Position>,
  emptyTilesEnabled: boolean,
  arrivedViaTeleport: boolean,
  travelDirection: Direction,
): OrbSimulationResult | "continue" {
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

  if (landedTile?.kind === "teleporter" && !arrivedViaTeleport) {
    const partner = teleporterTargets.get(positionKey(position));

    if (!partner) {
      return { path, stoppedReason: "wall" };
    }

    const partnerKey = positionKey(partner);

    if (visited.has(partnerKey)) {
      return createLoopResult(path, partner);
    }

    path.push(partner);
    visited.add(partnerKey);

    return resolveLanding(
      board,
      path,
      visited,
      partner,
      teleporterTargets,
      emptyTilesEnabled,
      true,
      travelDirection,
    );
  }

  return "continue";
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
  const teleporterTargets = buildTeleporterTargetMap(board);
  const path: Position[] = [start];
  const visited = new Set<string>([positionKey(start)]);
  let position = start;
  let momentum: Direction | null = null;

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

    let direction: Direction | null;

    if (momentum !== null && isIceTileAt(board, position)) {
      direction = momentum;
    } else {
      momentum = null;
      direction = getOutgoingDirection(board, position, emptyTilesEnabled);
    }

    if (!direction) {
      return { path, stoppedReason: "no-direction" };
    }

    const nextPosition = translatePosition(position, getDirectionDelta(direction));

    if (!isPositionInBounds(nextPosition, board.length)) {
      return { path, stoppedReason: "out-of-bounds" };
    }

    const nextKey = positionKey(nextPosition);

    if (visited.has(nextKey)) {
      return createLoopResult(path, nextPosition);
    }

    path.push(nextPosition);
    visited.add(nextKey);
    position = nextPosition;

    const landingResult = resolveLanding(
      board,
      path,
      visited,
      position,
      teleporterTargets,
      emptyTilesEnabled,
      false,
      direction,
    );

    if (landingResult !== "continue") {
      return landingResult;
    }

    position = path[path.length - 1];
    momentum = applyIceMomentum(board, position, direction, momentum);
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
