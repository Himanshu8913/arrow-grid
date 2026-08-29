import { BoardTile } from "@/components/board/board-tile";
import { GoalCelebration } from "@/components/board/goal-celebration";
import { OrbLayer } from "@/components/board/orb-layer";
import { BOARD_TILE_GAP_PX } from "@/constants/animation";
import type { Board, PlayerId, Position } from "@/types/game";
import { cn } from "@/utils/cn";
import { positionsEqual } from "@/engine/position";

export interface GoalCelebrationState {
  position: Position;
  score: number;
  owner: PlayerId;
}

export interface BoardGridProps {
  board: Board;
  spawn: Position;
  orbPosition?: Position;
  pathPositions?: Position[];
  trailPositions?: Position[];
  selectedPosition?: Position | null;
  goalCelebration?: GoalCelebrationState | null;
  isBoardCelebrating?: boolean;
  isOrbSpawning?: boolean;
  orbSpawnKey?: number;
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
  goalCelebration = null,
  isBoardCelebrating = false,
  isOrbSpawning = false,
  orbSpawnKey = 0,
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
        className={cn(isBoardCelebrating && "board-celebrate")}
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
            const isGoalCelebrating =
              goalCelebration !== null &&
              positionsEqual(position, goalCelebration.position);

            return (
              <BoardTile
                key={positionKey}
                tile={tile}
                position={position}
                isSpawn={positionsEqual(position, spawn)}
                isOnPath={pathKeys.has(trailKey)}
                trailOpacity={trailOpacity}
                isGoalCelebrating={isGoalCelebrating}
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

      {goalCelebration ? (
        <GoalCelebration
          position={goalCelebration.position}
          gridSize={size}
          score={goalCelebration.score}
          owner={goalCelebration.owner}
        />
      ) : null}

      {orbPosition ? (
        <OrbLayer
          key={orbSpawnKey}
          position={orbPosition}
          gridSize={size}
          isSpawning={isOrbSpawning}
        />
      ) : null}
    </div>
  );
}
