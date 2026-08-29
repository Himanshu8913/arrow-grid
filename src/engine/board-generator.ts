import { DEFAULT_BOARD_SIZE } from "@/constants/game";
import {
  ALL_DIRECTIONS,
  createEmptyBoard,
  createRandomArrow,
  getAvailablePositions,
  setTile,
} from "@/engine/board";
import { rotateDirectionClockwise } from "@/engine/direction";
import { isInstantWinBoard } from "@/engine/orb-movement";
import { createRandomSeed, SeededRandom } from "@/engine/random";
import type {
  Board,
  Direction,
  GenerateBoardOptions,
  GeneratedBoard,
  PlayerId,
  Position,
} from "@/types/game";

const DEFAULT_MAX_ATTEMPTS = 50;
const MIN_SPAWN_GOAL_DISTANCE = 3;

/**
 * Manhattan distance between two board positions.
 */
function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

/**
 * Picks a random board position that satisfies the minimum distance constraint.
 */
function pickDistantPosition(
  rng: SeededRandom,
  size: number,
  origin: Position,
  exclude: readonly Position[],
  minDistance: number,
): Position {
  const candidates = getAvailablePositions(size, exclude).filter(
    (position) => manhattanDistance(origin, position) >= minDistance,
  );

  if (candidates.length === 0) {
    throw new Error("Unable to find a valid board position.");
  }

  return rng.pick(candidates);
}

/**
 * Builds a simple orthogonal path between spawn and goal.
 */
function buildPath(spawn: Position, goal: Position): Position[] {
  const path: Position[] = [{ ...spawn }];
  let current = { ...spawn };

  while (current.row !== goal.row) {
    current = {
      row: current.row + (goal.row > current.row ? 1 : -1),
      col: current.col,
    };
    path.push({ ...current });
  }

  while (current.col !== goal.col) {
    current = {
      row: current.row,
      col: current.col + (goal.col > current.col ? 1 : -1),
    };
    path.push({ ...current });
  }

  return path;
}

/**
 * Returns the direction needed to step from `from` to `to` on adjacent cells.
 */
function getStepDirection(from: Position, to: Position): Direction {
  if (to.row < from.row) {
    return "up";
  }

  if (to.row > from.row) {
    return "down";
  }

  if (to.col < from.col) {
    return "left";
  }

  return "right";
}

/**
 * Rotates a correct path arrow 1–3 steps so it is solvable but not instantly winning.
 */
function createMisalignedArrow(
  rng: SeededRandom,
  correctDirection: Direction,
): Direction {
  const rotationSteps = rng.nextInt(1, 3);
  let direction = correctDirection;

  for (let step = 0; step < rotationSteps; step += 1) {
    direction = rotateDirectionClockwise(direction);
  }

  return direction;
}

/**
 * Applies guaranteed path arrows and random arrows to the rest of the board.
 */
function fillBoardTiles(
  rng: SeededRandom,
  size: number,
  goals: Partial<Record<PlayerId, Position>>,
  path: Position[],
): Board {
  let board = createEmptyBoard(size, createRandomArrow(() => rng.pick(ALL_DIRECTIONS)));

  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index];
    const to = path[index + 1];
    const direction = createMisalignedArrow(rng, getStepDirection(from, to));

    board = setTile(board, from, {
      kind: "arrow",
      direction,
    });
  }

  for (const [owner, goalPosition] of Object.entries(goals) as Array<
    [PlayerId, Position]
  >) {
    if (goalPosition) {
      board = setTile(board, goalPosition, {
        kind: "goal",
        owner,
      });
    }
  }

  const goalPositions = Object.values(goals).filter(
    (position): position is Position => position !== undefined,
  );

  const reserved = new Set(
    [...path, ...goalPositions].map(
      (position) => `${position.row},${position.col}`,
    ),
  );

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const key = `${row},${col}`;

      if (!reserved.has(key)) {
        board = setTile(
          board,
          { row, col },
          createRandomArrow(() => rng.pick(ALL_DIRECTIONS)),
        );
      }
    }
  }

  return board;
}

/**
 * Generates a deterministic, playable board with spawn, goals, and arrow tiles.
 */
export function generateBoard(
  options: GenerateBoardOptions = {},
): GeneratedBoard {
  const size = options.size ?? DEFAULT_BOARD_SIZE;
  const playerCount = options.playerCount ?? 1;
  const seed = options.seed ?? createRandomSeed();
  const maxAttempts = options.maxAttempts ?? DEFAULT_MAX_ATTEMPTS;
  const emptyTilesEnabled = options.emptyTilesEnabled ?? false;

  for (let attempt = 0; attempt < maxAttempts; attempt += 1) {
    const attemptSeed = seed + attempt;
    const rng = new SeededRandom(attemptSeed);
    const spawn = {
      row: rng.nextInt(0, size - 1),
      col: rng.nextInt(0, size - 1),
    };

    const goals: Partial<Record<PlayerId, Position>> = {
      player1: pickDistantPosition(
        rng,
        size,
        spawn,
        [spawn],
        MIN_SPAWN_GOAL_DISTANCE,
      ),
    };

    if (playerCount === 2) {
      goals.player2 = pickDistantPosition(
        rng,
        size,
        spawn,
        [spawn, goals.player1!],
        MIN_SPAWN_GOAL_DISTANCE,
      );
    }

    const primaryGoal = goals.player1!;

    if (manhattanDistance(spawn, primaryGoal) < MIN_SPAWN_GOAL_DISTANCE) {
      continue;
    }

    const path = buildPath(spawn, primaryGoal);
    const board = fillBoardTiles(rng, size, goals, path);

    if (isInstantWinBoard(board, spawn, { emptyTilesEnabled })) {
      continue;
    }

    return {
      board,
      size,
      spawn,
      goals,
      seed: attemptSeed,
    };
  }

  throw new Error("Failed to generate a valid board.");
}
