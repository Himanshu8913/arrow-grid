import type { DIRECTION_ROTATION_ORDER } from "@/constants/game";

export type Direction = (typeof DIRECTION_ROTATION_ORDER)[number];

export type PlayerId = "player1" | "player2";

export type TileKind = "empty" | "arrow" | "wall" | "goal" | "spawn";

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

export type Tile =
  | ArrowTile
  | WallTile
  | EmptyTile
  | SpawnTile
  | GoalTile;

/** Row-major 2D board. Each cell holds exactly one tile object. */
export type Board = Tile[][];

export interface OrbState {
  position: Position;
}

export interface BoardConfig {
  size: number;
  emptyTilesEnabled: boolean;
}
