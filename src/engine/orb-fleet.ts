import { getTile } from "@/engine/board";
import { rotateDirectionClockwise } from "@/engine/direction";
import {
  simulateOrbMovement,
  type FleetSimulationResult,
  type OrbMovementOptions,
  type OrbSimulationResult,
} from "@/engine/orb-movement";
import { positionKey } from "@/engine/position";
import type { Board, Direction, OrbState, PlayerId, Position } from "@/types/game";

interface PendingOrbSegment {
  id: string;
  position: Position;
  path: Position[];
  initialDirection?: Direction;
}

function appendSegmentPath(prefix: Position[], segment: Position[]): Position[] {
  if (segment.length === 0) {
    return [...prefix];
  }

  if (prefix.length === 0) {
    return [...segment];
  }

  const lastPrefix = prefix[prefix.length - 1];

  if (positionKey(lastPrefix) === positionKey(segment[0])) {
    return [...prefix, ...segment.slice(1)];
  }

  return [...prefix, ...segment];
}

function areAllOrbsOnGoals(orbs: OrbState[], board: Board): boolean {
  if (orbs.length === 0) {
    return false;
  }

  return orbs.every((orb) => getTile(board, orb.position)?.kind === "goal");
}

function mergePaths(paths: Position[][]): Position[] {
  const merged: Position[] = [];

  for (const path of paths) {
    for (const position of path) {
      const last = merged[merged.length - 1];

      if (!last || positionKey(last) !== positionKey(position)) {
        merged.push(position);
      }
    }
  }

  return merged;
}

function resolveGoalOwner(
  orbs: OrbState[],
  board: Board,
  fallback?: PlayerId,
): PlayerId | undefined {
  for (const orb of orbs) {
    const tile = getTile(board, orb.position);

    if (tile?.kind === "goal") {
      return tile.owner;
    }
  }

  return fallback;
}

function buildFleetResult(
  board: Board,
  orbs: OrbState[],
  orbPaths: Record<string, Position[]>,
  lastSegment: OrbSimulationResult,
): FleetSimulationResult {
  const allGoalsReached = areAllOrbsOnGoals(orbs, board);
  const mergedPath = mergePaths(Object.values(orbPaths));
  const goalOwner = allGoalsReached
    ? resolveGoalOwner(orbs, board, lastSegment.goalOwner)
    : lastSegment.goalOwner;

  return {
    path: mergedPath,
    stoppedReason: allGoalsReached ? "goal" : lastSegment.stoppedReason,
    goalOwner,
    loopSegment: lastSegment.loopSegment,
    board,
    orbs,
    orbPaths,
    allGoalsReached,
  };
}

/**
 * Simulates orb movement, including splitter forks into independent paths.
 */
export function simulateOrbFleet(
  board: Board,
  spawn: Position,
  options: OrbMovementOptions = {},
): FleetSimulationResult {
  let workingBoard = board;
  const pending: PendingOrbSegment[] = [
    { id: "0", position: spawn, path: [{ ...spawn }] },
  ];
  const finishedOrbs: OrbState[] = [];
  const orbPaths: Record<string, Position[]> = {};
  let nextOrbId = 1;
  let lastSegment: OrbSimulationResult | null = null;

  while (pending.length > 0) {
    const current = pending.shift()!;

    const segment = simulateOrbMovement(workingBoard, current.position, {
      ...options,
      initialDirection: current.initialDirection,
    });

    workingBoard = segment.board;
    lastSegment = segment;

    const segmentPath = appendSegmentPath(current.path, segment.path);

    if (segment.stoppedReason === "split" && segment.splitDirection) {
      const splitPosition = segment.path[segment.path.length - 1];
      const forwardDirection = segment.splitDirection;
      const branchDirection = rotateDirectionClockwise(forwardDirection);

      orbPaths[current.id] = segmentPath;

      pending.push({
        id: current.id,
        position: splitPosition,
        path: [...segmentPath],
        initialDirection: forwardDirection,
      });
      pending.push({
        id: String(nextOrbId),
        position: splitPosition,
        path: [{ ...splitPosition }],
        initialDirection: branchDirection,
      });
      nextOrbId += 1;
      continue;
    }

    const finalPosition = segment.path[segment.path.length - 1] ?? current.position;
    orbPaths[current.id] = segmentPath;
    finishedOrbs.push({ id: current.id, position: finalPosition });

    if (segment.stoppedReason === "loop") {
      return buildFleetResult(workingBoard, finishedOrbs, orbPaths, segment);
    }
  }

  return buildFleetResult(
    workingBoard,
    finishedOrbs,
    orbPaths,
    lastSegment ?? {
      path: [{ ...spawn }],
      stoppedReason: "no-direction",
      board: workingBoard,
    },
  );
}
