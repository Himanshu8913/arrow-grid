import { useCallback, useMemo } from "react";

import { BoardTile } from "@/components/board/board-tile";
import { BOARD_TILE_GAP_PX } from "@/constants/animation";
import {
  applyEditorTool,
  boardToPlacements,
  createEmptyEditorBoard,
  placementsToBoard,
  syncGoalMarkersFromBoard,
  type EditorTool,
} from "@/engine/custom-puzzle";
import type { Board, Direction, Position } from "@/types/game";
import type { CustomPuzzleDraft } from "@/types/custom-puzzle";
import { getTileAriaLabel } from "@/utils/board-a11y";

export interface PuzzleEditorBoardProps {
  draft: CustomPuzzleDraft;
  selectedTool: EditorTool;
  arrowDirection: Direction;
  onDraftChange: (draft: CustomPuzzleDraft) => void;
}

export function PuzzleEditorBoard({
  draft,
  selectedTool,
  arrowDirection,
  onDraftChange,
}: PuzzleEditorBoardProps) {
  const board = useMemo(
    () => placementsToBoard(draft.size, draft.placements),
    [draft.placements, draft.size],
  );

  const handleCellClick = useCallback(
    (position: Position) => {
      if (selectedTool === "spawn") {
        onDraftChange({
          ...draft,
          spawn: position,
        });
        return;
      }

      const nextBoard = applyEditorTool(
        board,
        position,
        selectedTool,
        arrowDirection,
      );
      const nextDraft = syncGoalMarkersFromBoard(
        {
          ...draft,
          placements: boardToPlacements(nextBoard),
        },
        nextBoard,
      );

      onDraftChange(nextDraft);
    },
    [arrowDirection, board, draft, onDraftChange, selectedTool],
  );

  return (
    <div
      className="mx-auto w-full max-w-md"
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${draft.size}, minmax(0, 1fr))`,
        gap: `${BOARD_TILE_GAP_PX}px`,
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          const position = { row: rowIndex, col: colIndex };
          const isSpawn =
            draft.spawn?.row === position.row &&
            draft.spawn?.col === position.col;

          return (
            <BoardTile
              key={`${rowIndex}-${colIndex}`}
              tile={tile}
              position={position}
              boardSize={draft.size}
              ariaLabel={getTileAriaLabel(tile, position, { isSpawn })}
              isSpawn={isSpawn}
              onClick={handleCellClick}
            />
          );
        }),
      )}
    </div>
  );
}

export function resizeEditorBoard(board: Board, nextSize: number): Board {
  const resized = createEmptyEditorBoard(nextSize);

  for (let row = 0; row < Math.min(board.length, nextSize); row += 1) {
    for (let col = 0; col < Math.min(board.length, nextSize); col += 1) {
      resized[row][col] = structuredClone(board[row][col]);
    }
  }

  return resized;
}
