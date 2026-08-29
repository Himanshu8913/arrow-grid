import type { MovementStopReason } from "@/engine/orb-movement";
import type { PlayerId } from "@/types/game";

export type MatchStatus = "in-progress" | "won" | "draw";

export interface TurnOutcome {
  scored: boolean;
  scoringPlayer?: PlayerId;
  isLoop: boolean;
  stoppedReason: MovementStopReason;
}

export interface TurnScoreBreakdown {
  base: number;
  noLoopBonus: number;
  shortestPathBonus: number;
  perfectBonus: number;
  efficiencyBonus: number;
  total: number;
}

export interface PlayerScoreState {
  matchPoints: number;
  totalScore: number;
}

export interface MatchOutcome {
  status: MatchStatus;
  winner?: PlayerId;
  reason?: "score-limit" | "single-player-goal";
}

export interface ScoreTurnInput {
  outcome: TurnOutcome;
  actingPlayer: PlayerId;
  movesPlayed: number;
  targetMoves?: number;
  shortestPathLength?: number;
  invalidMoves?: number;
}
