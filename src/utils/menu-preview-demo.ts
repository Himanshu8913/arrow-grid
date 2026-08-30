import { getPuzzleById } from "@/data/puzzles";
import { cloneBoard } from "@/engine/board-utils";
import { createGameFromPuzzle } from "@/engine/puzzle";
import type { Direction, Position } from "@/types/game";

export interface PreviewRotation {
  position: Position;
  direction: Direction;
}

export interface MenuPreviewDemo {
  puzzleId: string;
  title: string;
  caption: string;
  rotations: PreviewRotation[];
  orbPath: Position[];
  /** Path index where each rotation happens before the next travel segment. */
  travelSegments: number[];
}

export const CORNER_ROUTE_PREVIEW_DEMO: MenuPreviewDemo = {
  puzzleId: "corner-route",
  title: "Corner Route",
  caption: "Two rotations · route through the corner · score the goal",
  rotations: [
    { position: { row: 2, col: 2 }, direction: "right" },
    { position: { row: 3, col: 3 }, direction: "down" },
  ],
  orbPath: [
    { row: 0, col: 0 },
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 1, col: 2 },
    { row: 2, col: 2 },
    { row: 2, col: 3 },
    { row: 3, col: 3 },
    { row: 4, col: 3 },
    { row: 4, col: 4 },
  ],
  travelSegments: [0, 7],
};

export function createPreviewBaseGame(demo: MenuPreviewDemo) {
  return createGameFromPuzzle(getPuzzleById(demo.puzzleId));
}

export function buildPreviewBoard(
  sourceBoard: ReturnType<typeof createGameFromPuzzle>["board"],
  appliedRotations: PreviewRotation[],
) {
  const board = cloneBoard(sourceBoard);

  for (const rotation of appliedRotations) {
    const tile = board[rotation.position.row]?.[rotation.position.col];

    if (tile?.kind === "arrow") {
      board[rotation.position.row][rotation.position.col] = {
        kind: "arrow",
        direction: rotation.direction,
      };
    }
  }

  return board;
}
