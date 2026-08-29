import { describe, expect, it } from "vitest";

import {
  createDailyChallengeGame,
  getDailyDateKey,
  getDailyPuzzleId,
  getDailySeed,
  isDailyPuzzleId,
} from "@/engine/daily-challenge";

describe("daily challenge helpers", () => {
  it("formats UTC date keys", () => {
    expect(getDailyDateKey(new Date("2026-08-30T15:30:00.000Z"))).toBe(
      "2026-08-30",
    );
  });

  it("derives stable seeds and puzzle ids", () => {
    const dateKey = "2026-08-30";
    expect(getDailySeed(dateKey)).toBe(getDailySeed(dateKey));
    expect(getDailyPuzzleId(dateKey)).toBe("daily-2026-08-30");
    expect(isDailyPuzzleId("daily-2026-08-30")).toBe(true);
    expect(isDailyPuzzleId("first-steps")).toBe(false);
  });
});

describe("createDailyChallengeGame", () => {
  it("creates the same board for the same UTC day", () => {
    const first = createDailyChallengeGame("2026-08-30");
    const second = createDailyChallengeGame("2026-08-30");

    expect(first.board).toEqual(second.board);
    expect(first.spawn).toEqual(second.spawn);
    expect(first.puzzleId).toBe("daily-2026-08-30");
    expect(first.moveLimit).toBeGreaterThan(0);
  });

  it("creates different boards for different days", () => {
    const first = createDailyChallengeGame("2026-08-30");
    const second = createDailyChallengeGame("2026-08-31");

    expect(first.board).not.toEqual(second.board);
  });
});
