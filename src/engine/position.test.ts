import { describe, expect, it } from "vitest";

import {
  isPositionInBounds,
  positionKey,
  positionsEqual,
  translatePosition,
} from "@/engine/position";

describe("positionsEqual", () => {
  it("compares row and column", () => {
    expect(positionsEqual({ row: 1, col: 2 }, { row: 1, col: 2 })).toBe(true);
    expect(positionsEqual({ row: 1, col: 2 }, { row: 2, col: 2 })).toBe(false);
  });
});

describe("isPositionInBounds", () => {
  it("checks board boundaries", () => {
    expect(isPositionInBounds({ row: 0, col: 6 }, 7)).toBe(true);
    expect(isPositionInBounds({ row: 7, col: 0 }, 7)).toBe(false);
    expect(isPositionInBounds({ row: -1, col: 0 }, 7)).toBe(false);
  });
});

describe("translatePosition", () => {
  it("adds deltas to the current position", () => {
    expect(translatePosition({ row: 2, col: 3 }, { row: -1, col: 1 })).toEqual({
      row: 1,
      col: 4,
    });
  });
});

describe("positionKey", () => {
  it("creates stable string keys", () => {
    expect(positionKey({ row: 4, col: 1 })).toBe("4,1");
  });
});
