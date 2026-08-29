import { describe, expect, it } from "vitest";

import {
  createRandomPuzzleGame,
  getRandomPuzzleSeed,
  isRandomPuzzleId,
  RANDOM_PUZZLE_ID,
} from "@/engine/random-puzzle";

describe("createRandomPuzzleGame", () => {
  it("creates a playable puzzle with random id and limits", () => {
    const game = createRandomPuzzleGame(12345);

    expect(game.playerCount).toBe(1);
    expect(game.status).toBe("in-progress");
    expect(isRandomPuzzleId(game.puzzleId)).toBe(true);
    expect(getRandomPuzzleSeed(game.puzzleId)).toBeTruthy();
    expect(game.moveLimit).toBeGreaterThan(0);
    expect(game.targetMoves).toBeGreaterThan(0);
    expect(game.goals.player1).toBeTruthy();
  });

  it("is deterministic for the same seed", () => {
    const first = createRandomPuzzleGame(4242);
    const second = createRandomPuzzleGame(4242);

    expect(first.puzzleId).toBe(second.puzzleId);
    expect(first.board).toEqual(second.board);
  });

  it("produces different boards for different seeds", () => {
    const first = createRandomPuzzleGame(1);
    const second = createRandomPuzzleGame(2);

    expect(first.puzzleId).not.toBe(second.puzzleId);
    expect(first.board).not.toEqual(second.board);
  });

  it("recognizes random puzzle ids", () => {
    expect(isRandomPuzzleId(RANDOM_PUZZLE_ID)).toBe(true);
    expect(isRandomPuzzleId("random-99")).toBe(true);
    expect(isRandomPuzzleId("first-steps")).toBe(false);
  });
});
