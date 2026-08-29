import type { ReactNode } from "react";
import { useEffect } from "react";

import { useGameStore } from "@/state/game-store";
import { getInitialGamePreferences, useProgressStore } from "@/state/progress-store";
import { usePuzzleSessionStore } from "@/state/puzzle-session-store";

function hydrateFromSave() {
  const { gameMode, aiDifficulty, selectedPuzzleId, activeMatch } =
    getInitialGamePreferences();
  const gameStore = useGameStore.getState();
  const puzzleStore = usePuzzleSessionStore.getState();

  gameStore.setGameMode(gameMode);
  gameStore.setAiDifficulty(aiDifficulty);
  puzzleStore.setSelectedPuzzleId(selectedPuzzleId);

  if (activeMatch?.game.status === "in-progress") {
    gameStore.setGame(activeMatch.game, { persist: false });
  }
}

/**
 * Restores persisted match and preference state after refresh.
 */
export function SaveProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    if (useProgressStore.persist.hasHydrated()) {
      hydrateFromSave();
    }

    return useProgressStore.persist.onFinishHydration(hydrateFromSave);
  }, []);

  return children;
}
