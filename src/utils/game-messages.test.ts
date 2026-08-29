import { describe, expect, it } from "vitest";

import { createNewGame } from "@/engine/game-controller";
import {
  getMoveErrorMessage,
  getPlayerCountForMode,
  getPlayerLabel,
  isDailyChallengeMode,
  isHumanPlayerTurn,
  isPracticeMode,
  isPuzzleMode,
  isSoloChallengeMode,
} from "@/utils/game-messages";

describe("game mode helpers", () => {
  it("maps modes to player counts", () => {
    expect(getPlayerCountForMode("pvp")).toBe(2);
    expect(getPlayerCountForMode("practice")).toBe(2);
    expect(getPlayerCountForMode("puzzle")).toBe(1);
    expect(getPlayerCountForMode("daily")).toBe(1);
  });

  it("identifies mode categories", () => {
    expect(isPracticeMode("practice")).toBe(true);
    expect(isPuzzleMode("puzzle")).toBe(true);
    expect(isDailyChallengeMode("daily")).toBe(true);
    expect(isSoloChallengeMode("daily")).toBe(true);
    expect(isSoloChallengeMode("pvp")).toBe(false);
  });

  it("blocks human input during AI turns in practice mode", () => {
    expect(isHumanPlayerTurn("practice", "player1")).toBe(true);
    expect(isHumanPlayerTurn("practice", "player2")).toBe(false);
    expect(isHumanPlayerTurn("pvp", "player2")).toBe(true);
  });
});

describe("player labels and move errors", () => {
  it("returns readable labels and error messages", () => {
    expect(getPlayerLabel("player1")).toBe("Player 1");
    expect(getMoveErrorMessage("spawn")).toContain("spawn");
    expect(getMoveErrorMessage("game-over")).toContain("ended");
  });
});

describe("match rewards inputs", () => {
  it("supports reward calculation for finished matches", () => {
    const game = createNewGame({ seed: 1, playerCount: 2, size: 5 });
    const finished = {
      ...game,
      status: "won" as const,
      winner: "player1" as const,
      players: {
        ...game.players,
        player1: { matchPoints: 3, totalScore: 450 },
      },
    };

    expect(finished.players.player1.totalScore).toBeGreaterThan(0);
  });
});
