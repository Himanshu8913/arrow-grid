import {
  ALL_DIRECTIONS,
  createEmptyBoard,
  createRandomArrow,
  getAvailablePositions,
  getTile,
  setTile,
} from "@/engine/board";
import { createGameState } from "@/engine/game-state";
import type { GameState } from "@/engine/game-state";
import { simulateOrbMovement } from "@/engine/orb-movement";
import { rotateDirectionClockwise, getDirectionDelta } from "@/engine/direction";
import { positionsEqual, translatePosition } from "@/engine/position";
import { createRandomSeed, SeededRandom } from "@/engine/random";
import type { Board, Direction, Position, Tile } from "@/types/game";

export const PORTAL_HOP_PUZZLE_ID = "portal-hop";
export const ICE_SLIDE_PUZZLE_ID = "ice-slide";
export const SPIN_CYCLE_PUZZLE_ID = "spin-cycle";
export const BLAST_ZONE_PUZZLE_ID = "blast-zone";
export const LOCK_AND_KEY_PUZZLE_ID = "lock-and-key";
export const GUST_ALLEY_PUZZLE_ID = "gust-alley";
export const MAGNET_PULL_PUZZLE_ID = "magnet-pull";

export const PROCEDURAL_MECHANIC_PUZZLE_IDS = [
  PORTAL_HOP_PUZZLE_ID,
  ICE_SLIDE_PUZZLE_ID,
  SPIN_CYCLE_PUZZLE_ID,
  BLAST_ZONE_PUZZLE_ID,
  LOCK_AND_KEY_PUZZLE_ID,
  GUST_ALLEY_PUZZLE_ID,
  MAGNET_PULL_PUZZLE_ID,
] as const;

type MechanicKind =
  | "portal"
  | "ice"
  | "rotating"
  | "bomb"
  | "lock-key"
  | "wind"
  | "magnet";

const MIN_SPAWN_GOAL_DISTANCE = 4;
const MAX_GENERATION_ATTEMPTS = 80;

function manhattanDistance(a: Position, b: Position): number {
  return Math.abs(a.row - b.row) + Math.abs(a.col - b.col);
}

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

function positionKey(position: Position): string {
  return `${position.row},${position.col}`;
}

function getRandomPuzzleLimits(size: number, shortestPathLength: number) {
  const targetMoves = Math.max(1, Math.ceil(shortestPathLength / 4));
  const moveLimit = targetMoves + Math.max(4, Math.floor(shortestPathLength / 2));

  return {
    targetMoves,
    moveLimit: size >= 6 ? moveLimit + 1 : moveLimit,
    shortestPathLength,
  };
}

function createPreCorrectDirection(correctDirection: Direction): Direction {
  let direction = correctDirection;

  for (let step = 0; step < 3; step += 1) {
    direction = rotateDirectionClockwise(direction);
  }

  return direction;
}

function canWinWithSingleClockwiseRotation(
  board: Board,
  spawn: Position,
  criticalPosition: Position,
): boolean {
  if (simulateOrbMovement(board, spawn).stoppedReason === "goal") {
    return false;
  }

  const tile = getTile(board, criticalPosition);

  if (!tile || tile.kind !== "arrow") {
    return false;
  }

  const testBoard = setTile(board, criticalPosition, {
    kind: "arrow",
    direction: rotateDirectionClockwise(tile.direction),
  });

  return simulateOrbMovement(testBoard, spawn).stoppedReason === "goal";
}

function fillNoiseTiles(
  rng: SeededRandom,
  board: Board,
  reserved: Set<string>,
): Board {
  const size = board.length;
  let nextBoard = board;

  for (let row = 0; row < size; row += 1) {
    for (let col = 0; col < size; col += 1) {
      const key = `${row},${col}`;

      if (!reserved.has(key)) {
        nextBoard = setTile(
          nextBoard,
          { row, col },
          createRandomArrow(() => rng.pick(ALL_DIRECTIONS)),
        );
      }
    }
  }

  return nextBoard;
}

function canWinInOneRotation(
  board: Board,
  spawn: Position,
  criticalPosition: Position,
): boolean {
  return canWinWithSingleClockwiseRotation(board, spawn, criticalPosition);
}

function buildSolvedPathBoard(
  size: number,
  path: Position[],
  goal: Position,
  overrides: Map<string, Tile>,
): Board {
  let board = createEmptyBoard(size, { kind: "wall" });

  for (let index = 0; index < path.length - 1; index += 1) {
    const from = path[index];
    const to = path[index + 1];
    const key = positionKey(from);
    const override = overrides.get(key);

    board = setTile(
      board,
      from,
      override ?? {
        kind: "arrow",
        direction: getStepDirection(from, to),
      },
    );
  }

  board = setTile(board, goal, { kind: "goal", owner: "player1" });

  return board;
}

function finalizeMechanicPuzzle(
  basePuzzleId: string,
  attemptSeed: number,
  size: number,
  spawn: Position,
  goal: Position,
  board: Board,
  criticalPosition: Position,
): GameState | null {
  if (!canWinInOneRotation(board, spawn, criticalPosition)) {
    return null;
  }

  const criticalTile = getTile(board, criticalPosition);

  if (!criticalTile || criticalTile.kind !== "arrow") {
    return null;
  }

  const winningDirection = rotateDirectionClockwise(criticalTile.direction);

  const solved = setTile(board, criticalPosition, {
    kind: "arrow",
    direction: winningDirection,
  });
  const shortestPathLength = simulateOrbMovement(solved, spawn).path.length;
  const limits = getRandomPuzzleLimits(size, shortestPathLength);

  return createGameState(
    {
      board,
      size,
      spawn,
      goals: { player1: goal },
      seed: attemptSeed,
    },
    {
      playerCount: 1,
      ...limits,
      puzzleId: `${basePuzzleId}-${attemptSeed}`,
    },
  );
}

function generatePortalHopBoard(
  rng: SeededRandom,
  size: number,
  goal: Position,
  path: Position[],
): { board: Board; criticalPosition: Position } | null {
  if (path.length < 7) {
    return null;
  }

  const entranceIndex = rng.nextInt(2, Math.max(2, Math.floor(path.length / 2)));
  const exitIndex = rng.nextInt(
    entranceIndex + 2,
    Math.min(path.length - 2, entranceIndex + 4),
  );
  const entrance = path[entranceIndex];
  const exit = path[exitIndex];
  const criticalPosition = path[entranceIndex - 1];

  const overrides = new Map<string, Tile>([
    [
      positionKey(entrance),
      {
        kind: "teleporter",
        portalId: "alpha",
        target: { ...exit },
      },
    ],
  ]);

  let board = buildSolvedPathBoard(size, path, goal, overrides);
  const reserved = new Set(
    [...path, goal].map((position) => positionKey(position)),
  );
  board = fillNoiseTiles(rng, board, reserved);

  const correctDirection = getStepDirection(criticalPosition, entrance);
  board = setTile(board, criticalPosition, {
    kind: "arrow",
    direction: createPreCorrectDirection(correctDirection),
  });

  return { board, criticalPosition };
}

function generateIceSlideBoard(
  rng: SeededRandom,
  size: number,
  goal: Position,
  path: Position[],
): { board: Board; criticalPosition: Position } | null {
  if (path.length < 8) {
    return null;
  }

  const iceLength = rng.nextInt(2, 3);
  const iceStart = rng.nextInt(1, path.length - iceLength - 3);
  const criticalPosition = path[iceStart + iceLength];

  if (criticalPosition.row === goal.row && criticalPosition.col === goal.col) {
    return null;
  }

  const overrides = new Map<string, Tile>();

  for (let offset = 0; offset < iceLength; offset += 1) {
    const cell = path[iceStart + offset];
    const decoyDirection =
      offset === 1 ? rng.pick(ALL_DIRECTIONS) : undefined;

    overrides.set(
      positionKey(cell),
      decoyDirection
        ? { kind: "ice", direction: decoyDirection }
        : { kind: "ice" },
    );
  }

  let board = buildSolvedPathBoard(size, path, goal, overrides);
  const reserved = new Set(
    [...path, goal].map((position) => positionKey(position)),
  );
  board = fillNoiseTiles(rng, board, reserved);

  const nextOnPath = path[iceStart + iceLength + 1] ?? goal;
  const correctDirection = getStepDirection(criticalPosition, nextOnPath);
  board = setTile(board, criticalPosition, {
    kind: "arrow",
    direction: createPreCorrectDirection(correctDirection),
  });

  return { board, criticalPosition };
}

function findStraightSegmentPlacement(
  path: Position[],
): { segmentIndex: number; criticalIndex: number } | null {
  for (let index = 2; index < path.length - 2; index += 1) {
    const incoming = getStepDirection(path[index - 1], path[index]);
    const outgoing = getStepDirection(path[index], path[index + 1]);
    const pushed = translatePosition(path[index], getDirectionDelta(incoming));

    if (incoming === outgoing && positionsEqual(pushed, path[index + 1])) {
      return { segmentIndex: index, criticalIndex: index - 1 };
    }
  }

  return null;
}

function generateSpinCycleBoard(
  rng: SeededRandom,
  size: number,
  goal: Position,
  path: Position[],
): { board: Board; criticalPosition: Position } | null {
  if (path.length < 7) {
    return null;
  }

  const rotateIndex = rng.nextInt(3, Math.min(4, path.length - 3));
  const criticalPosition = path[rotateIndex - 1];
  const from = path[rotateIndex];
  const to = path[rotateIndex + 1] ?? goal;

  const overrides = new Map<string, Tile>([
    [
      positionKey(from),
      {
        kind: "rotating-arrow",
        direction: getStepDirection(from, to),
      },
    ],
  ]);

  let board = buildSolvedPathBoard(size, path, goal, overrides);
  const reserved = new Set(
    [...path, goal].map((position) => positionKey(position)),
  );
  board = fillNoiseTiles(rng, board, reserved);

  const correctDirection = getStepDirection(criticalPosition, from);
  board = setTile(board, criticalPosition, {
    kind: "arrow",
    direction: createPreCorrectDirection(correctDirection),
  });

  return { board, criticalPosition };
}

function generateBlastZoneBoard(
  rng: SeededRandom,
  size: number,
  goal: Position,
  path: Position[],
): { board: Board; criticalPosition: Position } | null {
  if (path.length < 6) {
    return null;
  }

  const criticalIndex = rng.nextInt(2, Math.min(3, path.length - 4));
  const criticalPosition = path[criticalIndex];
  const correctNext = path[criticalIndex + 1];
  const correctDirection = getStepDirection(criticalPosition, correctNext);
  const wrongDirections = ALL_DIRECTIONS.filter(
    (direction) => direction !== correctDirection,
  );
  const wrongDirection = rng.pick(wrongDirections);
  const bombPosition = translatePosition(
    criticalPosition,
    getDirectionDelta(wrongDirection),
  );

  if (
    !bombPosition ||
    bombPosition.row < 0 ||
    bombPosition.col < 0 ||
    bombPosition.row >= size ||
    bombPosition.col >= size
  ) {
    return null;
  }

  const pathKeys = new Set(path.map((position) => positionKey(position)));

  if (pathKeys.has(positionKey(bombPosition))) {
    return null;
  }

  let board = buildSolvedPathBoard(size, path, goal, new Map());
  board = setTile(board, bombPosition, { kind: "bomb" });
  const reserved = new Set(
    [...path, goal, bombPosition].map((position) => positionKey(position)),
  );
  board = fillNoiseTiles(rng, board, reserved);

  board = setTile(board, criticalPosition, {
    kind: "arrow",
    direction: createPreCorrectDirection(correctDirection),
  });

  return { board, criticalPosition };
}

function generateLockAndKeyBoard(
  rng: SeededRandom,
  size: number,
  goal: Position,
  path: Position[],
): { board: Board; criticalPosition: Position } | null {
  if (path.length < 8) {
    return null;
  }

  const keyIndex = rng.nextInt(3, Math.min(4, path.length - 4));
  const lockCount = rng.nextInt(1, 2);
  const criticalIndex = keyIndex - 1;
  const criticalPosition = path[criticalIndex];
  const overrides = new Map<string, Tile>([
    [positionKey(path[keyIndex]), { kind: "key" }],
  ]);

  for (let offset = 0; offset < lockCount; offset += 1) {
    const lockIndex = keyIndex + 1 + offset;
    const from = path[lockIndex];
    const to = path[lockIndex + 1] ?? goal;

    overrides.set(positionKey(from), {
      kind: "locked-arrow",
      direction: getStepDirection(from, to),
    });
  }

  let board = buildSolvedPathBoard(size, path, goal, overrides);
  const reserved = new Set(
    [...path, goal].map((position) => positionKey(position)),
  );
  board = fillNoiseTiles(rng, board, reserved);

  const correctDirection = getStepDirection(
    criticalPosition,
    path[criticalIndex + 1],
  );
  board = setTile(board, criticalPosition, {
    kind: "arrow",
    direction: createPreCorrectDirection(correctDirection),
  });

  return { board, criticalPosition };
}

function generateGustAlleyBoard(
  rng: SeededRandom,
  size: number,
  goal: Position,
  path: Position[],
): { board: Board; criticalPosition: Position } | null {
  const placement = findStraightSegmentPlacement(path);

  if (!placement) {
    return null;
  }

  const { segmentIndex, criticalIndex } = placement;
  const criticalPosition = path[criticalIndex];
  const overrides = new Map<string, Tile>([
    [positionKey(path[segmentIndex]), { kind: "wind" }],
  ]);

  let board = buildSolvedPathBoard(size, path, goal, overrides);
  const reserved = new Set(
    [...path, goal].map((position) => positionKey(position)),
  );
  board = fillNoiseTiles(rng, board, reserved);

  const correctDirection = getStepDirection(
    criticalPosition,
    path[criticalIndex + 1],
  );
  board = setTile(board, criticalPosition, {
    kind: "arrow",
    direction: createPreCorrectDirection(correctDirection),
  });

  return { board, criticalPosition };
}

function generateMagnetPullBoard(
  rng: SeededRandom,
  size: number,
  goal: Position,
  path: Position[],
): { board: Board; criticalPosition: Position } | null {
  const placement = findStraightSegmentPlacement(path);

  if (!placement) {
    return null;
  }

  const { segmentIndex, criticalIndex } = placement;
  const criticalPosition = path[criticalIndex];
  const overrides = new Map<string, Tile>([
    [positionKey(path[segmentIndex]), { kind: "magnet" }],
  ]);

  let board = buildSolvedPathBoard(size, path, goal, overrides);
  const reserved = new Set(
    [...path, goal].map((position) => positionKey(position)),
  );
  board = fillNoiseTiles(rng, board, reserved);

  const correctDirection = getStepDirection(
    criticalPosition,
    path[criticalIndex + 1],
  );
  board = setTile(board, criticalPosition, {
    kind: "arrow",
    direction: createPreCorrectDirection(correctDirection),
  });

  return { board, criticalPosition };
}

function generateMechanicLayout(
  mechanic: MechanicKind,
  rng: SeededRandom,
  size: number,
  goal: Position,
  path: Position[],
): { board: Board; criticalPosition: Position } | null {
  switch (mechanic) {
    case "portal":
      return generatePortalHopBoard(rng, size, goal, path);
    case "ice":
      return generateIceSlideBoard(rng, size, goal, path);
    case "rotating":
      return generateSpinCycleBoard(rng, size, goal, path);
    case "bomb":
      return generateBlastZoneBoard(rng, size, goal, path);
    case "lock-key":
      return generateLockAndKeyBoard(rng, size, goal, path);
    case "wind":
      return generateGustAlleyBoard(rng, size, goal, path);
    case "magnet":
      return generateMagnetPullBoard(rng, size, goal, path);
  }
}

function getMechanicKindForPuzzleId(basePuzzleId: string): MechanicKind {
  switch (basePuzzleId) {
    case PORTAL_HOP_PUZZLE_ID:
      return "portal";
    case ICE_SLIDE_PUZZLE_ID:
      return "ice";
    case SPIN_CYCLE_PUZZLE_ID:
      return "rotating";
    case BLAST_ZONE_PUZZLE_ID:
      return "bomb";
    case LOCK_AND_KEY_PUZZLE_ID:
      return "lock-key";
    case GUST_ALLEY_PUZZLE_ID:
      return "wind";
    case MAGNET_PULL_PUZZLE_ID:
      return "magnet";
    default:
      throw new Error(`Unknown mechanic puzzle id: ${basePuzzleId}`);
  }
}

function createMechanicPuzzleGame(
  basePuzzleId: (typeof PROCEDURAL_MECHANIC_PUZZLE_IDS)[number],
  seed = createRandomSeed(),
): GameState {
  const mechanic = getMechanicKindForPuzzleId(basePuzzleId);
  const size = seed % 4 === 0 ? 6 : 5;

  for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
    const attemptSeed = seed + attempt;
    const rng = new SeededRandom(attemptSeed);
    const spawn = {
      row: rng.nextInt(0, size - 1),
      col: rng.nextInt(0, size - 1),
    };
    const goal = pickDistantPosition(
      rng,
      size,
      spawn,
      [spawn],
      MIN_SPAWN_GOAL_DISTANCE,
    );

    if (manhattanDistance(spawn, goal) < MIN_SPAWN_GOAL_DISTANCE) {
      continue;
    }

    const path = buildPath(spawn, goal);
    const layout = generateMechanicLayout(mechanic, rng, size, goal, path);

    if (!layout) {
      continue;
    }

    const puzzle = finalizeMechanicPuzzle(
      basePuzzleId,
      attemptSeed,
      size,
      spawn,
      goal,
      layout.board,
      layout.criticalPosition,
    );

    if (puzzle) {
      return puzzle;
    }
  }

  throw new Error(`Failed to generate a ${basePuzzleId} puzzle.`);
}

export function isPortalHopPuzzleId(puzzleId: string | undefined): boolean {
  return matchesMechanicPuzzleId(puzzleId, PORTAL_HOP_PUZZLE_ID);
}

export function isIceSlidePuzzleId(puzzleId: string | undefined): boolean {
  return matchesMechanicPuzzleId(puzzleId, ICE_SLIDE_PUZZLE_ID);
}

export function isSpinCyclePuzzleId(puzzleId: string | undefined): boolean {
  return matchesMechanicPuzzleId(puzzleId, SPIN_CYCLE_PUZZLE_ID);
}

export function isBlastZonePuzzleId(puzzleId: string | undefined): boolean {
  return matchesMechanicPuzzleId(puzzleId, BLAST_ZONE_PUZZLE_ID);
}

export function isLockAndKeyPuzzleId(puzzleId: string | undefined): boolean {
  return matchesMechanicPuzzleId(puzzleId, LOCK_AND_KEY_PUZZLE_ID);
}

export function isGustAlleyPuzzleId(puzzleId: string | undefined): boolean {
  return matchesMechanicPuzzleId(puzzleId, GUST_ALLEY_PUZZLE_ID);
}

export function isMagnetPullPuzzleId(puzzleId: string | undefined): boolean {
  return matchesMechanicPuzzleId(puzzleId, MAGNET_PULL_PUZZLE_ID);
}

function matchesMechanicPuzzleId(
  puzzleId: string | undefined,
  baseId: string,
): boolean {
  return (
    puzzleId === baseId || puzzleId?.startsWith(`${baseId}-`) === true
  );
}

export function isProceduralMechanicPuzzleId(puzzleId: string | undefined): boolean {
  return PROCEDURAL_MECHANIC_PUZZLE_IDS.some((baseId) =>
    matchesMechanicPuzzleId(puzzleId, baseId),
  );
}

export function getMechanicPuzzleSeed(puzzleId: string | undefined): number | null {
  if (!puzzleId) {
    return null;
  }

  for (const prefix of PROCEDURAL_MECHANIC_PUZZLE_IDS) {
    if (!puzzleId.startsWith(`${prefix}-`)) {
      continue;
    }

    const seed = Number(puzzleId.slice(prefix.length + 1));
    return Number.isFinite(seed) ? seed : null;
  }

  return null;
}

export function getMechanicPuzzleBaseId(puzzleId: string): string {
  for (const baseId of PROCEDURAL_MECHANIC_PUZZLE_IDS) {
    if (matchesMechanicPuzzleId(puzzleId, baseId)) {
      return baseId;
    }
  }

  return puzzleId;
}

export function createPortalHopPuzzleGame(seed = createRandomSeed()): GameState {
  return createMechanicPuzzleGame(PORTAL_HOP_PUZZLE_ID, seed);
}

export function createIceSlidePuzzleGame(seed = createRandomSeed()): GameState {
  return createMechanicPuzzleGame(ICE_SLIDE_PUZZLE_ID, seed);
}

export function createSpinCyclePuzzleGame(seed = createRandomSeed()): GameState {
  return createMechanicPuzzleGame(SPIN_CYCLE_PUZZLE_ID, seed);
}

export function createBlastZonePuzzleGame(seed = createRandomSeed()): GameState {
  return createMechanicPuzzleGame(BLAST_ZONE_PUZZLE_ID, seed);
}

export function createLockAndKeyPuzzleGame(seed = createRandomSeed()): GameState {
  return createMechanicPuzzleGame(LOCK_AND_KEY_PUZZLE_ID, seed);
}

export function createGustAlleyPuzzleGame(seed = createRandomSeed()): GameState {
  return createMechanicPuzzleGame(GUST_ALLEY_PUZZLE_ID, seed);
}

export function createMagnetPullPuzzleGame(seed = createRandomSeed()): GameState {
  return createMechanicPuzzleGame(MAGNET_PULL_PUZZLE_ID, seed);
}
