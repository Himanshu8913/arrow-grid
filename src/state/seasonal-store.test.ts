import { beforeEach, describe, expect, it } from "vitest";

import { useSeasonalStore } from "@/state/seasonal-store";

describe("seasonal store", () => {
  beforeEach(() => {
    useSeasonalStore.getState().resetSeasonal();
  });

  it("unlocks rewards after reaching the challenge target", () => {
    let reward = null;

    for (let index = 0; index < 4; index += 1) {
      reward = useSeasonalStore.getState().recordWin("anniversary");
      expect(reward).toBeNull();
    }

    reward = useSeasonalStore.getState().recordWin("anniversary");

    expect(reward?.eventId).toBe("anniversary");
    expect(reward?.cosmeticIds.length).toBeGreaterThan(0);
    expect(useSeasonalStore.getState().getProgress("anniversary").rewardClaimed).toBe(
      true,
    );
  });
});
