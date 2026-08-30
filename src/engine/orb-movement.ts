import { MAX_ORB_PATH_STEPS } from "@/constants/game";
import { getDirectionDelta } from "@/engine/direction";
import { getTile } from "@/engine/board";
import {
  isPositionInBounds,
  positionKey,
  positionsEqual,
  translatePosition,
} from "@/engine/position";
import { buildTeleporterTargetMap } from "@/engine/teleporter";
import {
  cloneBoardForSimulation,
  detonateBombAt,
  isDirectionalArrowTile,
  rotateRotatingArrowAt,
  unlockAllLockedArrows,
} from "@/engine/tile-effects";
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
  loopSegment?: Position[];
  board: Board;
}

const ADJACENT_DELTAS = [
  { row: -1, col: 0 },
  { row: 1, col: 0 },
  { row: 0, col: -1 },
  { row: 0, col: 1 },
] as const;

type LandingResult =
  | OrbSimulationResult
  | {
      status: "continue";
      board: Board;
    };

function isIceTileAt(board: Board, position: Position): boolean {
  return getTile(board, position)?.kind === "ice";
}

function getOutgoingDirection(
  board: Board,
  position: Position,
  emptyTilesEnabled: boolean,
): Direction | null {
  const tile = getTile(board, position);

  if (!tile) {
    return null;
  }

  if (isDirectionalArrowTile(tile)) {
    return tile.direction;
  }

  if (tile.kind === "empty" && emptyTilesEnabled) {
    return null;
  }

  return null;
}

function createLoopResult(
  board: Board,
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

  return { path, stoppedReason: "loop", loopSegment, board };
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

function findAdjacentMagnet(
  board: Board,
  position: Position,
  excludePosition: Position | null,
): Position | null {
  for (const delta of ADJACENT_DELTAS) {
    const neighbor = translatePosition(position, delta);
    const tile = getTile(board, neighbor);

    if (tile?.kind === "magnet") {
      if (excludePosition && positionsEqual(neighbor, excludePosition)) {
        continue;
      }

      return neighbor;
    }
  }

  return null;
}

function resolveLanding(
  board: Board,
  path: Position[],
  visited: Set<string>,
  position: Position,
  fromPosition: Position | null,
  teleporterTargets: Map<string, Position>,
  emptyTilesEnabled: boolean,
  arrivedViaTeleport: boolean,
  travelDirection: Direction,
): LandingResult {
  let workingBoard = board;
  const landedTile = getTile(workingBoard, position);

  if (landedTile?.kind === "goal") {
    return {
      path,
      stoppedReason: "goal",
      goalOwner: landedTile.owner,
      board: workingBoard,
    };
  }

  if (landedTile?.kind === "wall") {
    return { path, stoppedReason: "wall", board: workingBoard };
  }

  if (landedTile?.kind === "empty" && emptyTilesEnabled) {
    return { path, stoppedReason: "empty", board: workingBoard };
  }

  if (landedTile?.kind === "key") {
    workingBoard = unlockAllLockedArrows(workingBoard);
  }

  if (landedTile?.kind === "bomb") {
    workingBoard = detonateBombAt(workingBoard, position);
    return { path, stoppedReason: "no-direction", board: workingBoard };
  }

  if (landedTile?.kind === "teleporter" && !arrivedViaTeleport) {
    const partner = teleporterTargets.get(positionKey(position));

    if (!partner) {
      return { path, stoppedReason: "wall", board: workingBoard };
    }

    const partnerKey = positionKey(partner);

    if (visited.has(partnerKey)) {
      return createLoopResult(workingBoard, path, partner);
    }

    path.push(partner);
    visited.add(partnerKey);

    return resolveLanding(
      workingBoard,
      path,
      visited,
      partner,
      position,
      teleporterTargets,
      emptyTilesEnabled,
      true,
      travelDirection,
    );
  }

  if (
    landedTile?.kind === "wind" ||
    landedTile?.kind === "magnet" ||
    landedTile?.kind === "key"
  ) {
    const pushedPosition = translatePosition(position, getDirectionDelta(travelDirection));

    if (!isPositionInBounds(pushedPosition, workingBoard.length)) {
      return { path, stoppedReason: "out-of-bounds", board: workingBoard };
    }

    const pushedKey = positionKey(pushedPosition);

    if (visited.has(pushedKey)) {
      return createLoopResult(workingBoard, path, pushedPosition);
    }

    path.push(pushedPosition);
    visited.add(pushedKey);

    return resolveLanding(
      workingBoard,
      path,
      visited,
      pushedPosition,
      position,
      teleporterTargets,
      emptyTilesEnabled,
      false,
      travelDirection,
    );
  }

  const landedTileForMagnet = getTile(workingBoard, position);
  const magnetPosition =
    landedTileForMagnet && isDirectionalArrowTile(landedTileForMagnet)
      ? null
      : findAdjacentMagnet(workingBoard, position, fromPosition);

  if (magnetPosition) {
    const magnetKey = positionKey(magnetPosition);

    if (visited.has(magnetKey)) {
      return createLoopResult(workingBoard, path, magnetPosition);
    }

    path.push(magnetPosition);
    visited.add(magnetKey);

    return resolveLanding(
      workingBoard,
      path,
      visited,
      magnetPosition,
      position,
      teleporterTargets,
      emptyTilesEnabled,
      false,
      travelDirection,
    );
  }

  return { status: "continue", board: workingBoard };
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
  let workingBoard = cloneBoardForSimulation(board);
  const teleporterTargets = buildTeleporterTargetMap(workingBoard);
  const path: Position[] = [start];
  const visited = new Set<string>([positionKey(start)]);
  let position = start;
  let momentum: Direction | null = null;

  for (let step = 0; step < MAX_ORB_PATH_STEPS; step += 1) {
    const currentTile = getTile(workingBoard, position);

    if (!currentTile) {
      return { path, stoppedReason: "out-of-bounds", board: workingBoard };
    }

    if (currentTile.kind === "goal") {
      return {
        path,
        stoppedReason: "goal",
        goalOwner: currentTile.owner,
        board: workingBoard,
      };
    }

    if (currentTile.kind === "wall") {
      return { path, stoppedReason: "wall", board: workingBoard };
    }

    let direction: Direction | null;

    if (momentum !== null && isIceTileAt(workingBoard, position)) {
      direction = momentum;
    } else {
      momentum = null;
      direction = getOutgoingDirection(workingBoard, position, emptyTilesEnabled);
    }

    if (!direction) {
      return { path, stoppedReason: "no-direction", board: workingBoard };
    }

    const nextPosition = translatePosition(position, getDirectionDelta(direction));

    if (!isPositionInBounds(nextPosition, workingBoard.length)) {
      return { path, stoppedReason: "out-of-bounds", board: workingBoard };
    }

    const nextKey = positionKey(nextPosition);

    if (visited.has(nextKey)) {
      return createLoopResult(workingBoard, path, nextPosition);
    }

    path.push(nextPosition);
    visited.add(nextKey);
    position = nextPosition;

    const landingResult = resolveLanding(
      workingBoard,
      path,
      visited,
      position,
      path.length >= 2 ? path[path.length - 2] : null,
      teleporterTargets,
      emptyTilesEnabled,
      false,
      direction,
    );

    if ("status" in landingResult) {
      workingBoard = landingResult.board;
    } else {
      return landingResult;
    }

    const previousPosition = path.length >= 2 ? path[path.length - 2] : null;

    if (
      previousPosition &&
      getTile(workingBoard, previousPosition)?.kind === "rotating-arrow"
    ) {
      workingBoard = rotateRotatingArrowAt(workingBoard, previousPosition);
    }

    position = path[path.length - 1];
    momentum = applyIceMomentum(workingBoard, position, direction, momentum);
  }

  return { path, stoppedReason: "max-steps", board: workingBoard };
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
