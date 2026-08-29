import { beforeEach, describe, expect, it } from "vitest";

import {
  clearGameplayProgress,
  getSaveSnapshot,
  hasSavedMatch,
  preparePlayLobby,
  resumeSavedMatch,
  syncActiveMatch,
} from "@/save/save-manager";
import { useGameStore } from "@/state/game-store";
import { useProgressStore } from "@/state/progress-store";
import { useStatisticsStore } from "@/state/statistics-store";
import { installTestStorage } from "@/test/test-storage";
import { createNewGame } from "@/engine/game-controller";

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

  it("prepares a lobby without overwriting a saved match", () => {
    const saved = createNewGame({ seed: 55, playerCount: 2, size: 5 });
    saved.movesPlayed = 3;
    syncActiveMatch(saved);

    preparePlayLobby();

    expect(hasSavedMatch()).toBe(true);
    expect(useGameStore.getState().matchSessionActive).toBe(false);
    expect(useGameStore.getState().game.movesPlayed).toBe(0);
    expect(useProgressStore.getState().activeMatch?.game.movesPlayed).toBe(3);
  });

  it("resumes a saved match for Continue", () => {
    const saved = createNewGame({ seed: 55, playerCount: 2, size: 5 });
    saved.movesPlayed = 4;
    syncActiveMatch(saved);

    preparePlayLobby();
    expect(useGameStore.getState().game.movesPlayed).toBe(0);

    const resumed = resumeSavedMatch();
    expect(resumed).toBe(true);
    expect(useGameStore.getState().matchSessionActive).toBe(true);
    expect(useGameStore.getState().game.movesPlayed).toBe(4);
  });
});
