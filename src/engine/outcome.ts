import type { OrbSimulationResult } from "@/engine/orb-movement";
import type { PlayerId, Position } from "@/types/game";
import type { TurnOutcome } from "@/types/scoring";

/**
 * Derives turn results from orb movement, including goal and loop detection.
 */
export function evaluateTurnOutcome(
  movement: OrbSimulationResult,
  actingPlayer: PlayerId,
): TurnOutcome {
  const isLoop = movement.stoppedReason === "loop";
  const scored =
    movement.stoppedReason === "goal" && movement.goalOwner === actingPlayer;

  return {
    scored,
    scoringPlayer: scored ? actingPlayer : undefined,
    isLoop,
    stoppedReason: movement.stoppedReason,
  };
}

/**
 * Returns true when the orb entered a goal tile during movement.
 */
export function didReachGoal(movement: OrbSimulationResult): boolean {
  return movement.stoppedReason === "goal";
}

/**
 * Returns the final orb position after movement completes.
 */
export function getOrbEndPosition(
  movement: OrbSimulationResult,
  spawn: Position,
): Position {
  return movement.path[movement.path.length - 1] ?? spawn;
}
