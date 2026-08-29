import { describe, expect, it } from "vitest";

import {
  applyScoringTurn,
  calculateGoalScore,
  calculateTurnScore,
  checkMatchOutcome,
  createInitialPlayerScores,
  getOpponent,
} from "@/engine/scoring";

describe("calculateGoalScore", () => {
  it("awards bonuses for efficient non-loop goals", () => {
    const score = calculateGoalScore({
      orbPathLength: 4,
      shortestPathLength: 5,
      movesPlayed: 2,
      targetMoves: 3,
      invalidMoves: 0,
      isLoop: false,
    });

    expect(score.base).toBeGreaterThan(0);
    expect(score.noLoopBonus).toBeGreaterThan(0);
    expect(score.shortestPathBonus).toBeGreaterThan(0);
    expect(score.perfectBonus).toBeGreaterThan(0);
    expect(score.total).toBe(
      score.base +
        score.noLoopBonus +
        score.shortestPathBonus +
        score.perfectBonus +
        score.efficiencyBonus,
    );
  });

  it("skips loop and perfect bonuses when the orb loops", () => {
    const score = calculateGoalScore({
      orbPathLength: 6,
      movesPlayed: 2,
      targetMoves: 3,
      isLoop: true,
    });

    expect(score.noLoopBonus).toBe(0);
    expect(score.perfectBonus).toBe(0);
  });
});

describe("calculateTurnScore", () => {
  it("returns null when the acting player did not score", () => {
    expect(
      calculateTurnScore({
        outcome: { scored: false, isLoop: false, stoppedReason: "wall" },
        actingPlayer: "player1",
        orbPathLength: 3,
        movesPlayed: 1,
      }),
    ).toBeNull();
  });
});

describe("applyScoringTurn", () => {
  it("increments match points and total score for the acting player", () => {
    const players = createInitialPlayerScores();
    const updated = applyScoringTurn(players, "player1", {
      base: 100,
      noLoopBonus: 20,
      shortestPathBonus: 0,
      perfectBonus: 0,
      efficiencyBonus: 0,
      total: 120,
    });

    expect(updated.player1.matchPoints).toBe(1);
    expect(updated.player1.totalScore).toBe(120);
    expect(updated.player2.matchPoints).toBe(0);
  });
});

describe("checkMatchOutcome", () => {
  it("ends single-player puzzles after the first goal", () => {
    const players = createInitialPlayerScores();
    players.player1.matchPoints = 1;

    expect(checkMatchOutcome(players, { playerCount: 1 })).toEqual({
      status: "won",
      winner: "player1",
      reason: "single-player-goal",
    });
  });

  it("declares a winner when a player reaches the score limit", () => {
    const players = createInitialPlayerScores();
    players.player2.matchPoints = 3;

    expect(checkMatchOutcome(players, { winningScore: 3, playerCount: 2 })).toEqual({
      status: "won",
      winner: "player2",
      reason: "score-limit",
    });
  });

  it("keeps the match in progress below the threshold", () => {
    expect(
      checkMatchOutcome(createInitialPlayerScores(), {
        winningScore: 3,
        playerCount: 2,
      }),
    ).toEqual({ status: "in-progress" });
  });
});

describe("getOpponent", () => {
  it("returns the other player id", () => {
    expect(getOpponent("player1")).toBe("player2");
    expect(getOpponent("player2")).toBe("player1");
  });
});
