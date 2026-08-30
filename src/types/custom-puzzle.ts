import type { PuzzleDefinition } from "@/types/puzzle";

export type CommunityPuzzleSort =
  | "newest"
  | "rating"
  | "plays"
  | "bookmarked";

export interface CustomPuzzleMeta {
  id: string;
  authorName: string;
  createdAt: number;
  updatedAt: number;
  playCount: number;
  ratingSum: number;
  ratingCount: number;
  bookmarked: boolean;
}

export interface CustomPuzzleRecord {
  meta: CustomPuzzleMeta;
  puzzle: PuzzleDefinition;
}

export interface CustomPuzzleDraft {
  title: string;
  description: string;
  size: number;
  spawn: { row: number; col: number } | null;
  goal: { row: number; col: number } | null;
  goal2: { row: number; col: number } | null;
  moveLimit: number;
  targetMoves: number;
  placements: PuzzleDefinition["placements"];
}
