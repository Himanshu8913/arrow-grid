import type {
  MultiplayerSessionConfig,
  MultiplayerTransport,
} from "@/types/multiplayer";
import type { PlayerId } from "@/types/game";

import { deserializeRotateMove } from "@/engine/serialization";

export interface NetworkClientOptions {
  transport: MultiplayerTransport;
  localPlayerId: PlayerId;
}

/**
 * Thin client wrapper over a multiplayer transport.
 * Real networking can be plugged in behind the transport interface.
 */
export function createMatchSyncClient(
  options: NetworkClientOptions,
): import("@/types/multiplayer").MatchSyncClient {
  const { transport, localPlayerId } = options;

  return {
    submitLocalMove: async (move) => {
      transport.sendMove({
        type: "rotate",
        position: move.position,
        playerId: localPlayerId,
        sequence: Date.now(),
      });
    },
    subscribeRemoteMoves: (listener) =>
      transport.onRemoteMove((serializedMove) => {
        listener(deserializeRotateMove(serializedMove), serializedMove.playerId);
      }),
  };
}

/**
 * Connects a transport with session configuration.
 */
export async function connectTransport(
  transport: MultiplayerTransport,
  config: MultiplayerSessionConfig,
): Promise<void> {
  await transport.connect(config);
}
