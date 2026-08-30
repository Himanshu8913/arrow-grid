import { SAVE_KEYS } from "@/constants/save";
import { DEFAULT_PUZZLE_ID } from "@/data/puzzles";
import { createNewGame } from "@/engine";
import {
  createDailyChallengeGame,
  getDailyDateKey,
} from "@/engine/daily-challenge";
import type { GameState } from "@/engine/game-state";
import { createGameFromPuzzle } from "@/engine/puzzle";
import { resolvePuzzleDefinition } from "@/engine/puzzle-resolver";
import { createPuzzleGameForSelection } from "@/engine/random-puzzle";
import { useDailyChallengeStore } from "@/state/daily-challenge-store";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import { useCosmeticsStore } from "@/state/cosmetics-store";
import { useAchievementStore } from "@/state/achievement-store";
import { useGameStore } from "@/state/game-store";
import { useProfileStore } from "@/state/profile-store";
import { useProgressStore } from "@/state/progress-store";
import { usePuzzleSessionStore } from "@/state/puzzle-session-store";
import { useSettingsStore } from "@/state/settings-store";
import { useStatisticsStore } from "@/state/statistics-store";
import { createInitialGameProgress } from "@/types/progress";
import type { PuzzleStarRating } from "@/types/puzzle";
import {
  getPlayerCountForMode,
  isDailyChallengeMode,
  isPuzzleMode,
} from "@/utils/game-messages";

export interface SaveSnapshot {
  hasActiveMatch: boolean;
  completedPuzzles: number;
  displayName: string;
}

/**
 * Returns whether a resumable in-progress match exists in storage.
 */
export function hasSavedMatch(): boolean {
  return useProgressStore.getState().activeMatch?.game.status === "in-progress";
}

/**
 * Summarizes persisted player data for menus and diagnostics.
 */
export function getSaveSnapshot(): SaveSnapshot {
  const progress = useProgressStore.getState();
  const profile = useProfileStore.getState();

  return {
    hasActiveMatch: hasSavedMatch(),
    completedPuzzles: Object.values(progress.puzzleProgress).filter(
      (record) => record.completed,
    ).length,
    displayName: profile.displayName,
  };
}

function createLobbyGame(
  gameMode: string,
  selectedPuzzleId: string,
  seed = Date.now(),
): GameState {
  if (isDailyChallengeMode(gameMode)) {
    return createDailyChallengeGame(getDailyDateKey());
  }

  if (isPuzzleMode(gameMode)) {
    return createPuzzleGameForSelection(selectedPuzzleId, (puzzleId) =>
      createGameFromPuzzle(resolvePuzzleDefinition(puzzleId)),
    );
  }

  return createNewGame({
    seed,
    playerCount: getPlayerCountForMode(gameMode),
  });
}

function resolvePlayLobbyMode(gameMode: string): string {
  if (isDailyChallengeMode(gameMode)) {
    return createInitialGameProgress().gameMode;
  }

  return gameMode;
}

export function refreshLobbyPreview(): void {
  const gameStore = useGameStore.getState();

  if (gameStore.matchSessionActive) {
    return;
  }

  const selectedPuzzleId =
    usePuzzleSessionStore.getState().selectedPuzzleId || DEFAULT_PUZZLE_ID;
  const lobbyGame = createLobbyGame(gameStore.gameMode, selectedPuzzleId);
  gameStore.setGame(lobbyGame, { persist: false });
}

/**
 * Opens the play screen with a fresh lobby preview without overwriting a saved match.
 */
export function preparePlayLobby(): void {
  const progress = useProgressStore.getState();
  const gameStore = useGameStore.getState();
  const selectedPuzzleId = progress.selectedPuzzleId || DEFAULT_PUZZLE_ID;
  const lobbyMode = resolvePlayLobbyMode(progress.gameMode);

  gameStore.setGameMode(lobbyMode);
  gameStore.setAiDifficulty(progress.aiDifficulty);
  usePuzzleSessionStore.getState().setSelectedPuzzleId(selectedPuzzleId);
  usePuzzleSessionStore.getState().resetPuzzleSession();

  refreshLobbyPreview();
  gameStore.setMatchSessionActive(false);
}

/**
 * Restores the saved in-progress match for Continue.
 */
export function resumeSavedMatch(): boolean {
  const progress = useProgressStore.getState();
  const activeMatch = progress.activeMatch;

  if (!activeMatch || activeMatch.game.status !== "in-progress") {
    return false;
  }

  const gameStore = useGameStore.getState();
  const selectedPuzzleId = progress.selectedPuzzleId || DEFAULT_PUZZLE_ID;

  gameStore.setGameMode(progress.gameMode);
  gameStore.setAiDifficulty(progress.aiDifficulty);
  usePuzzleSessionStore.getState().setSelectedPuzzleId(selectedPuzzleId);
  gameStore.setGame(activeMatch.game, { persist: false });
  gameStore.setMatchSessionActive(true);
  return true;
}

/**
 * Clears gameplay progress while keeping preferences and profile identity.
 */
export function clearGameplayProgress(): void {
  useStatisticsStore.getState().resetStatistics();
  useAchievementStore.getState().resetAchievements();
  useCosmeticsStore.getState().resetCosmetics();
  useDailyChallengeStore.getState().resetDailyChallenge();
  useProgressStore.getState().resetProgress();

  const defaults = createInitialGameProgress();
  const gameStore = useGameStore.getState();
  gameStore.setGameMode(defaults.gameMode);
  gameStore.setAiDifficulty(defaults.aiDifficulty);
  usePuzzleSessionStore.getState().setSelectedPuzzleId(defaults.selectedPuzzleId);
  gameStore.startMatch();
}

/**
 * Clears every local save slot, including settings and theme.
 */
export function clearAllSaves(): void {
  clearGameplayProgress();
  useCustomPuzzleStore.getState().resetLibrary();
  useSettingsStore.getState().resetSettings();
  useProfileStore.getState().resetProfile();
  useCosmeticsStore.getState().resetCosmetics();
  localStorage.removeItem(SAVE_KEYS.theme);
}

/**
 * Persists puzzle completion progress and best star rating.
 */
export function recordPuzzleCompletion(
  puzzleId: string,
  stars: PuzzleStarRating,
): void {
  useProgressStore.getState().recordPuzzleCompletion(puzzleId, stars);
}

/**
 * Saves or clears the active match depending on game status.
 */
export function syncActiveMatch(game: GameState): void {
  useProgressStore.getState().syncActiveMatch(game);
}
