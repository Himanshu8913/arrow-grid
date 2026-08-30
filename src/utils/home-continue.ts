import { getPuzzleById, resolveCatalogPuzzleId } from "@/data/puzzles";
import { isCustomPuzzleId } from "@/engine/custom-puzzle";
import { isDailyPuzzleId } from "@/engine/daily-challenge";
import { getPuzzleDisplayInfo } from "@/utils/puzzle-display";
import {
  isDailyChallengeMode,
  isPracticeMode,
  isPuzzleMode,
} from "@/utils/game-messages";
import type { SavedMatch } from "@/types/progress";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import { useProgressStore } from "@/state/progress-store";

export interface ContinueMatchSummary {
  title: string;
  subtitle: string;
  detail: string;
}

function formatMovesRemaining(savedMatch: SavedMatch): string {
  const { game } = savedMatch;
  const moveLimit = game.moveLimit;

  if (moveLimit === undefined) {
    return `${game.movesPlayed} moves played`;
  }

  const remaining = Math.max(0, moveLimit - game.movesPlayed);

  return remaining === 1 ? "1 move left" : `${remaining} moves left`;
}

/**
 * Player-facing summary for the continue card on the home screen.
 */
export function getContinueMatchSummary(savedMatch: SavedMatch): ContinueMatchSummary {
  const gameMode = useProgressStore.getState().gameMode;
  const { game } = savedMatch;

  if (isDailyChallengeMode(gameMode) || isDailyPuzzleId(game.puzzleId)) {
    return {
      title: "Continue",
      subtitle: "Daily Challenge",
      detail: formatMovesRemaining(savedMatch),
    };
  }

  if (isPuzzleMode(gameMode)) {
    const display = getPuzzleDisplayInfo(game);

    return {
      title: "Continue",
      subtitle: display.title,
      detail: formatMovesRemaining(savedMatch),
    };
  }

  if (isPracticeMode(gameMode)) {
    const difficulty = useProgressStore.getState().aiDifficulty;

    return {
      title: "Continue",
      subtitle: `Practice vs AI · ${difficulty}`,
      detail: formatMovesRemaining(savedMatch),
    };
  }

  const scoreLine = `P1 ${game.players.player1.matchPoints} · P2 ${game.players.player2.matchPoints}`;

  return {
    title: "Continue",
    subtitle: "Player vs Player",
    detail: `${scoreLine} · ${formatMovesRemaining(savedMatch)}`,
  };
}

/**
 * Resolves a short label for recent puzzle activity.
 */
export function getRecentPuzzleLabel(puzzleId: string | undefined): string {
  if (!puzzleId) {
    return "Random Puzzle";
  }

  if (isCustomPuzzleId(puzzleId)) {
    const record = useCustomPuzzleStore.getState().getPuzzle(puzzleId);

    return record?.puzzle.title ?? "Community Puzzle";
  }

  if (isDailyPuzzleId(puzzleId)) {
    return "Daily Challenge";
  }

  try {
    return getPuzzleById(resolveCatalogPuzzleId(puzzleId)).title;
  } catch {
    return "Puzzle";
  }
}
