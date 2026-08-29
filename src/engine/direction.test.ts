import { describe, expect, it } from "vitest";

import {
  getDirectionDelta,
  isDirection,
  rotateDirectionClockwise,
} from "@/engine/direction";

describe("rotateDirectionClockwise", () => {
  it("rotates through the clockwise cycle", () => {
    expect(rotateDirectionClockwise("up")).toBe("right");
    expect(rotateDirectionClockwise("right")).toBe("down");
    expect(rotateDirectionClockwise("down")).toBe("left");
    expect(rotateDirectionClockwise("left")).toBe("up");
  });
});

describe("getDirectionDelta", () => {
  it("returns cardinal movement deltas", () => {
    expect(getDirectionDelta("up")).toEqual({ row: -1, col: 0 });
    expect(getDirectionDelta("right")).toEqual({ row: 0, col: 1 });
    expect(getDirectionDelta("down")).toEqual({ row: 1, col: 0 });
    expect(getDirectionDelta("left")).toEqual({ row: 0, col: -1 });
  });
});

describe("isDirection", () => {
  it("accepts valid directions only", () => {
    expect(isDirection("up")).toBe(true);
    expect(isDirection("diagonal")).toBe(false);
  });
});
