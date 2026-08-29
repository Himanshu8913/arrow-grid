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
  size: number;
  spawn: Position;
  goal: Position;
  targetMoves: number;
  moveLimit: number;
  shortestPathLength: number;
  placements: PuzzleTilePlacement[];
}

export type PuzzleStarRating = 1 | 2 | 3;
