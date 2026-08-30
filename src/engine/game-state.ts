import { DEFAULT_WINNING_MATCH_POINTS } from "@/constants/scoring";
import { cloneBoard } from "@/engine/board-utils";
import { evaluateTurnOutcome } from "@/engine/outcome";
import {
  applyScoringTurn,
  calculateTurnScore,
  checkMatchOutcome,
  createInitialPlayerScores,
  getOpponent,
} from "@/engine/scoring";
import type { GeneratedBoard, OrbState, PlayerId, Position } from "@/types/game";
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
  moveLimit?: number;
  puzzleId?: string;
}

export interface GameState {
  board: GeneratedBoard["board"];
  initialBoard: GeneratedBoard["board"];
  spawn: Position;
  goals: GeneratedBoard["goals"];
  seed: number;
  orbPosition: Position;
  orbs: OrbState[];
  players: Record<PlayerId, PlayerScoreState>;
  currentPlayer: PlayerId;
  turnNumber: number;
  movesPlayed: number;
  playerCount: 1 | 2;
  winningScore: number;
  emptyTilesEnabled: boolean;
  targetMoves?: number;
  shortestPathLength?: number;
  moveLimit?: number;
  puzzleId?: string;
  status: MatchStatus;
  winner?: PlayerId;
  lastOutcome?: TurnOutcome;
  lastScore?: TurnScoreBreakdown;
  lastOrbPath?: Position[];
  lastOrbPaths?: Record<string, Position[]>;
}

/**
 * Ensures legacy saves without `orbs` still render a single orb.
 */
export function normalizeGameState(state: GameState): GameState {
  if (state.orbs?.length) {
    return state;
  }

  return {
    ...state,
    orbs: [{ id: "0", position: { ...state.orbPosition } }],
  };
}

/**
 * Creates a new in-progress game from a generated board.
 */
export function createGameState(
  generated: GeneratedBoard,
  options: CreateGameStateOptions = {},
): GameState {
  return {
    board: cloneBoard(generated.board),
    initialBoard: cloneBoard(generated.board),
    spawn: generated.spawn,
    goals: generated.goals,
    seed: generated.seed,
    orbPosition: { ...generated.spawn },
    orbs: [{ id: "0", position: { ...generated.spawn } }],
    players: createInitialPlayerScores(),
    currentPlayer: "player1",
    turnNumber: 1,
    movesPlayed: 0,
    playerCount: options.playerCount ?? 1,
    winningScore: options.winningScore ?? DEFAULT_WINNING_MATCH_POINTS,
    emptyTilesEnabled: options.emptyTilesEnabled ?? false,
    targetMoves: options.targetMoves,
    shortestPathLength: options.shortestPathLength,
    moveLimit: options.moveLimit,
    puzzleId: options.puzzleId,
    status: "in-progress",
  };
}

/**
 * Restores the board and orb to their initial round state.
 * Match scores and turn order are preserved.
 */
export function resetBoard(state: GameState): GameState {
  return {
    ...state,
    board: cloneBoard(state.initialBoard),
    orbPosition: { ...state.spawn },
    orbs: [{ id: "0", position: { ...state.spawn } }],
    lastOutcome: undefined,
    lastScore: undefined,
    lastOrbPath: undefined,
    lastOrbPaths: undefined,
  };
}

/**
 * Applies a completed player turn, updating scores and win/loss state.
 * Starts a new round on the initial board when a goal is scored but the match continues.
 */
export function resolvePlayerTurn(
  state: GameState,
  turnResult: {
    board: GameState["board"];
    orbPath: Position[];
    orbPosition: Position;
    orbs: OrbState[];
    orbPaths: Record<string, Position[]>;
    movement: Parameters<typeof evaluateTurnOutcome>[0];
  },
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

    if (lastScore && outcome.scoringPlayer) {
      players = applyScoringTurn(players, outcome.scoringPlayer, lastScore);
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

  let nextState: GameState = {
    ...state,
    board: turnResult.board,
    orbPosition: turnResult.orbs[0]?.position ?? turnResult.orbPosition,
    orbs: turnResult.orbs.map((orb) => ({
      id: orb.id,
      position: { ...orb.position },
    })),
    players,
    movesPlayed,
    turnNumber: state.turnNumber + 1,
    currentPlayer: nextPlayer,
    status: matchOutcome.status,
    winner: matchOutcome.winner,
    lastOutcome: outcome,
    lastScore,
    lastOrbPath: turnResult.orbPath,
    lastOrbPaths: Object.fromEntries(
      Object.entries(turnResult.orbPaths).map(([orbId, path]) => [
        orbId,
        path.map((position) => ({ ...position })),
      ]),
    ),
  };

  if (outcome.scored && matchOutcome.status === "in-progress") {
    nextState = resetBoard(nextState);
  }

  return nextState;
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
