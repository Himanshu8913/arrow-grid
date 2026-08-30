import type { FleetSimulationResult } from "@/engine/orb-movement";
import type { PlayerId, Position } from "@/types/game";
import type { TurnOutcome } from "@/types/scoring";

/**
 * Derives turn results from orb movement, including goal and loop detection.
 */
export function evaluateTurnOutcome(
  movement: FleetSimulationResult,
  actingPlayer: PlayerId,
): TurnOutcome {
  const isLoop = movement.stoppedReason === "loop";
  const scored =
    movement.stoppedReason === "goal" &&
    movement.goalOwner !== undefined &&
    movement.goalOwner === actingPlayer;

  return {
    scored,
    scoringPlayer: scored ? movement.goalOwner : undefined,
    isLoop,
    stoppedReason: movement.stoppedReason,
  };
}

/**
 * Returns true when the orb entered a goal tile during movement.
 */
export function didReachGoal(movement: FleetSimulationResult): boolean {
  return movement.stoppedReason === "goal" || movement.allGoalsReached;
}

/**
 * Returns the final orb position after movement completes.
 */
export function getOrbEndPosition(
  movement: FleetSimulationResult,
  spawn: Position,
): Position {
  return (
    movement.orbs[movement.orbs.length - 1]?.position ??
    movement.path[movement.path.length - 1] ??
    spawn
  );
}
