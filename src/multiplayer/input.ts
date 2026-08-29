import { createNewGame } from "@/engine/game-controller";
import type { GameState } from "@/engine/game-state";
import type {
  DeterministicMatchConfig,
  GameInputCommand,
  MoveSource,
  MultiplayerTransport,
} from "@/types/multiplayer";
import type { PlayerId, Position } from "@/types/game";

export interface GameInputPort {
  dispatch: (command: GameInputCommand) => void;
}

export interface InputPortOptions {
  onCommand: (command: GameInputCommand) => void;
}

/**
 * Abstract input boundary between UI, AI, network, and replay sources.
 */
export function createInputPort(options: InputPortOptions): GameInputPort {
  return {
    dispatch: options.onCommand,
  };
}

/**
 * Builds a rotate command from any input source.
 */
export function createRotateCommand(
  position: Position,
  playerId: PlayerId,
  source: MoveSource,
  sequence: number,
): GameInputCommand {
  return {
    move: { type: "rotate", position },
    source,
    playerId,
    sequence,
  };
}

/**
 * Creates a match from an explicit seed for deterministic multiplayer sync.
 */
export function createDeterministicMatch(
  config: DeterministicMatchConfig,
): GameState {
  return createNewGame({
    seed: config.seed,
    playerCount: config.playerCount ?? 2,
    size: config.size,
    emptyTilesEnabled: config.emptyTilesEnabled,
    winningScore: config.winningScore,
  });
}

/**
 * No-op transport for local-only play and tests.
 */
export function createOfflineTransport(): MultiplayerTransport {
  const noop = () => undefined;

  return {
    connect: async () => undefined,
    disconnect: noop,
    sendMove: noop,
    onRemoteMove: () => noop,
    onStateSync: () => noop,
    onConnectionChange: () => noop,
  };
}
