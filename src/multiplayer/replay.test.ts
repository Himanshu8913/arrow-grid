import { describe, expect, it } from "vitest";

import { createNewGame, playTurn } from "@/engine";
import type { Board, Position } from "@/types/game";
import {
  deserializeBoard,
  deserializeGameState,
  serializeBoard,
  serializeGameState,
  serializeRotateMove,
} from "@/engine/serialization";
import { MatchSession } from "@/multiplayer/match-session";
import { createRotateCommand } from "@/multiplayer/input";
import {
  createMatchRecording,
  recordGameplayMove,
  replayToFinalState,
} from "@/multiplayer/replay";

function findArrowPosition(board: Board): Position | null {
  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board[row].length; col += 1) {
      if (board[row][col]?.kind === "arrow") {
        return { row, col };
      }
    }
  }

  return null;
}

describe("serialization", () => {
  it("round-trips board and game state", () => {
    const game = createNewGame({ seed: 12345, playerCount: 2 });
    const serialized = serializeGameState(game);
    const restored = deserializeGameState(serialized);

    expect(restored.seed).toBe(game.seed);
    expect(restored.board).toEqual(game.board);
    expect(restored.players).toEqual(game.players);
    expect(restored.currentPlayer).toBe(game.currentPlayer);
  });

  it("round-trips board tiles independently", () => {
    const game = createNewGame({ seed: 99, playerCount: 1 });
    const board = serializeBoard(game.board);
    const restored = deserializeBoard(board);

    expect(restored).toEqual(game.board);
  });
});

describe("replayMatch", () => {
  it("replays moves to the same final state as live play", () => {
    const initial = createNewGame({ seed: 4242, playerCount: 2 });
    let liveState = initial;
    let recording = createMatchRecording(initial, "pvp");

    for (let sequence = 1; sequence <= 4; sequence += 1) {
      if (liveState.status !== "in-progress") {
        break;
      }

      const position = findArrowPosition(liveState.board);
      if (!position) {
        break;
      }

      const move = { type: "rotate" as const, position };
      const actingPlayer = liveState.currentPlayer;
      const next = playTurn(liveState, move);

      if ("error" in next) {
        break;
      }

      liveState = next;
      recording = recordGameplayMove(
        recording,
        move,
        actingPlayer,
        sequence,
      );
    }

    const replayed = replayToFinalState(recording);

    expect(replayed.movesPlayed).toBe(liveState.movesPlayed);
    expect(replayed.players).toEqual(liveState.players);
    expect(replayed.status).toBe(liveState.status);
    expect(replayed.board).toEqual(liveState.board);
  });

  it("serializes moves with player metadata", () => {
    const serialized = serializeRotateMove(
      { type: "rotate", position: { row: 2, col: 3 } },
      "player1",
      4,
    );

    expect(serialized).toEqual({
      type: "rotate",
      position: { row: 2, col: 3 },
      playerId: "player1",
      sequence: 4,
    });
  });
});

describe("MatchSession", () => {
  it("applies abstract input commands deterministically", () => {
    const initial = createNewGame({ seed: 777, playerCount: 2 });
    const session = new MatchSession({ initialState: initial, gameMode: "pvp" });
    const position = findArrowPosition(initial.board);

    expect(position).not.toBeNull();

    const result = session.applyCommand(
      createRotateCommand(position!, "player1", "local", 1),
    );

    expect("error" in result).toBe(false);
    expect(session.getRecording().moves).toHaveLength(1);
  });
});
