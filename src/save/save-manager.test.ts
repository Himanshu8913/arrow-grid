import { beforeEach, describe, expect, it } from "vitest";

import { createNewGame } from "@/engine/game-controller";
import {
  clearGameplayProgress,
  getSaveSnapshot,
  hasSavedMatch,
  syncActiveMatch,
} from "@/save/save-manager";
import { useGameStore } from "@/state/game-store";
import { useProgressStore } from "@/state/progress-store";
import { useStatisticsStore } from "@/state/statistics-store";
import { installTestStorage } from "@/test/test-storage";

describe("save manager integration", () => {
  beforeEach(() => {
    installTestStorage();
    useProgressStore.getState().resetProgress();
    useStatisticsStore.getState().resetStatistics();
    useGameStore.getState().startMatch();
  });

  it("tracks active matches and clears gameplay progress", () => {
    const game = createNewGame({ seed: 55, playerCount: 2, size: 5 });
    syncActiveMatch(game);

    expect(hasSavedMatch()).toBe(true);
    expect(getSaveSnapshot().hasActiveMatch).toBe(true);

    clearGameplayProgress();

    expect(useStatisticsStore.getState().stats.gamesPlayed).toBe(0);
    expect(getSaveSnapshot().completedPuzzles).toBe(0);
    expect(hasSavedMatch()).toBe(true);
  });

  it("clears saved matches when a game finishes", () => {
    const game = createNewGame({ seed: 55, playerCount: 2, size: 5 });
    syncActiveMatch(game);
    syncActiveMatch({ ...game, status: "won", winner: "player1" });

    expect(hasSavedMatch()).toBe(false);
  });
});
