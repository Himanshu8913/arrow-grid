import { SAVE_KEYS } from "@/constants/save";
import { useAchievementStore } from "@/state/achievement-store";
import { useGameStore } from "@/state/game-store";
import { useProfileStore } from "@/state/profile-store";
import { useProgressStore } from "@/state/progress-store";
import { usePuzzleSessionStore } from "@/state/puzzle-session-store";
import { useSettingsStore } from "@/state/settings-store";
import { useStatisticsStore } from "@/state/statistics-store";
import type { GameState } from "@/engine/game-state";
import { createInitialGameProgress } from "@/types/progress";
import type { PuzzleStarRating } from "@/types/puzzle";

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

/**
 * Clears gameplay progress while keeping preferences and profile identity.
 */
export function clearGameplayProgress(): void {
  useStatisticsStore.getState().resetStatistics();
  useAchievementStore.getState().resetAchievements();
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
  useSettingsStore.getState().resetSettings();
  useProfileStore.getState().resetProfile();
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
