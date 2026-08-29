import {
  type KeyboardEvent,
  useCallback,
  useRef,
  useState,
} from "react";

import type { Position } from "@/types/game";

export interface UseBoardKeyboardOptions {
  size: number;
  disabled?: boolean;
  onTileActivate?: (position: Position) => void;
}

/**
 * Roving-focus keyboard navigation for the board grid.
 */
export function useBoardKeyboard({
  size,
  disabled = false,
  onTileActivate,
}: UseBoardKeyboardOptions) {
  const [focusedPosition, setFocusedPosition] = useState<Position>({
    row: 0,
    col: 0,
  });
  const tileRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  const focusPosition = useCallback((position: Position) => {
    const clamped = clampPosition(position, size);
    setFocusedPosition(clamped);
    tileRefs.current.get(positionKey(clamped))?.focus();
  }, [size]);

  const registerTileRef = useCallback(
    (position: Position, element: HTMLButtonElement | null) => {
      const key = positionKey(position);
      if (element) {
        tileRefs.current.set(key, element);
        return;
      }

      tileRefs.current.delete(key);
    },
    [],
  );

  const handleTileFocus = useCallback((position: Position) => {
    setFocusedPosition(position);
  }, []);

  const handleGridKeyDown = useCallback(
    (event: KeyboardEvent<HTMLDivElement>) => {
      if (disabled) {
        return;
      }

      switch (event.key) {
        case "ArrowUp":
          event.preventDefault();
          focusPosition({
            row: focusedPosition.row - 1,
            col: focusedPosition.col,
          });
          break;
        case "ArrowDown":
          event.preventDefault();
          focusPosition({
            row: focusedPosition.row + 1,
            col: focusedPosition.col,
          });
          break;
        case "ArrowLeft":
          event.preventDefault();
          focusPosition({
            row: focusedPosition.row,
            col: focusedPosition.col - 1,
          });
          break;
        case "ArrowRight":
          event.preventDefault();
          focusPosition({
            row: focusedPosition.row,
            col: focusedPosition.col + 1,
          });
          break;
        case "Home":
          event.preventDefault();
          focusPosition({ row: focusedPosition.row, col: 0 });
          break;
        case "End":
          event.preventDefault();
          focusPosition({ row: focusedPosition.row, col: size - 1 });
          break;
        case "PageUp":
          event.preventDefault();
          focusPosition({ row: 0, col: focusedPosition.col });
          break;
        case "PageDown":
          event.preventDefault();
          focusPosition({ row: size - 1, col: focusedPosition.col });
          break;
        case "Enter":
        case " ":
          event.preventDefault();
          onTileActivate?.(focusedPosition);
          break;
        default:
          break;
      }
    },
    [disabled, focusPosition, focusedPosition, onTileActivate, size],
  );

  const handleGridFocus = useCallback(() => {
    focusPosition(focusedPosition);
  }, [focusPosition, focusedPosition]);

  return {
    focusedPosition,
    registerTileRef,
    handleTileFocus,
    handleGridKeyDown,
    handleGridFocus,
    getTileTabIndex: (position: Position) =>
      positionsEqual(clampPosition(focusedPosition, size), position) ? 0 : -1,
  };
}

function positionKey(position: Position): string {
  return `${position.row},${position.col}`;
}

function positionsEqual(a: Position, b: Position): boolean {
  return a.row === b.row && a.col === b.col;
}

function clampPosition(position: Position, size: number): Position {
  return {
    row: Math.max(0, Math.min(size - 1, position.row)),
    col: Math.max(0, Math.min(size - 1, position.col)),
  };
}
