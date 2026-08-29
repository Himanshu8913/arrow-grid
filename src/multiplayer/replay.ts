import { playTurn } from "@/engine/game-controller";
import {
  deserializeGameState,
  deserializeRotateMove,
  serializeGameState,
  serializeRotateMove,
} from "@/engine/serialization";
import type { GameState } from "@/engine/game-state";
import type {
  MatchRecording,
  ReplayResult,
  ReplayStep,
} from "@/types/multiplayer";
import { MULTIPLAYER_WIRE_VERSION } from "@/types/multiplayer";
import type { PlayerId, RotateMove } from "@/types/game";

/**
 * Creates an empty recording for a new deterministic match.
 */
export function createMatchRecording(
  initialState: GameState,
  gameMode: string,
): MatchRecording {
  return {
    version: MULTIPLAYER_WIRE_VERSION,
    seed: initialState.seed,
    gameMode,
    initialState: serializeGameState(initialState),
    moves: [],
  };
}

/**
 * Appends a move to a recording without mutating the original.
 */
export function appendRecordedMove(
  recording: MatchRecording,
  move: ReturnType<typeof serializeRotateMove>,
): MatchRecording {
  return {
    ...recording,
    moves: [...recording.moves, move],
  };
}

/**
 * Records a rotate move with sequence metadata.
 */
export function recordGameplayMove(
  recording: MatchRecording,
  move: RotateMove,
  playerId: PlayerId,
  sequence: number,
): MatchRecording {
  return appendRecordedMove(
    recording,
    serializeRotateMove(move, playerId, sequence),
  );
}

/**
 * Replays a recording through the engine and returns each resulting state.
 */
export function replayMatch(recording: MatchRecording): ReplayResult {
  let state = deserializeGameState(recording.initialState);
  const steps: ReplayStep[] = [];

  for (const move of recording.moves) {
    const rotateMove = deserializeRotateMove(move);
    const next = playTurn(state, rotateMove);

    if ("error" in next) {
      break;
    }

    state = next;
    steps.push({
      sequence: move.sequence,
      move,
      stateAfter: serializeGameState(state),
    });
  }

  return {
    recording,
    steps,
    finalState: serializeGameState(state),
  };
}

/**
 * Replays moves and returns only the final engine state.
 */
export function replayToFinalState(recording: MatchRecording): GameState {
  return deserializeGameState(replayMatch(recording).finalState);
}
