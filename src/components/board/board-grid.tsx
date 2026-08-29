import { BoardTile } from "@/components/board/board-tile";
import { OrbLayer } from "@/components/board/orb-layer";
import { BOARD_TILE_GAP_PX } from "@/constants/animation";
import type { Board, Position } from "@/types/game";
import { cn } from "@/utils/cn";
import { positionsEqual } from "@/engine/position";

export interface BoardGridProps {
  board: Board;
  spawn: Position;
  orbPosition?: Position;
  pathPositions?: Position[];
  trailPositions?: Position[];
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
  trailPositions = [],
  selectedPosition = null,
  disabled = false,
  onTileClick,
  className,
}: BoardGridProps) {
  const size = board.length;
  const pathKeys = new Set(
    pathPositions.map((position) => `${position.row},${position.col}`),
  );
  const trailOpacityByKey = new Map<string, number>();

  trailPositions.forEach((position, index) => {
    const intensity =
      trailPositions.length <= 1
        ? 1
        : index / (trailPositions.length - 1);
    trailOpacityByKey.set(`${position.row},${position.col}`, intensity);
  });

  return (
    <div className={cn("relative mx-auto w-full max-w-md", className)}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          gap: `${BOARD_TILE_GAP_PX}px`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => {
            const position = { row: rowIndex, col: colIndex };
            const positionKey = `${rowIndex}-${colIndex}`;
            const trailKey = `${rowIndex},${colIndex}`;
            const trailOpacity = trailOpacityByKey.get(trailKey);

            return (
              <BoardTile
                key={positionKey}
                tile={tile}
                position={position}
                isSpawn={positionsEqual(position, spawn)}
                isOnPath={pathKeys.has(trailKey)}
                trailOpacity={trailOpacity}
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

      {orbPosition ? (
        <OrbLayer position={orbPosition} gridSize={size} />
      ) : null}
    </div>
  );
}
