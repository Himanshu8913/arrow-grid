import { describe, expect, it } from "vitest";

import { createNewGame } from "@/engine/game-controller";
import { createGameFromPuzzle } from "@/engine/puzzle";
import { getPuzzleById } from "@/data/puzzles";
import {
  calculateMatchRewards,
  formatMatchDuration,
  getResultHeadline,
} from "@/utils/match-rewards";

describe("calculateMatchRewards", () => {
  it("awards win coins for practice victories", () => {
    const game = {
      ...createNewGame({ seed: 1, playerCount: 2, size: 5 }),
      status: "won" as const,
      winner: "player1" as const,
      players: {
        player1: { matchPoints: 1, totalScore: 240 },
        player2: { matchPoints: 0, totalScore: 0 },
      },
    };

    const rewards = calculateMatchRewards(game, "practice");

    expect(rewards.isWin).toBe(true);
    expect(rewards.coins).toBeGreaterThan(0);
    expect(rewards.xp).toBeGreaterThan(0);
  });

  it("treats puzzle completion as a win", () => {
    const game = {
      ...createGameFromPuzzle(getPuzzleById("first-steps")),
      status: "won" as const,
      winner: "player1" as const,
      players: {
        player1: { matchPoints: 1, totalScore: 180 },
        player2: { matchPoints: 0, totalScore: 0 },
      },
    };

    expect(calculateMatchRewards(game, "puzzle").isWin).toBe(true);
  });
});

describe("formatMatchDuration", () => {
  it("formats seconds as m:ss", () => {
    expect(formatMatchDuration(0)).toBe("0:00");
    expect(formatMatchDuration(65)).toBe("1:05");
  });
});

describe("getResultHeadline", () => {
  it("returns puzzle and practice headlines", () => {
    const puzzleWin = {
      ...createGameFromPuzzle(getPuzzleById("first-steps")),
      status: "won" as const,
      winner: "player1" as const,
    };

    expect(getResultHeadline(puzzleWin, "puzzle", 3)).toBe("Perfect puzzle!");
    expect(
      getResultHeadline(
        { ...puzzleWin, status: "lost" },
        "puzzle",
        null,
      ),
    ).toBe("Out of moves");
    expect(
      getResultHeadline(
        {
          ...createNewGame({ seed: 1, playerCount: 2 }),
          status: "won",
          winner: "player2",
        },
        "practice",
        null,
      ),
    ).toBe("AI wins the match");
  });
});
