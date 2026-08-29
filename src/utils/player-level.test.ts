import { describe, expect, it } from "vitest";

import { getPlayerLevel, getXpProgressInLevel } from "@/utils/player-level";

describe("player level helpers", () => {
  it("starts at level 1 with zero XP", () => {
    expect(getPlayerLevel(0)).toBe(1);
    expect(getXpProgressInLevel(0)).toEqual({ current: 0, max: 100 });
  });

  it("levels up every 100 XP", () => {
    expect(getPlayerLevel(99)).toBe(1);
    expect(getPlayerLevel(100)).toBe(2);
    expect(getXpProgressInLevel(150)).toEqual({ current: 50, max: 100 });
  });
});
