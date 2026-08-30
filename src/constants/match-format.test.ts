import { describe, expect, it } from "vitest";

import {
  formatMatchPointsProgress,
  getWinningScoreForFormat,
} from "@/constants/match-format";

describe("match format helpers", () => {
  it("maps series length to round wins required", () => {
    expect(getWinningScoreForFormat(1)).toBe(1);
    expect(getWinningScoreForFormat(3)).toBe(2);
    expect(getWinningScoreForFormat(5)).toBe(3);
  });

  it("formats match point progress", () => {
    expect(formatMatchPointsProgress(1, 2)).toBe("1 / 2");
    expect(formatMatchPointsProgress(3, 3)).toBe("3 / 3");
  });
});
