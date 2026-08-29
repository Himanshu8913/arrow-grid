import { createGameState, resetBoard, resolvePlayerTurn } from "@/engine/game-state";
import { generateBoard } from "@/engine/board-generator";
import { executePlayerTurn } from "@/engine/turn";
import type {
  CreateGameStateOptions,
  GameState,
} from "@/engine/game-state";
import type {
  GenerateBoardOptions,
  InvalidMoveReason,
  RotateMove,
} from "@/types/game";

export interface NewGameOptions
  extends GenerateBoardOptions,
    CreateGameStateOptions {}

/**
 * Generates a board and returns a ready-to-play game state.
 */
export function createNewGame(options: NewGameOptions = {}): GameState {
  const generated = generateBoard(options);
  return createGameState(generated, options);
}

/**
 * Plays one full turn: validate, rotate, move orb, score, and reset the round when needed.
 */
export function playTurn(
  state: GameState,
  move: RotateMove,
): GameState | { error: InvalidMoveReason } {
  if (state.status === "won" || state.status === "lost") {
    return { error: "game-over" };
  }

  const turnResult = executePlayerTurn(state.board, state.spawn, move, {
    emptyTilesEnabled: state.emptyTilesEnabled,
  });

  if ("error" in turnResult) {
    return turnResult;
  }

  return resolvePlayerTurn(state, turnResult);
}

/**
 * Restores the current round to the initial board layout without ending the match.
 */
export function startNewRound(state: GameState): GameState {
  return resetBoard(state);
}

/**
 * Creates a completely new match with a fresh board and scores.
 */
export function restartMatch(options: NewGameOptions = {}): GameState {
  return createNewGame(options);
}
