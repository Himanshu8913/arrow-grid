import { VIRTUAL_BOARD_SIZE_THRESHOLD } from "@/constants/performance";

/**
 * Large boards defer off-screen paint work via content-visibility.
 */
export function shouldUseVirtualTiles(boardSize: number): boolean {
  return boardSize >= VIRTUAL_BOARD_SIZE_THRESHOLD;
}
