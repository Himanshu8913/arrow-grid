import type { Direction, PlayerId, RotateMove } from "@/types/game";

/** Wire format version for multiplayer payloads. */
export const MULTIPLAYER_WIRE_VERSION = 5;

export type MoveSource = "local" | "remote" | "ai" | "replay";

export interface GameInputCommand {
  move: RotateMove;
  source: MoveSource;
  playerId: PlayerId;
  sequence: number;
}

export interface SerializedPosition {
  row: number;
  col: number;
}

export interface SerializedRotateMove {
  type: "rotate";
  position: SerializedPosition;
  playerId: PlayerId;
  sequence: number;
}

export interface SerializedTile {
  kind:
    | "arrow"
    | "wall"
    | "empty"
    | "goal"
    | "spawn"
    | "teleporter"
    | "ice"
    | "rotating-arrow"
    | "bomb"
    | "locked-arrow"
    | "key"
    | "wind"
    | "magnet"
    | "splitter";
  direction?: Direction;
  owner?: PlayerId;
  portalId?: string;
  target?: SerializedPosition;
}

export interface SerializedOrbState {
  id: string;
  position: SerializedPosition;
}

export interface SerializedBoard {
  version: typeof MULTIPLAYER_WIRE_VERSION;
  size: number;
  cells: SerializedTile[][];
}

export interface SerializedPlayerScores {
  player1: { matchPoints: number; totalScore: number };
  player2: { matchPoints: number; totalScore: number };
}

export interface SerializedGameState {
  version: typeof MULTIPLAYER_WIRE_VERSION;
  seed: number;
  board: SerializedBoard;
  initialBoard: SerializedBoard;
  spawn: SerializedPosition;
  goals: Partial<Record<PlayerId, SerializedPosition>>;
  orbPosition: SerializedPosition;
  orbs?: SerializedOrbState[];
  players: SerializedPlayerScores;
  currentPlayer: PlayerId;
  turnNumber: number;
  movesPlayed: number;
  playerCount: 1 | 2;
  winningScore: number;
  emptyTilesEnabled: boolean;
  targetMoves?: number;
  shortestPathLength?: number;
  moveLimit?: number;
  puzzleId?: string;
  status: "in-progress" | "won" | "draw" | "lost";
  winner?: PlayerId;
}

export interface MatchRecording {
  version: typeof MULTIPLAYER_WIRE_VERSION;
  seed: number;
  gameMode: string;
  initialState: SerializedGameState;
  moves: SerializedRotateMove[];
}

export interface DeterministicMatchConfig {
  seed: number;
  playerCount?: 1 | 2;
  size?: number;
  emptyTilesEnabled?: boolean;
  winningScore?: number;
}

export interface MultiplayerSessionConfig {
  matchId: string;
  seed: number;
  localPlayerId: PlayerId;
}

export interface MultiplayerTransport {
  connect: (config: MultiplayerSessionConfig) => Promise<void>;
  disconnect: () => void;
  sendMove: (move: SerializedRotateMove) => void;
  onRemoteMove: (listener: (move: SerializedRotateMove) => void) => () => void;
  onStateSync: (listener: (state: SerializedGameState) => void) => () => void;
  onConnectionChange: (
    listener: (connected: boolean) => void,
  ) => () => void;
}

export interface MatchSyncClient {
  submitLocalMove: (move: RotateMove) => Promise<void>;
  subscribeRemoteMoves: (
    listener: (move: RotateMove, playerId: PlayerId) => void,
  ) => () => void;
}

export interface ReplayStep {
  sequence: number;
  move: SerializedRotateMove;
  stateAfter: SerializedGameState;
}

export interface ReplayResult {
  recording: MatchRecording;
  steps: ReplayStep[];
  finalState: SerializedGameState;
}
