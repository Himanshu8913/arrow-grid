import { createEmptyBoard } from "@/engine/board";
import { cloneBoard } from "@/engine/board-utils";
import { createGameState } from "@/engine/game-state";
import { validateTeleporterTargets } from "@/engine/teleporter";
import type { GameState } from "@/engine/game-state";
import type { GeneratedBoard } from "@/types/game";
import type { PuzzleDefinition, PuzzleStarRating } from "@/types/puzzle";

/**
 * Builds a wall-filled board and applies handcrafted puzzle tile placements.
 */
export function buildPuzzleBoard(puzzle: PuzzleDefinition) {
  if (!puzzle.size || !puzzle.placements) {
    throw new Error(`Puzzle ${puzzle.id} has no handcrafted board layout.`);
  }

  const board = createEmptyBoard(puzzle.size, { kind: "wall" });

  for (const placement of puzzle.placements) {
    board[placement.row][placement.col] = placement.tile;
  }

  validateTeleporterTargets(board);

  return board;
}

/**
 * Creates a single-player game state from a puzzle definition.
 */
export function createGameFromPuzzle(puzzle: PuzzleDefinition): GameState {
  if (
    puzzle.procedural ||
    !puzzle.size ||
    !puzzle.spawn ||
    !puzzle.goal ||
    !puzzle.placements
  ) {
    throw new Error(`Puzzle ${puzzle.id} must be generated procedurally.`);
  }

  const board = buildPuzzleBoard(puzzle);
  const generated: GeneratedBoard = {
    board,
    size: puzzle.size,
    spawn: puzzle.spawn,
    goals: { player1: puzzle.goal },
    seed: hashPuzzleId(puzzle.id),
  };

  return createGameState(generated, {
    playerCount: 1,
    targetMoves: puzzle.targetMoves,
    shortestPathLength: puzzle.shortestPathLength,
    moveLimit: puzzle.moveLimit,
    puzzleId: puzzle.id,
  });
}

/**
 * Marks a puzzle as failed when the move limit is reached without a goal.
 */
export function applyPuzzleMoveLimit(state: GameState): GameState {
  if (!state.puzzleId || !state.moveLimit || state.status !== "in-progress") {
    return state;
  }

  if (state.movesPlayed >= state.moveLimit) {
    return {
      ...state,
      status: "lost",
    };
  }

  return state;
}

/**
 * Rates a completed puzzle using move count and hint usage.
 */
export function calculatePuzzleStars(
  movesUsed: number,
  targetMoves: number,
  hintsUsed: number,
): PuzzleStarRating {
  if (hintsUsed > 0) {
    return movesUsed <= targetMoves + 2 ? 2 : 1;
  }

  if (movesUsed <= targetMoves) {
    return 3;
  }

  if (movesUsed <= targetMoves + 2) {
    return 2;
  }

  return 1;
}

/**
 * Deep-clones game state for undo stacks.
 */
export function cloneGameState(state: GameState): GameState {
  return {
    ...state,
    board: cloneBoard(state.board),
    initialBoard: cloneBoard(state.initialBoard),
    spawn: { ...state.spawn },
    orbPosition: { ...state.orbPosition },
    goals: { ...state.goals },
    players: {
      player1: { ...state.players.player1 },
      player2: { ...state.players.player2 },
    },
    lastOrbPath: state.lastOrbPath?.map((position) => ({ ...position })),
  };
}

function hashPuzzleId(puzzleId: string): number {
  let hash = 0;

  for (let index = 0; index < puzzleId.length; index += 1) {
    hash = (hash * 31 + puzzleId.charCodeAt(index)) >>> 0;
  }

  return hash || 1;
}
