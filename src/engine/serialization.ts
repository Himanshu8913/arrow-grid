import type { GameState } from "@/engine/game-state";
import type {
  Board,
  PlayerId,
  Position,
  RotateMove,
  Tile,
} from "@/types/game";
import {
  MULTIPLAYER_WIRE_VERSION,
  type SerializedBoard,
  type SerializedGameState,
  type SerializedPosition,
  type SerializedRotateMove,
  type SerializedTile,
} from "@/types/multiplayer";

export function serializePosition(position: Position): SerializedPosition {
  return { row: position.row, col: position.col };
}

export function deserializePosition(position: SerializedPosition): Position {
  return { row: position.row, col: position.col };
}

export function serializeRotateMove(
  move: RotateMove,
  playerId: PlayerId,
  sequence: number,
): SerializedRotateMove {
  return {
    type: "rotate",
    position: serializePosition(move.position),
    playerId,
    sequence,
  };
}

export function deserializeRotateMove(move: SerializedRotateMove): RotateMove {
  return {
    type: "rotate",
    position: deserializePosition(move.position),
  };
}

function serializeTile(tile: Tile): SerializedTile {
  switch (tile.kind) {
    case "arrow":
      return { kind: "arrow", direction: tile.direction };
    case "wall":
      return { kind: "wall" };
    case "empty":
      return { kind: "empty" };
    case "goal":
      return { kind: "goal", owner: tile.owner };
    case "spawn":
      return { kind: "spawn" };
  }
}

function deserializeTile(tile: SerializedTile): Tile {
  switch (tile.kind) {
    case "arrow":
      return { kind: "arrow", direction: tile.direction ?? "up" };
    case "wall":
      return { kind: "wall" };
    case "empty":
      return { kind: "empty" };
    case "goal":
      return { kind: "goal", owner: tile.owner ?? "player1" };
    case "spawn":
      return { kind: "spawn" };
  }
}

/**
 * Serializes a board into a JSON-safe wire format.
 */
export function serializeBoard(board: Board): SerializedBoard {
  return {
    version: MULTIPLAYER_WIRE_VERSION,
    size: board.length,
    cells: board.map((row) => row.map(serializeTile)),
  };
}

/**
 * Restores a board from its serialized wire format.
 */
export function deserializeBoard(serialized: SerializedBoard): Board {
  return serialized.cells.map((row) => row.map(deserializeTile));
}

/**
 * Serializes full game state for network sync and replay headers.
 */
export function serializeGameState(state: GameState): SerializedGameState {
  return {
    version: MULTIPLAYER_WIRE_VERSION,
    seed: state.seed,
    board: serializeBoard(state.board),
    initialBoard: serializeBoard(state.initialBoard),
    spawn: serializePosition(state.spawn),
    goals: Object.fromEntries(
      Object.entries(state.goals).map(([playerId, position]) => [
        playerId,
        position ? serializePosition(position) : undefined,
      ]),
    ) as SerializedGameState["goals"],
    orbPosition: serializePosition(state.orbPosition),
    players: {
      player1: { ...state.players.player1 },
      player2: { ...state.players.player2 },
    },
    currentPlayer: state.currentPlayer,
    turnNumber: state.turnNumber,
    movesPlayed: state.movesPlayed,
    playerCount: state.playerCount,
    winningScore: state.winningScore,
    emptyTilesEnabled: state.emptyTilesEnabled,
    targetMoves: state.targetMoves,
    shortestPathLength: state.shortestPathLength,
    moveLimit: state.moveLimit,
    puzzleId: state.puzzleId,
    status: state.status,
    winner: state.winner,
  };
}

/**
 * Restores game state from serialized wire format.
 */
export function deserializeGameState(serialized: SerializedGameState): GameState {
  return {
    seed: serialized.seed,
    board: deserializeBoard(serialized.board),
    initialBoard: deserializeBoard(serialized.initialBoard),
    spawn: deserializePosition(serialized.spawn),
    goals: Object.fromEntries(
      Object.entries(serialized.goals).map(([playerId, position]) => [
        playerId,
        position ? deserializePosition(position) : undefined,
      ]),
    ) as GameState["goals"],
    orbPosition: deserializePosition(serialized.orbPosition),
    players: {
      player1: { ...serialized.players.player1 },
      player2: { ...serialized.players.player2 },
    },
    currentPlayer: serialized.currentPlayer,
    turnNumber: serialized.turnNumber,
    movesPlayed: serialized.movesPlayed,
    playerCount: serialized.playerCount,
    winningScore: serialized.winningScore,
    emptyTilesEnabled: serialized.emptyTilesEnabled,
    targetMoves: serialized.targetMoves,
    shortestPathLength: serialized.shortestPathLength,
    moveLimit: serialized.moveLimit,
    puzzleId: serialized.puzzleId,
    status: serialized.status,
    winner: serialized.winner,
  };
}

/**
 * Encodes a move list to a compact JSON string for storage.
 */
export function encodeMoves(moves: SerializedRotateMove[]): string {
  return JSON.stringify(moves);
}

/**
 * Decodes a move list from JSON.
 */
export function decodeMoves(payload: string): SerializedRotateMove[] {
  return JSON.parse(payload) as SerializedRotateMove[];
}
