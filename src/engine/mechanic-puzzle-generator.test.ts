import { describe, expect, it } from "vitest";

import {
  createIceSlidePuzzleGame,
  createPortalHopPuzzleGame,
  getMechanicPuzzleSeed,
  isIceSlidePuzzleId,
  isPortalHopPuzzleId,
} from "@/engine/mechanic-puzzle-generator";
import { playTurn } from "@/engine/game-controller";
import { getTile } from "@/engine/board";

function findSingleRotationWin(
  game: ReturnType<typeof createPortalHopPuzzleGame>,
): { row: number; col: number } | null {
  for (let row = 0; row < game.board.length; row += 1) {
    for (let col = 0; col < game.board.length; col += 1) {
      const position = { row, col };
      const tile = getTile(game.board, position);

      if (tile?.kind !== "arrow") {
        continue;
      }

      const result = playTurn(game, { type: "rotate", position });

      if (!("error" in result) && result.status === "won") {
        return position;
      }
    }
  }

  return null;
}

describe("mechanic puzzle generation", () => {
  it("creates deterministic portal hop puzzles", () => {
    const first = createPortalHopPuzzleGame(9001);
    const second = createPortalHopPuzzleGame(9001);

    expect(isPortalHopPuzzleId(first.puzzleId)).toBe(true);
    expect(first.puzzleId).toBe(second.puzzleId);
    expect(first.board).toEqual(second.board);
    expect(getMechanicPuzzleSeed(first.puzzleId)).toBeTruthy();
  });

  it("creates deterministic ice slide puzzles", () => {
    const first = createIceSlidePuzzleGame(7001);
    const second = createIceSlidePuzzleGame(7001);

    expect(isIceSlidePuzzleId(first.puzzleId)).toBe(true);
    expect(first.puzzleId).toBe(second.puzzleId);
    expect(first.board).toEqual(second.board);
  });

  it("includes teleporter tiles in portal hop puzzles", () => {
    const game = createPortalHopPuzzleGame(4242);
    const hasTeleporter = game.board.some((row) =>
      row.some((tile) => tile.kind === "teleporter"),
    );

    expect(hasTeleporter).toBe(true);
  });

  it("includes ice tiles in ice slide puzzles", () => {
    const game = createIceSlidePuzzleGame(4242);
    const hasIce = game.board.some((row) =>
      row.some((tile) => tile.kind === "ice"),
    );

    expect(hasIce).toBe(true);
  });

  it("wins portal hop puzzles with a single rotation", () => {
    const game = createPortalHopPuzzleGame(13579);
    const winningMove = findSingleRotationWin(game);

    expect(winningMove).not.toBeNull();
  });

  it("wins ice slide puzzles with a single rotation", () => {
    const game = createIceSlidePuzzleGame(24680);
    const winningMove = findSingleRotationWin(game);

    expect(winningMove).not.toBeNull();
  });
});
