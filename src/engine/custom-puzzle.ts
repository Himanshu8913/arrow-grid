import { createEmptyBoard } from "@/engine/board";
import { validateTeleporterTargets } from "@/engine/teleporter";
import type { Board, Direction, Position, Tile } from "@/types/game";
import type { CustomPuzzleDraft, CustomPuzzleRecord } from "@/types/custom-puzzle";
import type { PuzzleDefinition, PuzzleTilePlacement } from "@/types/puzzle";

export const CUSTOM_PUZZLE_ID_PREFIX = "custom-";
export const PUZZLE_SHARE_CODE_PREFIX = "agpuz1:";

export type EditorTool =
  | "wall"
  | "empty"
  | "arrow"
  | "goal"
  | "goal2"
  | "spawn"
  | "ice"
  | "splitter"
  | "bomb"
  | "key"
  | "locked-arrow"
  | "rotating-arrow"
  | "wind"
  | "magnet";

export function isCustomPuzzleId(puzzleId: string | undefined): boolean {
  return puzzleId?.startsWith(CUSTOM_PUZZLE_ID_PREFIX) === true;
}

export function createCustomPuzzleId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `${CUSTOM_PUZZLE_ID_PREFIX}${crypto.randomUUID()}`;
  }

  return `${CUSTOM_PUZZLE_ID_PREFIX}${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function getAverageRating(record: CustomPuzzleRecord): number {
  if (record.meta.ratingCount === 0) {
    return 0;
  }

  return record.meta.ratingSum / record.meta.ratingCount;
}

export function createEmptyEditorBoard(size: number): Board {
  return createEmptyBoard(size, { kind: "wall" });
}

export function placementsToBoard(
  size: number,
  placements: PuzzleTilePlacement[] = [],
): Board {
  const board = createEmptyEditorBoard(size);

  for (const placement of placements) {
    board[placement.row][placement.col] = placement.tile;
  }

  return board;
}

export function boardToPlacements(board: Board): PuzzleTilePlacement[] {
  const placements: PuzzleTilePlacement[] = [];

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board.length; col += 1) {
      const tile = board[row][col];

      if (tile.kind !== "wall") {
        placements.push({ row, col, tile: structuredClone(tile) });
      }
    }
  }

  return placements;
}

export function applyEditorTool(
  board: Board,
  position: Position,
  tool: EditorTool,
  arrowDirection: Direction,
): Board {
  const nextBoard = board.map((row) => row.map((tile) => ({ ...tile }))) as Board;
  let tile: Tile;

  switch (tool) {
    case "wall":
      tile = { kind: "wall" };
      break;
    case "empty":
      tile = { kind: "empty" };
      break;
    case "arrow":
      tile = { kind: "arrow", direction: arrowDirection };
      break;
    case "goal":
      tile = { kind: "goal", owner: "player1" };
      break;
    case "goal2":
      tile = { kind: "goal", owner: "player2" };
      break;
    case "ice":
      tile = { kind: "ice" };
      break;
    case "splitter":
      tile = { kind: "splitter" };
      break;
    case "bomb":
      tile = { kind: "bomb" };
      break;
    case "key":
      tile = { kind: "key" };
      break;
    case "locked-arrow":
      tile = { kind: "locked-arrow", direction: arrowDirection };
      break;
    case "rotating-arrow":
      tile = { kind: "rotating-arrow", direction: arrowDirection };
      break;
    case "wind":
      tile = { kind: "wind" };
      break;
    case "magnet":
      tile = { kind: "magnet" };
      break;
    case "spawn":
      return nextBoard;
  }

  nextBoard[position.row][position.col] = tile;
  return nextBoard;
}

export function validateCustomPuzzleDraft(
  draft: CustomPuzzleDraft,
): string[] {
  const errors: string[] = [];

  if (!draft.title.trim()) {
    errors.push("Add a puzzle title.");
  }

  if (!draft.spawn) {
    errors.push("Set a spawn point.");
  }

  if (!draft.goal) {
    errors.push("Set at least one player 1 goal.");
  }

  if (!draft.placements?.length) {
    errors.push("Place at least one tile on the board.");
  }

  if (draft.moveLimit < 1) {
    errors.push("Move limit must be at least 1.");
  }

  if (draft.targetMoves < 1) {
    errors.push("Target moves must be at least 1.");
  }

  if (draft.placements) {
    try {
      const board = placementsToBoard(draft.size, draft.placements);
      validateTeleporterTargets(board);
    } catch (error) {
      errors.push(
        error instanceof Error ? error.message : "Invalid teleporter configuration.",
      );
    }
  }

  return errors;
}

export function draftToPuzzleDefinition(
  draft: CustomPuzzleDraft,
  puzzleId: string,
): PuzzleDefinition {
  return {
    id: puzzleId,
    title: draft.title.trim(),
    description: draft.description.trim() || "A community puzzle.",
    size: draft.size,
    spawn: draft.spawn ?? undefined,
    goal: draft.goal ?? undefined,
    goal2: draft.goal2 ?? undefined,
    placements: draft.placements,
    moveLimit: draft.moveLimit,
    targetMoves: draft.targetMoves,
    shortestPathLength: draft.targetMoves + 2,
  };
}

export function puzzleDefinitionToDraft(
  puzzle: PuzzleDefinition,
): CustomPuzzleDraft {
  return {
    title: puzzle.title,
    description: puzzle.description,
    size: puzzle.size ?? 5,
    spawn: puzzle.spawn ?? null,
    goal: puzzle.goal ?? null,
    goal2: puzzle.goal2 ?? null,
    moveLimit: puzzle.moveLimit ?? 10,
    targetMoves: puzzle.targetMoves ?? 3,
    placements: puzzle.placements ?? [],
  };
}

export function encodePuzzleShareCode(puzzle: PuzzleDefinition): string {
  const payload = JSON.stringify(puzzle);
  const encoded = btoa(unescape(encodeURIComponent(payload)));

  return `${PUZZLE_SHARE_CODE_PREFIX}${encoded}`;
}

export function decodePuzzleShareCode(code: string): PuzzleDefinition {
  const trimmed = code.trim();
  const payload = trimmed.startsWith(PUZZLE_SHARE_CODE_PREFIX)
    ? trimmed.slice(PUZZLE_SHARE_CODE_PREFIX.length)
    : trimmed;

  const json = decodeURIComponent(escape(atob(payload)));
  const puzzle = JSON.parse(json) as PuzzleDefinition;

  if (!puzzle.title || !puzzle.size || !puzzle.placements) {
    throw new Error("Invalid puzzle share code.");
  }

  return puzzle;
}

export function syncGoalMarkersFromBoard(
  draft: CustomPuzzleDraft,
  board: Board,
): CustomPuzzleDraft {
  let goal = draft.goal;
  let goal2 = draft.goal2;

  for (let row = 0; row < board.length; row += 1) {
    for (let col = 0; col < board.length; col += 1) {
      const tile = board[row][col];

      if (tile.kind === "goal" && tile.owner === "player1") {
        goal = { row, col };
      }

      if (tile.kind === "goal" && tile.owner === "player2") {
        goal2 = { row, col };
      }
    }
  }

  return {
    ...draft,
    goal,
    goal2,
    placements: boardToPlacements(board),
  };
}
