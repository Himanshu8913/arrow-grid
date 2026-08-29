import { evaluateTurnOutcome } from "@/engine/outcome";
import { getLegalRotatePositions } from "@/engine/rotation";
import { SeededRandom } from "@/engine/random";
import { getOpponent } from "@/engine/scoring";
import { executePlayerTurn } from "@/engine/turn";
import { resolvePlayerTurn } from "@/engine/game-state";
import type { GameState } from "@/engine/game-state";
import type { AiDifficulty } from "@/constants/ai";
import type { PlayerId, Position } from "@/types/game";

export interface ChooseAiMoveOptions {
  difficulty: AiDifficulty;
  seed?: number;
}

const GOAL_SCORE = 1000;
const OPPONENT_GOAL_SCORE = -900;
const LOOP_SCORE = -200;

/**
 * Picks a legal rotate move for the current player using the requested difficulty.
 */
export function chooseAiMove(
  state: GameState,
  options: ChooseAiMoveOptions,
): Position | null {
  const legalMoves = getLegalRotatePositions(state.board, state.spawn);

  if (legalMoves.length === 0) {
    return null;
  }

  switch (options.difficulty) {
    case "easy":
      return pickRandomMove(
        legalMoves,
        options.seed ?? state.seed + state.turnNumber,
      );
    case "medium":
      return pickBestImmediateMove(state, legalMoves);
    case "hard":
    case "expert":
      return pickBestLookaheadMove(state, legalMoves, options.difficulty);
    default:
      return pickRandomMove(legalMoves, state.seed);
  }
}

function pickRandomMove(moves: Position[], seed: number): Position {
  const random = new SeededRandom(seed);
  return random.pick(moves);
}

function pickBestImmediateMove(
  state: GameState,
  legalMoves: Position[],
): Position {
  return legalMoves.reduce((bestMove, move) => {
    const bestScore = scoreImmediateMove(state, bestMove);
    const moveScore = scoreImmediateMove(state, move);
    return moveScore > bestScore ? move : bestMove;
  });
}

function pickBestLookaheadMove(
  state: GameState,
  legalMoves: Position[],
  difficulty: AiDifficulty,
): Position {
  const depth = difficulty === "expert" ? 2 : 1;

  return legalMoves.reduce((bestMove, move) => {
    const bestScore = scoreMoveWithLookahead(state, bestMove, depth);
    const moveScore = scoreMoveWithLookahead(state, move, depth);
    return moveScore > bestScore ? move : bestMove;
  });
}

function scoreMoveWithLookahead(
  state: GameState,
  move: Position,
  depth: number,
): number {
  const nextState = simulateTurn(state, move);

  if (!nextState) {
    return Number.NEGATIVE_INFINITY;
  }

  if (depth <= 0 || nextState.status !== "in-progress") {
    return evaluateMatchState(nextState, state.currentPlayer);
  }

  const opponentMoves = getLegalRotatePositions(
    nextState.board,
    nextState.spawn,
  );

  if (opponentMoves.length === 0) {
    return evaluateMatchState(nextState, state.currentPlayer);
  }

  const opponentScores = opponentMoves.map((opponentMove) => {
    const afterOpponent = simulateTurn(nextState, opponentMove);

    if (!afterOpponent) {
      return Number.POSITIVE_INFINITY;
    }

    return evaluateMatchState(afterOpponent, state.currentPlayer);
  });

  return Math.min(...opponentScores);
}

function scoreImmediateMove(state: GameState, move: Position): number {
  const turnResult = executePlayerTurn(
    state.board,
    state.spawn,
    { type: "rotate", position: move },
    { emptyTilesEnabled: state.emptyTilesEnabled },
  );

  if ("error" in turnResult) {
    return Number.NEGATIVE_INFINITY;
  }

  const outcome = evaluateTurnOutcome(turnResult.movement, state.currentPlayer);

  if (outcome.scored) {
    return GOAL_SCORE;
  }

  if (
    turnResult.movement.stoppedReason === "goal" &&
    turnResult.movement.goalOwner &&
    turnResult.movement.goalOwner !== state.currentPlayer
  ) {
    return OPPONENT_GOAL_SCORE;
  }

  if (outcome.isLoop) {
    return LOOP_SCORE;
  }

  return 0;
}

function simulateTurn(
  state: GameState,
  move: Position,
): GameState | null {
  const turnResult = executePlayerTurn(
    state.board,
    state.spawn,
    { type: "rotate", position: move },
    { emptyTilesEnabled: state.emptyTilesEnabled },
  );

  if ("error" in turnResult) {
    return null;
  }

  return resolvePlayerTurn(state, turnResult);
}

function evaluateMatchState(state: GameState, player: PlayerId): number {
  const opponent = getOpponent(player);
  const pointDiff =
    state.players[player].matchPoints - state.players[opponent].matchPoints;
  const scoreDiff =
    state.players[player].totalScore - state.players[opponent].totalScore;

  let value = pointDiff * 500 + scoreDiff;

  if (state.status === "won" && state.winner === player) {
    value += 2000;
  }

  if (state.status === "won" && state.winner === opponent) {
    value -= 2000;
  }

  if (state.currentPlayer === player) {
    value += 5;
  } else {
    value -= 5;
  }

  return value;
}
