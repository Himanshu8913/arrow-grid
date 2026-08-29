import { memo, useCallback } from "react";

import { BoardTile } from "@/components/board/board-tile";
import { GoalCelebration } from "@/components/board/goal-celebration";
import { LoopDetectionOverlay } from "@/components/board/loop-detection-overlay";
import { OrbLayer } from "@/components/board/orb-layer";
import { BOARD_TILE_GAP_PX } from "@/constants/animation";
import {
  getBoardTileRenderState,
  useBoardOverlayMaps,
} from "@/hooks/use-board-overlay-maps";
import { useBoardKeyboard } from "@/hooks/use-board-keyboard";
import type { Board, PlayerId, Position } from "@/types/game";
import { getTileAriaLabel } from "@/utils/board-a11y";
import { cn } from "@/utils/cn";

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
  loopTiles?: Position[];
  activeLoopPulsePosition?: Position;
  isLoopDetectionActive?: boolean;
  isBoardCelebrating?: boolean;
  isOrbSpawning?: boolean;
  isOrbFading?: boolean;
  isOrbFailure?: boolean;
  rotatingPosition?: Position | null;
  hintPosition?: Position | null;
  isBoardVibrating?: boolean;
  orbSpawnKey?: number;
  disabled?: boolean;
  onTileClick?: (position: Position) => void;
  className?: string;
}

/**
 * Responsive square grid that renders the full game board.
 */
export const BoardGrid = memo(function BoardGrid({
  board,
  spawn,
  orbPosition,
  pathPositions = [],
  trailPositions = [],
  selectedPosition = null,
  goalCelebration = null,
  loopTiles = [],
  activeLoopPulsePosition,
  isLoopDetectionActive = false,
  isBoardCelebrating = false,
  isOrbSpawning = false,
  isOrbFading = false,
  isOrbFailure = false,
  rotatingPosition = null,
  hintPosition = null,
  isBoardVibrating = false,
  orbSpawnKey = 0,
  disabled = false,
  onTileClick,
  className,
}: BoardGridProps) {
  const size = board.length;
  const { pathKeys, loopKeys, trailOpacityByKey } = useBoardOverlayMaps(
    pathPositions,
    trailPositions,
    loopTiles,
  );
  const handleTileClick = useCallback(
    (position: Position) => {
      onTileClick?.(position);
    },
    [onTileClick],
  );
  const {
    registerTileRef,
    handleTileFocus,
    handleGridKeyDown,
    handleGridFocus,
    getTileTabIndex,
  } = useBoardKeyboard({
    size,
    disabled: disabled || !onTileClick,
    onTileActivate: handleTileClick,
  });

  return (
    <div className={cn("relative mx-auto w-full max-w-md", className)}>
      <div
        role="grid"
        aria-label="Game board"
        aria-rowcount={size}
        aria-colcount={size}
        tabIndex={disabled || !onTileClick ? -1 : 0}
        onKeyDown={handleGridKeyDown}
        onFocus={handleGridFocus}
        className={cn(
          "board-grid-contain",
          isBoardCelebrating && "board-celebrate",
          isBoardVibrating && "board-soft-vibrate",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        )}
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${size}, minmax(0, 1fr))`,
          gap: `${BOARD_TILE_GAP_PX}px`,
        }}
      >
        {board.map((row, rowIndex) =>
          row.map((tile, colIndex) => {
            const position = { row: rowIndex, col: colIndex };
            const renderState = getBoardTileRenderState({
              position,
              spawn,
              pathKeys,
              loopKeys,
              trailOpacityByKey,
              goalCelebrationPosition: goalCelebration?.position ?? null,
              activeLoopPulsePosition,
              rotatingPosition,
              hintPosition,
              selectedPosition,
            });
            const ariaLabel = getTileAriaLabel(tile, position, {
              isSpawn: renderState.isSpawn,
              isSelected: renderState.isSelected,
              isHinted: renderState.isHinted,
              isOnPath: renderState.isOnPath,
              isLoopTile: renderState.isLoopTile,
            });

            return (
              <BoardTile
                key={`${rowIndex}-${colIndex}`}
                tile={tile}
                position={position}
                ariaLabel={ariaLabel}
                tabIndex={
                  onTileClick ? getTileTabIndex(position) : undefined
                }
                tileRef={(element) => registerTileRef(position, element)}
                boardSize={size}
                isSpawn={renderState.isSpawn}
                isOnPath={renderState.isOnPath}
                trailOpacity={renderState.trailOpacity}
                isGoalCelebrating={renderState.isGoalCelebrating}
                isLoopTile={renderState.isLoopTile}
                isLoopPulsing={renderState.isLoopPulsing}
                isHinted={renderState.isHinted}
                isArrowRotating={renderState.isArrowRotating}
                isSelected={renderState.isSelected}
                disabled={disabled}
                onClick={onTileClick ? handleTileClick : undefined}
                onFocus={handleTileFocus}
              />
            );
          }),
        )}
      </div>

      {isLoopDetectionActive ? <LoopDetectionOverlay /> : null}

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
          isFading={isOrbFading}
          isFailure={isOrbFailure}
        />
      ) : null}
    </div>
  );
});
