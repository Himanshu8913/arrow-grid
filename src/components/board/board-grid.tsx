import { BoardTile } from "@/components/board/board-tile";
import type { Board, Position } from "@/types/game";
import { cn } from "@/utils/cn";
import { positionsEqual } from "@/engine/position";

export interface BoardGridProps {
  board: Board;
  spawn: Position;
  selectedPosition?: Position | null;
  onTileClick?: (position: Position) => void;
  className?: string;
}

/**
 * Responsive square grid that renders the full game board.
 */
export function BoardGrid({
  board,
  spawn,
  selectedPosition = null,
  onTileClick,
  className,
}: BoardGridProps) {
  const size = board.length;

  return (
    <div
      className={cn("mx-auto w-full max-w-md", className)}
      style={{
        display: "grid",
        gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
        gap: "8px",
      }}
    >
      {board.map((row, rowIndex) =>
        row.map((tile, colIndex) => {
          const position = { row: rowIndex, col: colIndex };

          return (
            <BoardTile
              key={`${rowIndex}-${colIndex}`}
              tile={tile}
              position={position}
              isSpawn={positionsEqual(position, spawn)}
              isSelected={
                selectedPosition
                  ? positionsEqual(position, selectedPosition)
                  : false
              }
              onClick={onTileClick}
            />
          );
        }),
      )}
    </div>
  );
}
