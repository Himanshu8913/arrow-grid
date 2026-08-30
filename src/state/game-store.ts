import { create } from "zustand";

import type { AiDifficulty } from "@/constants/ai";
import type { MatchFormat } from "@/constants/match-format";
import { getWinningScoreForFormat, DEFAULT_MATCH_FORMAT } from "@/constants/match-format";
import { createNewGame } from "@/engine";
import {
  createDailyChallengeGame,
  getDailyDateKey,
} from "@/engine/daily-challenge";
import { createGameFromPuzzle } from "@/engine/puzzle";
import { createPuzzleGameForSelection } from "@/engine/random-puzzle";
import { resolvePuzzleDefinition } from "@/engine/puzzle-resolver";
import { isCustomPuzzleId } from "@/engine/custom-puzzle";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import type { GameState } from "@/engine/game-state";
import { normalizeGameState } from "@/engine/game-state";
import { usePuzzleSessionStore } from "@/state/puzzle-session-store";
import { useProgressStore } from "@/state/progress-store";
import {
  getPlayerCountForMode,
  isDailyChallengeMode,
  isPuzzleMode,
  isVersusMatchMode,
} from "@/utils/game-messages";

interface SetGameOptions {
  persist?: boolean;
}

interface GameStore {
  game: GameState;
  gameMode: string;
  aiDifficulty: AiDifficulty;
  matchFormat: MatchFormat;
  matchSessionActive: boolean;
  setGame: (game: GameState, options?: SetGameOptions) => void;
  setGameMode: (gameMode: string) => void;
  setAiDifficulty: (aiDifficulty: AiDifficulty) => void;
  setMatchFormat: (matchFormat: MatchFormat) => void;
  setMatchSessionActive: (active: boolean) => void;
  startMatch: (seed?: number) => void;
}

/**
 * Core match state shared across gameplay UI.
 */
export const useGameStore = create<GameStore>((set, get) => ({
  game: createNewGame({ seed: 42, playerCount: 2 }),
  gameMode: "pvp",
  aiDifficulty: "medium",
  matchFormat: DEFAULT_MATCH_FORMAT,
  matchSessionActive: false,
  setGame: (game, options) => {
    const normalizedGame = normalizeGameState(game);
    set({ game: normalizedGame });

    if (options?.persist !== false) {
      useProgressStore.getState().syncActiveMatch(normalizedGame);
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
  setMatchFormat: (matchFormat) => {
    set({ matchFormat });
    useProgressStore.getState().setMatchFormat(matchFormat);
  },
  setMatchSessionActive: (matchSessionActive) => set({ matchSessionActive }),
  startMatch: (seed = Date.now()) => {
    const { gameMode } = get();

    if (isDailyChallengeMode(gameMode)) {
      const dateKey = getDailyDateKey();
      usePuzzleSessionStore.getState().resetPuzzleSession();
      const nextGame = createDailyChallengeGame(dateKey);
      set({ game: nextGame, matchSessionActive: true });
      useProgressStore.getState().syncActiveMatch(nextGame);
      return;
    }

    if (isPuzzleMode(gameMode)) {
      const puzzleId = usePuzzleSessionStore.getState().selectedPuzzleId;
      usePuzzleSessionStore.getState().resetPuzzleSession();
      const nextGame = createPuzzleGameForSelection(puzzleId, (id) =>
        createGameFromPuzzle(resolvePuzzleDefinition(id)),
      );
      if (isCustomPuzzleId(puzzleId)) {
        useCustomPuzzleStore.getState().recordPlay(puzzleId);
      }
      set({ game: nextGame, matchSessionActive: true });
      useProgressStore.getState().syncActiveMatch(nextGame);
      return;
    }

    const nextGame = createNewGame({
      seed,
      playerCount: getPlayerCountForMode(gameMode),
      winningScore: isVersusMatchMode(gameMode)
        ? getWinningScoreForFormat(get().matchFormat)
        : undefined,
    });
    set({ game: nextGame, matchSessionActive: true });
    useProgressStore.getState().syncActiveMatch(nextGame);
  },
}));
