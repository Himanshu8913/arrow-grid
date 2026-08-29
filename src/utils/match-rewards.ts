import {
  COINS_LOSS,
  COINS_WIN,
  MAX_MATCH_XP,
  MIN_MATCH_XP,
  XP_SCORE_DIVISOR,
} from "@/constants/rewards";
import type { GameState } from "@/engine/game-state";
import type { PuzzleStarRating } from "@/types/puzzle";
import {
  isPracticeMode,
  isPuzzleMode,
} from "@/utils/game-messages";

export interface MatchRewards {
  xp: number;
  coins: number;
  isWin: boolean;
  score: number;
}

/**
 * Calculates XP and coin rewards from a finished match.
 */
export function calculateMatchRewards(
  game: GameState,
  gameMode: string,
): MatchRewards {
  const isWin = isMatchWin(game, gameMode);
  const score = getResultScore(game, gameMode);
  const xp = Math.min(
    MAX_MATCH_XP,
    Math.max(MIN_MATCH_XP, Math.floor(score / XP_SCORE_DIVISOR)),
  );

  return {
    xp,
    coins: isWin ? COINS_WIN : COINS_LOSS,
    isWin,
    score,
  };
}

function isMatchWin(game: GameState, gameMode: string): boolean {
  if (game.status !== "won") {
    return false;
  }

  if (isPuzzleMode(gameMode)) {
    return true;
  }

  if (isPracticeMode(gameMode)) {
    return game.winner === "player1";
  }

  return true;
}

function getResultScore(game: GameState, gameMode: string): number {
  if (isPuzzleMode(gameMode) || isPracticeMode(gameMode)) {
    return game.players.player1.totalScore;
  }

  if (game.winner) {
    return game.players[game.winner].totalScore;
  }

  return Math.max(
    game.players.player1.totalScore,
    game.players.player2.totalScore,
  );
}

/**
 * Formats elapsed seconds as m:ss.
 */
export function formatMatchDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

/**
 * Builds a headline for the result screen.
 */
export function getResultHeadline(
  game: GameState,
  gameMode: string,
  stars: PuzzleStarRating | null,
): string {
  if (isPuzzleMode(gameMode)) {
    if (game.status === "won") {
      return stars === 3 ? "Perfect puzzle!" : "Puzzle complete!";
    }

    return "Out of moves";
  }

  if (game.status === "won" && game.winner) {
    if (isPracticeMode(gameMode) && game.winner === "player2") {
      return "AI wins the match";
    }

    return `${game.winner === "player1" ? "Player 1" : "Player 2"} wins!`;
  }

  return "Match over";
}
