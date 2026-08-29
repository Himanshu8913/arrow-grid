import { playTurn } from "@/engine/game-controller";
import { serializeGameState } from "@/engine/serialization";
import type { GameState } from "@/engine/game-state";
import type {
  GameInputCommand,
  MatchRecording,
  MultiplayerTransport,
} from "@/types/multiplayer";
import type { InvalidMoveReason, RotateMove } from "@/types/game";

import {
  createMatchRecording,
  recordGameplayMove,
} from "@/multiplayer/replay";

export interface MatchSessionOptions {
  initialState: GameState;
  gameMode: string;
  transport?: MultiplayerTransport;
}

export interface ApplyMoveResult {
  state: GameState;
  recording: MatchRecording;
}

/**
 * Deterministic match session that applies moves and records replay data.
 */
export class MatchSession {
  private state: GameState;
  private recording: MatchRecording;
  private sequence = 0;
  private readonly transport?: MultiplayerTransport;

  constructor(options: MatchSessionOptions) {
    this.state = options.initialState;
    this.recording = createMatchRecording(options.initialState, options.gameMode);
    this.transport = options.transport;
  }

  getState(): GameState {
    return this.state;
  }

  getRecording(): MatchRecording {
    return this.recording;
  }

  /**
   * Applies an abstracted input command from any source.
   */
  applyCommand(command: GameInputCommand): GameState | { error: InvalidMoveReason } {
    return this.applyMove(command.move, command.playerId, command.source);
  }

  /**
   * Applies a rotate move, records it, and optionally broadcasts over transport.
   */
  applyMove(
    move: RotateMove,
    playerId: GameInputCommand["playerId"],
    source: GameInputCommand["source"] = "local",
  ): GameState | { error: InvalidMoveReason } {
    if (source === "replay") {
      return this.state;
    }

    const next = playTurn(this.state, move);

    if ("error" in next) {
      return next;
    }

    this.sequence += 1;
    this.state = next;
    this.recording = recordGameplayMove(
      this.recording,
      move,
      playerId,
      this.sequence,
    );

    if (source === "local") {
      const serializedMove = this.recording.moves[this.recording.moves.length - 1];
      if (serializedMove) {
        this.transport?.sendMove(serializedMove);
      }
    }

    return this.state;
  }

  /**
   * Restores session state from a network snapshot.
   */
  syncState(state: GameState): void {
    this.state = state;
  }

  /**
   * Returns the current state as a wire payload.
   */
  toWireState() {
    return serializeGameState(this.state);
  }
}
