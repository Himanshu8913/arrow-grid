/** Points awarded for reaching a goal. */
export const GOAL_BASE_SCORE = 100;

/** Bonus when the orb path contains no loop. */
export const NO_LOOP_BONUS = 20;

/** Bonus when the orb takes the shortest known path. */
export const SHORTEST_PATH_BONUS = 50;

/** Bonus for a perfect turn (goal + no invalid moves + within target moves). */
export const PERFECT_BONUS = 100;

/** Multiplier applied to `(targetMoves - actualMoves)`. */
export const EFFICIENCY_BONUS_PER_MOVE = 10;

/** Default match points required to win multiplayer (5-match / first to 3). */
export const DEFAULT_WINNING_MATCH_POINTS = 3;
