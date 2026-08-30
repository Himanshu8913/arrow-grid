import { describe, expect, it } from "vitest";

import { evaluateTurnOutcome } from "@/engine/outcome";
import type { FleetSimulationResult } from "@/engine/orb-movement";
import { createEmptyBoard } from "@/engine/board";

function createMovement(
  overrides: Partial<FleetSimulationResult> = {},
): FleetSimulationResult {
  return {
    path: [],
    stoppedReason: "goal",
    goalOwner: "player1",
    board: createEmptyBoard(5, { kind: "wall" }),
    orbs: [],
    orbPaths: {},
    allGoalsReached: false,
    ...overrides,
  };
}

describe("evaluateTurnOutcome", () => {
  it("scores only when the acting player reaches their own goal", () => {
    const movement = createMovement({ goalOwner: "player1" });

    const outcome = evaluateTurnOutcome(movement, "player1");

    expect(outcome.scored).toBe(true);
    expect(outcome.scoringPlayer).toBe("player1");
  });

  it("does not score when the orb stops in the opponent goal", () => {
    const movement = createMovement({ goalOwner: "player2" });

    const outcome = evaluateTurnOutcome(movement, "player1");

    expect(outcome.scored).toBe(false);
    expect(outcome.scoringPlayer).toBeUndefined();
  });

  it("does not score on non-goal stops", () => {
    const movement = createMovement({
      stoppedReason: "wall",
      goalOwner: undefined,
    });

    const outcome = evaluateTurnOutcome(movement, "player1");

    expect(outcome.scored).toBe(false);
    expect(outcome.scoringPlayer).toBeUndefined();
  });
});
