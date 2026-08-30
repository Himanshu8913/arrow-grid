import { describe, expect, it } from "vitest";

import { getTileAriaLabel } from "@/utils/board-a11y";

describe("getTileAriaLabel", () => {
  it("describes arrow tiles with direction and location", () => {
    expect(
      getTileAriaLabel(
        { kind: "arrow", direction: "right" },
        { row: 0, col: 2 },
      ),
    ).toBe(
      "Arrow pointing right. Row 1, column 3. Press Enter or Space to rotate.",
    );
  });

  it("includes goal owner and accessibility state flags", () => {
    expect(
      getTileAriaLabel(
        { kind: "goal", owner: "player2" },
        { row: 4, col: 1 },
        { isHinted: true, isSpawn: true },
      ),
    ).toBe(
      "Player 2 goal, orb spawn point, hinted. Row 5, column 2.",
    );
  });
});
