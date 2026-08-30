import { describe, expect, it } from "vitest";

import { SEASONAL_EVENTS } from "@/data/seasonal-events";
import {
  getActiveSeasonalEvent,
  isSeasonalEventActive,
} from "@/utils/seasonal";

describe("seasonal utils", () => {
  it("detects anniversary event in late August", () => {
    const event = getActiveSeasonalEvent(new Date("2026-08-31T12:00:00Z"));

    expect(event?.id).toBe("anniversary");
  });

  it("returns no event outside seasonal windows", () => {
    const event = getActiveSeasonalEvent(new Date("2026-03-15T12:00:00Z"));

    expect(event).toBeUndefined();
  });

  it("handles winter ranges that wrap the year", () => {
    const winter = SEASONAL_EVENTS.find((entry) => entry.id === "winter");

    expect(winter).toBeDefined();
    expect(isSeasonalEventActive(winter!, new Date("2026-12-20T12:00:00Z"))).toBe(
      true,
    );
    expect(isSeasonalEventActive(winter!, new Date("2027-01-10T12:00:00Z"))).toBe(
      true,
    );
    expect(isSeasonalEventActive(winter!, new Date("2026-06-01T12:00:00Z"))).toBe(
      false,
    );
  });
});
