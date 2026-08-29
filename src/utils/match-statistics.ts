import type { GameState } from "@/engine/game-state";
import { isPracticeMode, isPuzzleMode } from "@/utils/game-messages";

export interface MatchStatisticsInput {
  game: GameState;
  gameMode: string;
}

/**
 * Derives win/loss recording input from a finished match.
 */
export function getMatchStatisticsInput({
  game,
  gameMode,
}: MatchStatisticsInput) {
  if (game.status !== "won" && game.status !== "lost") {
    return null;
  }

  if (isPuzzleMode(gameMode)) {
    return {
      outcome: game.status === "won" ? ("win" as const) : ("loss" as const),
      movesPlayed: game.movesPlayed,
      score: game.players.player1.totalScore,
      gameMode,
    };
  }

  if (isPracticeMode(gameMode)) {
    const humanWon = game.status === "won" && game.winner === "player1";

    return {
      outcome: humanWon ? ("win" as const) : ("loss" as const),
      movesPlayed: game.movesPlayed,
      score: game.players.player1.totalScore,
      gameMode,
    };
  }

  return {
    kind: "pvp" as const,
    movesPlayed: game.movesPlayed,
  };
}
