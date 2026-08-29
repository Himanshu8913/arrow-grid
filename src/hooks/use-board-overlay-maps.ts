import { useMemo } from "react";

import type { Position } from "@/types/game";
import { positionsEqual } from "@/engine/position";

export interface BoardOverlayMaps {
  pathKeys: Set<string>;
  loopKeys: Set<string>;
  trailOpacityByKey: Map<string, number>;
}

/**
 * Memoizes path, loop, and trail lookup maps for board rendering.
 */
export function useBoardOverlayMaps(
  pathPositions: Position[],
  trailPositions: Position[],
  loopTiles: Position[],
): BoardOverlayMaps {
  return useMemo(() => {
    const pathKeys = new Set(
      pathPositions.map((position) => `${position.row},${position.col}`),
    );
    const loopKeys = new Set(
      loopTiles.map((position) => `${position.row},${position.col}`),
    );
    const trailOpacityByKey = new Map<string, number>();

    trailPositions.forEach((position, index) => {
      const intensity =
        trailPositions.length <= 1
          ? 1
          : index / (trailPositions.length - 1);
      trailOpacityByKey.set(`${position.row},${position.col}`, intensity);
    });

    return { pathKeys, loopKeys, trailOpacityByKey };
  }, [loopTiles, pathPositions, trailPositions]);
}

export interface BoardTileRenderState {
  isSpawn: boolean;
  isOnPath: boolean;
  trailOpacity?: number;
  isGoalCelebrating: boolean;
  isLoopTile: boolean;
  isLoopPulsing: boolean;
  isHinted: boolean;
  isArrowRotating: boolean;
  isSelected: boolean;
}

/**
 * Derives per-tile render flags from overlay state.
 */
export function getBoardTileRenderState(options: {
  position: Position;
  spawn: Position;
  pathKeys: Set<string>;
  loopKeys: Set<string>;
  trailOpacityByKey: Map<string, number>;
  goalCelebrationPosition: Position | null;
  activeLoopPulsePosition?: Position;
  rotatingPosition: Position | null;
  hintPosition: Position | null;
  selectedPosition: Position | null;
}): BoardTileRenderState {
  const trailKey = `${options.position.row},${options.position.col}`;
  const trailOpacity = options.trailOpacityByKey.get(trailKey);

  return {
    isSpawn: positionsEqual(options.position, options.spawn),
    isOnPath: options.pathKeys.has(trailKey),
    trailOpacity,
    isGoalCelebrating:
      options.goalCelebrationPosition !== null &&
      positionsEqual(options.position, options.goalCelebrationPosition),
    isLoopTile: options.loopKeys.has(trailKey),
    isLoopPulsing:
      options.activeLoopPulsePosition !== undefined &&
      positionsEqual(options.position, options.activeLoopPulsePosition),
    isHinted:
      options.hintPosition !== null &&
      positionsEqual(options.position, options.hintPosition),
    isArrowRotating:
      options.rotatingPosition !== null &&
      positionsEqual(options.position, options.rotatingPosition),
    isSelected:
      options.selectedPosition !== null &&
      positionsEqual(options.position, options.selectedPosition),
  };
}
