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
export { createRandomSeed, SeededRandom } from "@/engine/random";
export { chooseAiMove, type ChooseAiMoveOptions } from "@/engine/ai";
