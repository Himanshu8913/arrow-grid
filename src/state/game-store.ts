import { create } from "zustand";

import { createNewGame } from "@/engine";
import type { GameState } from "@/engine/game-state";
import { getPlayerCountForMode } from "@/utils/game-messages";

interface GameStore {
  game: GameState;
  gameMode: string;
  setGame: (game: GameState) => void;
  setGameMode: (gameMode: string) => void;
  startMatch: (seed?: number) => void;
}

/**
 * Core match state shared across gameplay UI.
 */
export const useGameStore = create<GameStore>((set, get) => ({
  game: createNewGame({ seed: 42, playerCount: 2 }),
  gameMode: "pvp",
  setGame: (game) => set({ game }),
  setGameMode: (gameMode) => set({ gameMode }),
  startMatch: (seed = Date.now()) => {
    const { gameMode } = get();
    set({
      game: createNewGame({
        seed,
        playerCount: getPlayerCountForMode(gameMode),
      }),
    });
  },
}));
