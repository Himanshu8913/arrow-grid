import { describe, expect, it } from "vitest";

import { getPuzzleById } from "@/data/puzzles";
import { playTurn } from "@/engine/game-controller";
import {
  applyPuzzleMoveLimit,
  calculatePuzzleStars,
  createGameFromPuzzle,
} from "@/engine/puzzle";

describe("createGameFromPuzzle", () => {
  it("builds a single-player puzzle with limits", () => {
    const puzzle = getPuzzleById("first-steps");
    const game = createGameFromPuzzle(puzzle);

    expect(game.playerCount).toBe(1);
    expect(game.puzzleId).toBe("first-steps");
    expect(game.moveLimit).toBe(puzzle.moveLimit);
    expect(game.targetMoves).toBe(puzzle.targetMoves);
    expect(game.status).toBe("in-progress");
  });
});

describe("playTurn on puzzles", () => {
  it("wins the first-steps puzzle with one rotation", () => {
    const game = createGameFromPuzzle(getPuzzleById("first-steps"));
    const result = playTurn(game, {
      type: "rotate",
      position: { row: 2, col: 2 },
    });

    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.status).toBe("won");
      expect(result.winner).toBe("player1");
    }
  });
});

describe("applyPuzzleMoveLimit", () => {
  it("marks the puzzle as lost when the move limit is reached", () => {
    const game = {
      ...createGameFromPuzzle(getPuzzleById("first-steps")),
      movesPlayed: 6,
      moveLimit: 6,
    };

    expect(applyPuzzleMoveLimit(game).status).toBe("lost");
  });
});

describe("calculatePuzzleStars", () => {
  it("rates perfect, good, and hinted completions", () => {
    expect(calculatePuzzleStars(1, 1, 0)).toBe(3);
    expect(calculatePuzzleStars(3, 1, 0)).toBe(2);
    expect(calculatePuzzleStars(4, 1, 1)).toBe(1);
    expect(calculatePuzzleStars(6, 1, 2)).toBe(1);
  });
});
