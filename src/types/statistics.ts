export interface PlayerStatistics {
  gamesPlayed: number;
  wins: number;
  losses: number;
  puzzlesCompleted: number;
  dailyChallengesPlayed: number;
  dailyChallengesWon: number;
  bestDailyMoves: number | null;
  totalMoves: number;
  bestScore: number;
  fastestWinMoves: number | null;
  currentStreak: number;
  bestStreak: number;
}

export interface RecordMatchEndInput {
  outcome: "win" | "loss";
  movesPlayed: number;
  score: number;
  gameMode: string;
}

export function createInitialStatistics(): PlayerStatistics {
  return {
    gamesPlayed: 0,
    wins: 0,
    losses: 0,
    puzzlesCompleted: 0,
    dailyChallengesPlayed: 0,
    dailyChallengesWon: 0,
    bestDailyMoves: null,
    totalMoves: 0,
    bestScore: 0,
    fastestWinMoves: null,
    currentStreak: 0,
    bestStreak: 0,
  };
}

/**
 * Returns the rolling average moves per recorded game.
 */
export function getAverageMoves(stats: PlayerStatistics): number {
  if (stats.gamesPlayed === 0) {
    return 0;
  }

  return Math.round(stats.totalMoves / stats.gamesPlayed);
}
