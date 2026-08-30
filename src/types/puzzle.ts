import type { Position, Tile } from "@/types/game";

export interface PuzzleTilePlacement {
  row: number;
  col: number;
  tile: Tile;
}

export interface PuzzleDefinition {
  id: string;
  title: string;
  description: string;
  /** When true, layouts are generated procedurally at play time. */
  procedural?: boolean;
  size?: number;
  spawn?: Position;
  goal?: Position;
  targetMoves?: number;
  moveLimit?: number;
  shortestPathLength?: number;
  placements?: PuzzleTilePlacement[];
}

export type PuzzleStarRating = 1 | 2 | 3;
