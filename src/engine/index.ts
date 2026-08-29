export { generateBoard } from "@/engine/board-generator";
export { cloneBoard } from "@/engine/board-utils";
export {
  createEmptyBoard,
  createRandomArrow,
  getAvailablePositions,
  getTile,
  setTile,
} from "@/engine/board";
export { rotateDirectionClockwise, getDirectionDelta } from "@/engine/direction";
export {
  getLegalRotatePositions,
  rotateArrowAt,
  tryRotateArrow,
  validateRotateMove,
} from "@/engine/rotation";
export { executePlayerTurn, type ExecuteTurnResult } from "@/engine/turn";
export {
  createGameState,
  isLoopLoss,
  isMatchOver,
  resetBoard,
  resolvePlayerTurn,
  type CreateGameStateOptions,
  type GameState,
} from "@/engine/game-state";
export {
  createNewGame,
  playTurn,
  restartMatch,
  startNewRound,
  type NewGameOptions,
} from "@/engine/game-controller";
export {
  evaluateTurnOutcome,
  didReachGoal,
  getOrbEndPosition,
} from "@/engine/outcome";
export {
  applyScoringTurn,
  calculateGoalScore,
  calculateTurnScore,
  checkMatchOutcome,
  createInitialPlayerScores,
  getOpponent,
} from "@/engine/scoring";
export {
  isInstantWinBoard,
  simulateOrbMovement,
  type MovementStopReason,
  type OrbSimulationResult,
} from "@/engine/orb-movement";
export {
  applyPuzzleMoveLimit,
  buildPuzzleBoard,
  calculatePuzzleStars,
  cloneGameState,
  createGameFromPuzzle,
} from "@/engine/puzzle";
export {
  createRandomPuzzleGame,
  createPuzzleGameForSelection,
  getRandomPuzzleSeed,
  isRandomPuzzleId,
  RANDOM_PUZZLE_ID,
} from "@/engine/random-puzzle";
export { createDailyChallengeGame, getDailyDateKey, getDailySeed, DAILY_TARGET_MOVES } from "@/engine/daily-challenge";
export { chooseAiMove, type ChooseAiMoveOptions } from "@/engine/ai";
export { createRandomSeed, SeededRandom } from "@/engine/random";
export {
  decodeMoves,
  deserializeBoard,
  deserializeGameState,
  deserializePosition,
  deserializeRotateMove,
  encodeMoves,
  serializeBoard,
  serializeGameState,
  serializePosition,
  serializeRotateMove,
} from "@/engine/serialization";
