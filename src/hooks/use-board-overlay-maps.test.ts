import { describe, expect, it } from "vitest";

import { getBoardTileRenderState } from "@/hooks/use-board-overlay-maps";

describe("getBoardTileRenderState", () => {
  it("marks spawn, path, trail, and selection flags", () => {
    const position = { row: 1, col: 2 };
    const spawn = { row: 1, col: 2 };
    const pathKeys = new Set(["1,2", "1,3"]);
    const loopKeys = new Set(["0,0"]);
    const trailOpacityByKey = new Map([["1,2", 0.75]]);

    const state = getBoardTileRenderState({
      position,
      spawn,
      pathKeys,
      loopKeys,
      trailOpacityByKey,
      goalCelebrationPosition: null,
      rotatingPosition: null,
      hintPosition: { row: 4, col: 4 },
      selectedPosition: position,
    });

    expect(state).toEqual({
      isSpawn: true,
      isOnPath: true,
      trailOpacity: 0.75,
      isGoalCelebrating: false,
      isLoopTile: false,
      isLoopPulsing: false,
      isHinted: false,
      isArrowRotating: false,
      isSelected: true,
    });
  });
});
