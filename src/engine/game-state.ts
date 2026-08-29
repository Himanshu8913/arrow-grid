import { DEFAULT_WINNING_MATCH_POINTS } from "@/constants/scoring";
import { evaluateTurnOutcome } from "@/engine/outcome";
import {
  applyScoringTurn,
  calculateTurnScore,
  checkMatchOutcome,
  createInitialPlayerScores,
  getOpponent,
} from "@/engine/scoring";
import type { ExecuteTurnResult } from "@/engine/turn";
import type {
  Board,
  GeneratedBoard,
  PlayerId,
  Position,
} from "@/types/game";
import type {
  MatchStatus,
  PlayerScoreState,
  TurnOutcome,
  TurnScoreBreakdown,
} from "@/types/scoring";

export interface CreateGameStateOptions {
  playerCount?: 1 | 2;
  winningScore?: number;
  emptyTilesEnabled?: boolean;
  targetMoves?: number;
  shortestPathLength?: number;
}

export interface GameState {
  board: Board;
  spawn: Position;
  goals: Partial<Record<PlayerId, Position>>;
  players: Record<PlayerId, PlayerScoreState>;
  currentPlayer: PlayerId;
  turnNumber: number;
  movesPlayed: number;
  playerCount: 1 | 2;
  winningScore: number;
  emptyTilesEnabled: boolean;
  targetMoves?: number;
  shortestPathLength?: number;
  status: MatchStatus;
  winner?: PlayerId;
  lastOutcome?: TurnOutcome;
  lastScore?: TurnScoreBreakdown;
}

/**
 * Creates a new in-progress game from a generated board.
 */
export function createGameState(
  generated: GeneratedBoard,
  options: CreateGameStateOptions = {},
): GameState {
  return {
    board: generated.board,
    spawn: generated.spawn,
    goals: generated.goals,
    players: createInitialPlayerScores(),
    currentPlayer: "player1",
    turnNumber: 1,
    movesPlayed: 0,
    playerCount: options.playerCount ?? 1,
    winningScore: options.winningScore ?? DEFAULT_WINNING_MATCH_POINTS,
    emptyTilesEnabled: options.emptyTilesEnabled ?? false,
    targetMoves: options.targetMoves,
    shortestPathLength: options.shortestPathLength,
    status: "in-progress",
  };
}

/**
 * Applies a completed player turn, updating scores and win/loss state.
 */
export function resolvePlayerTurn(
  state: GameState,
  turnResult: ExecuteTurnResult,
): GameState {
  const outcome = evaluateTurnOutcome(turnResult.movement, state.currentPlayer);
  const movesPlayed = state.movesPlayed + 1;

  let players = state.players;
  let lastScore: TurnScoreBreakdown | undefined;

  if (outcome.scored) {
    lastScore =
      calculateTurnScore({
        outcome,
        actingPlayer: state.currentPlayer,
        movesPlayed,
        targetMoves: state.targetMoves,
        shortestPathLength: state.shortestPathLength,
        orbPathLength: turnResult.orbPath.length,
      }) ?? undefined;

    if (lastScore) {
      players = applyScoringTurn(players, state.currentPlayer, lastScore);
    }
  }

  const matchOutcome = checkMatchOutcome(players, {
    winningScore: state.winningScore,
    playerCount: state.playerCount,
  });

  const nextPlayer =
    matchOutcome.status === "in-progress" && state.playerCount === 2
      ? getOpponent(state.currentPlayer)
      : state.currentPlayer;

  return {
    ...state,
    board: turnResult.board,
    players,
    movesPlayed,
    turnNumber: state.turnNumber + 1,
    currentPlayer: nextPlayer,
    status: matchOutcome.status,
    winner: matchOutcome.winner,
    lastOutcome: outcome,
    lastScore,
  };
}

/**
 * Returns true when the match has ended with a winner.
 */
export function isMatchOver(state: GameState): boolean {
  return state.status === "won";
}

/**
 * Returns true when a turn ended in a loop (no points awarded).
 */
export function isLoopLoss(outcome: TurnOutcome): boolean {
  return outcome.isLoop;
}
