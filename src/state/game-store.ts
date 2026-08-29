import { create } from "zustand";

import type { AiDifficulty } from "@/constants/ai";
import { createNewGame } from "@/engine";
import type { GameState } from "@/engine/game-state";
import { getPlayerCountForMode } from "@/utils/game-messages";

interface GameStore {
  game: GameState;
  gameMode: string;
  aiDifficulty: AiDifficulty;
  setGame: (game: GameState) => void;
  setGameMode: (gameMode: string) => void;
  setAiDifficulty: (aiDifficulty: AiDifficulty) => void;
  startMatch: (seed?: number) => void;
}

/**
 * Core match state shared across gameplay UI.
 */
export const useGameStore = create<GameStore>((set, get) => ({
  game: createNewGame({ seed: 42, playerCount: 2 }),
  gameMode: "pvp",
  aiDifficulty: "medium",
  setGame: (game) => set({ game }),
  setGameMode: (gameMode) => set({ gameMode }),
  setAiDifficulty: (aiDifficulty) => set({ aiDifficulty }),
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
