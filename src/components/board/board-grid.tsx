import { BoardTile } from "@/components/board/board-tile";
import type { Board, Position } from "@/types/game";
import { cn } from "@/utils/cn";
import { positionsEqual } from "@/engine/position";

export interface BoardGridProps {
  board: Board;
  spawn: Position;
  orbPosition?: Position;
  pathPositions?: Position[];
  selectedPosition?: Position | null;
  disabled?: boolean;
  onTileClick?: (position: Position) => void;
  className?: string;
}

/**
 * Responsive square grid that renders the full game board.
 */
export function BoardGrid({
  board,
  spawn,
  orbPosition,
  pathPositions = [],
  selectedPosition = null,
  disabled = false,
  onTileClick,
  className,
}: BoardGridProps) {
  const size = board.length;
  const pathKeys = new Set(
    pathPositions.map((position) => `${position.row},${position.col}`),
  );

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
          const positionKey = `${rowIndex}-${colIndex}`;

          return (
            <BoardTile
              key={positionKey}
              tile={tile}
              position={position}
              isSpawn={positionsEqual(position, spawn)}
              isOrb={orbPosition ? positionsEqual(position, orbPosition) : false}
              isOnPath={pathKeys.has(`${rowIndex},${colIndex}`)}
              isSelected={
                selectedPosition
                  ? positionsEqual(position, selectedPosition)
                  : false
              }
              disabled={disabled}
              onClick={onTileClick}
            />
          );
        }),
      )}
    </div>
  );
}
