import { describe, expect, it } from "vitest";

import { createEmptyBoard } from "@/engine/board";
import {
  getLegalRotatePositions,
  tryRotateArrow,
  validateRotateMove,
} from "@/engine/rotation";

describe("validateRotateMove", () => {
  const spawn = { row: 0, col: 0 };
  const board = createEmptyBoard(3, { kind: "wall" });

  board[1][1] = { kind: "arrow", direction: "up" };
  board[0][1] = { kind: "goal", owner: "player1" };
  board[2][2] = { kind: "empty" };

  it("rejects out-of-bounds, spawn, wall, goal, and empty tiles", () => {
    expect(validateRotateMove(board, { row: 9, col: 0 }, spawn).valid).toBe(
      false,
    );
    expect(validateRotateMove(board, spawn, spawn)).toEqual({
      valid: false,
      reason: "spawn",
    });
    expect(validateRotateMove(board, { row: 0, col: 1 }, spawn)).toEqual({
      valid: false,
      reason: "goal",
    });
    expect(validateRotateMove(board, { row: 2, col: 2 }, spawn)).toEqual({
      valid: false,
      reason: "empty",
    });
    expect(validateRotateMove(board, { row: 2, col: 0 }, spawn)).toEqual({
      valid: false,
      reason: "wall",
    });
  });

  it("allows arrow tiles", () => {
    expect(validateRotateMove(board, { row: 1, col: 1 }, spawn)).toEqual({
      valid: true,
    });
  });
});

describe("tryRotateArrow", () => {
  it("rotates a legal arrow clockwise", () => {
    const board = createEmptyBoard(3, { kind: "wall" });
    board[1][1] = { kind: "arrow", direction: "up" };

    const result = tryRotateArrow(
      board,
      { type: "rotate", position: { row: 1, col: 1 } },
      { row: 0, col: 0 },
    );

    expect("board" in result).toBe(true);
    if ("board" in result) {
      expect(result.board[1][1]).toEqual({
        kind: "arrow",
        direction: "right",
      });
    }
  });
});

describe("getLegalRotatePositions", () => {
  it("returns only rotatable arrow tiles", () => {
    const board = createEmptyBoard(3, { kind: "wall" });
    const spawn = { row: 0, col: 0 };
    board[0][1] = { kind: "arrow", direction: "down" };
    board[1][1] = { kind: "goal", owner: "player1" };

    expect(getLegalRotatePositions(board, spawn)).toEqual([{ row: 0, col: 1 }]);
  });
});
