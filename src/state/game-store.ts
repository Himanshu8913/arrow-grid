import { create } from "zustand";

import type { AiDifficulty } from "@/constants/ai";
import { createNewGame } from "@/engine";
import {
  createDailyChallengeGame,
  getDailyDateKey,
} from "@/engine/daily-challenge";
import { createGameFromPuzzle } from "@/engine/puzzle";
import type { GameState } from "@/engine/game-state";
import { getPuzzleById } from "@/data/puzzles";
import { usePuzzleSessionStore } from "@/state/puzzle-session-store";
import { useProgressStore } from "@/state/progress-store";
import {
  getPlayerCountForMode,
  isDailyChallengeMode,
  isPuzzleMode,
} from "@/utils/game-messages";

interface SetGameOptions {
  persist?: boolean;
}

interface GameStore {
  game: GameState;
  gameMode: string;
  aiDifficulty: AiDifficulty;
  setGame: (game: GameState, options?: SetGameOptions) => void;
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
  setGame: (game, options) => {
    set({ game });

    if (options?.persist !== false) {
      useProgressStore.getState().syncActiveMatch(game);
    }
  },
  setGameMode: (gameMode) => {
    set({ gameMode });
    useProgressStore.getState().setGameMode(gameMode);
  },
  setAiDifficulty: (aiDifficulty) => {
    set({ aiDifficulty });
    useProgressStore.getState().setAiDifficulty(aiDifficulty);
  },
  startMatch: (seed = Date.now()) => {
    const { gameMode } = get();

    if (isDailyChallengeMode(gameMode)) {
      const dateKey = getDailyDateKey();
      usePuzzleSessionStore.getState().resetPuzzleSession();
      const nextGame = createDailyChallengeGame(dateKey);
      set({ game: nextGame });
      useProgressStore.getState().syncActiveMatch(nextGame);
      return;
    }

    if (isPuzzleMode(gameMode)) {
      const puzzleId = usePuzzleSessionStore.getState().selectedPuzzleId;
      usePuzzleSessionStore.getState().resetPuzzleSession();
      const nextGame = createGameFromPuzzle(getPuzzleById(puzzleId));
      set({ game: nextGame });
      useProgressStore.getState().syncActiveMatch(nextGame);
      return;
    }

    const nextGame = createNewGame({
      seed,
      playerCount: getPlayerCountForMode(gameMode),
    });
    set({ game: nextGame });
    useProgressStore.getState().syncActiveMatch(nextGame);
  },
}));
