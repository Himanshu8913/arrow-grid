import type { DIRECTION_ROTATION_ORDER } from "@/constants/game";

export type Direction = (typeof DIRECTION_ROTATION_ORDER)[number];

export type PlayerId = "player1" | "player2";

export type TileKind =
  | "empty"
  | "arrow"
  | "wall"
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

export interface Position {
  row: number;
  col: number;
}

export interface ArrowTile {
  kind: "arrow";
  direction: Direction;
}

export interface WallTile {
  kind: "wall";
}

export interface EmptyTile {
  kind: "empty";
}

export interface SpawnTile {
  kind: "spawn";
}

export interface GoalTile {
  kind: "goal";
  owner: PlayerId;
}

export interface TeleporterTile {
  kind: "teleporter";
  /** Visual grouping for paired portal styling. */
  portalId: string;
  /** Position the orb jumps to when entering this portal. */
  target: Position;
}

export interface IceTile {
  kind: "ice";
  /** Optional decoy arrow; ignored while the orb is sliding on ice. */
  direction?: Direction;
}

export interface RotatingArrowTile {
  kind: "rotating-arrow";
  direction: Direction;
}

export interface BombTile {
  kind: "bomb";
}

export interface LockedArrowTile {
  kind: "locked-arrow";
  direction: Direction;
}

export interface KeyTile {
  kind: "key";
}

export interface WindTile {
  kind: "wind";
}

export interface MagnetTile {
  kind: "magnet";
}

export interface SplitterTile {
  kind: "splitter";
}

export type Tile =
  | ArrowTile
  | WallTile
  | EmptyTile
  | SpawnTile
  | GoalTile
  | TeleporterTile
  | IceTile
  | RotatingArrowTile
  | BombTile
  | LockedArrowTile
  | KeyTile
  | WindTile
  | MagnetTile
  | SplitterTile;

/** Row-major 2D board. Each cell holds exactly one tile object. */
export type Board = Tile[][];

export interface OrbState {
  id: string;
  position: Position;
}

export interface BoardConfig {
  size: number;
  emptyTilesEnabled: boolean;
}

/** Fully generated board state used by the engine. */
export interface GeneratedBoard {
  board: Board;
  size: number;
  spawn: Position;
  goals: Partial<Record<PlayerId, Position>>;
  seed: number;
}

export interface GenerateBoardOptions {
  size?: number;
  seed?: number;
  playerCount?: 1 | 2;
  emptyTilesEnabled?: boolean;
  maxAttempts?: number;
}

/** A player action that rotates one arrow clockwise. */
export interface RotateMove {
  type: "rotate";
  position: Position;
}

export type InvalidMoveReason =
  | "out-of-bounds"
  | "not-arrow"
  | "wall"
  | "goal"
  | "spawn"
  | "empty"
  | "game-over";

export type MoveValidationResult =
  | { valid: true }
  | { valid: false; reason: InvalidMoveReason };
