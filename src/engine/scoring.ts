import {
  DEFAULT_WINNING_MATCH_POINTS,
  EFFICIENCY_BONUS_PER_MOVE,
  GOAL_BASE_SCORE,
  NO_LOOP_BONUS,
  PERFECT_BONUS,
  SHORTEST_PATH_BONUS,
} from "@/constants/scoring";
import type { PlayerId } from "@/types/game";
import type {
  MatchOutcome,
  PlayerScoreState,
  ScoreTurnInput,
  TurnScoreBreakdown,
} from "@/types/scoring";

export interface CalculateGoalScoreInput {
  orbPathLength: number;
  shortestPathLength?: number;
  movesPlayed: number;
  targetMoves?: number;
  invalidMoves?: number;
  isLoop: boolean;
}

/**
 * Calculates puzzle points for a successful goal.
 */
export function calculateGoalScore(
  options: CalculateGoalScoreInput,
): TurnScoreBreakdown {
  const base = GOAL_BASE_SCORE;
  const noLoopBonus = options.isLoop ? 0 : NO_LOOP_BONUS;
  const shortestPathBonus =
    options.shortestPathLength !== undefined &&
    options.orbPathLength <= options.shortestPathLength
      ? SHORTEST_PATH_BONUS
      : 0;

  const efficiencyBonus =
    options.targetMoves !== undefined
      ? Math.max(
          0,
          (options.targetMoves - options.movesPlayed) *
            EFFICIENCY_BONUS_PER_MOVE,
        )
      : 0;

  const perfectBonus =
    options.targetMoves !== undefined &&
    options.movesPlayed <= options.targetMoves &&
    (options.invalidMoves ?? 0) === 0 &&
    !options.isLoop
      ? PERFECT_BONUS
      : 0;

  const total =
    base + noLoopBonus + shortestPathBonus + perfectBonus + efficiencyBonus;

  return {
    base,
    noLoopBonus,
    shortestPathBonus,
    perfectBonus,
    efficiencyBonus,
    total,
  };
}

/**
 * Calculates puzzle points for a turn outcome.
 * Returns `null` when the acting player did not score.
 */
export function calculateTurnScore(
  input: ScoreTurnInput & { orbPathLength: number },
): TurnScoreBreakdown | null {
  if (!input.outcome.scored) {
    return null;
  }

  return calculateGoalScore({
    orbPathLength: input.orbPathLength,
    shortestPathLength: input.shortestPathLength,
    movesPlayed: input.movesPlayed,
    targetMoves: input.targetMoves,
    invalidMoves: input.invalidMoves,
    isLoop: input.outcome.isLoop,
  });
}

/**
 * Creates a zeroed score state for both players.
 */
export function createInitialPlayerScores(): Record<PlayerId, PlayerScoreState> {
  return {
    player1: { matchPoints: 0, totalScore: 0 },
    player2: { matchPoints: 0, totalScore: 0 },
  };
}

/**
 * Applies match point and total score updates after a scoring turn.
 */
export function applyScoringTurn(
  players: Record<PlayerId, PlayerScoreState>,
  playerId: PlayerId,
  scoreBreakdown: TurnScoreBreakdown,
): Record<PlayerId, PlayerScoreState> {
  const current = players[playerId];

  return {
    ...players,
    [playerId]: {
      matchPoints: current.matchPoints + 1,
      totalScore: current.totalScore + scoreBreakdown.total,
    },
  };
}

/**
 * Checks whether a player has reached the winning match point threshold.
 */
export function checkMatchOutcome(
  players: Record<PlayerId, PlayerScoreState>,
  options: {
    winningScore?: number;
    playerCount?: 1 | 2;
  } = {},
): MatchOutcome {
  const winningScore = options.winningScore ?? DEFAULT_WINNING_MATCH_POINTS;
  const playerCount = options.playerCount ?? 2;

  if (playerCount === 1 && players.player1.matchPoints > 0) {
    return {
      status: "won",
      winner: "player1",
      reason: "single-player-goal",
    };
  }

  if (players.player1.matchPoints >= winningScore) {
    return {
      status: "won",
      winner: "player1",
      reason: "score-limit",
    };
  }

  if (players.player2.matchPoints >= winningScore) {
    return {
      status: "won",
      winner: "player2",
      reason: "score-limit",
    };
  }

  return { status: "in-progress" };
}

/**
 * Returns the opponent for a two-player match.
 */
export function getOpponent(playerId: PlayerId): PlayerId {
  return playerId === "player1" ? "player2" : "player1";
}
