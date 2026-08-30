import { describe, expect, it } from "vitest";

import {
  BLAST_ZONE_PUZZLE_ID,
  createBlastZonePuzzleGame,
  createGustAlleyPuzzleGame,
  createIceSlidePuzzleGame,
  createLockAndKeyPuzzleGame,
  createMagnetPullPuzzleGame,
  createPortalHopPuzzleGame,
  createSpinCyclePuzzleGame,
  createTwinSplitPuzzleGame,
  GUST_ALLEY_PUZZLE_ID,
  getMechanicPuzzleSeed,
  ICE_SLIDE_PUZZLE_ID,
  isBlastZonePuzzleId,
  isGustAlleyPuzzleId,
  isIceSlidePuzzleId,
  isLockAndKeyPuzzleId,
  isMagnetPullPuzzleId,
  isPortalHopPuzzleId,
  isSpinCyclePuzzleId,
  isTwinSplitPuzzleId,
  LOCK_AND_KEY_PUZZLE_ID,
  MAGNET_PULL_PUZZLE_ID,
  PORTAL_HOP_PUZZLE_ID,
  SPIN_CYCLE_PUZZLE_ID,
  TWIN_SPLIT_PUZZLE_ID,
} from "@/engine/mechanic-puzzle-generator";
import { playTurn } from "@/engine/game-controller";
import { getTile } from "@/engine/board";
import type { GameState } from "@/engine/game-state";
import type { TileKind } from "@/types/game";

function findSingleRotationWin(game: GameState): { row: number; col: number } | null {
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

function boardHasTileKind(game: GameState, kind: TileKind): boolean {
  return game.board.some((row) => row.some((tile) => tile.kind === kind));
}

describe("mechanic puzzle generation", () => {
  const cases = [
    {
      title: "portal hop",
      id: PORTAL_HOP_PUZZLE_ID,
      create: createPortalHopPuzzleGame,
      matches: isPortalHopPuzzleId,
      tileKind: "teleporter" as const,
      seed: 9001,
      winSeed: 13579,
    },
    {
      title: "ice slide",
      id: ICE_SLIDE_PUZZLE_ID,
      create: createIceSlidePuzzleGame,
      matches: isIceSlidePuzzleId,
      tileKind: "ice" as const,
      seed: 7001,
      winSeed: 24680,
    },
    {
      title: "spin cycle",
      id: SPIN_CYCLE_PUZZLE_ID,
      create: createSpinCyclePuzzleGame,
      matches: isSpinCyclePuzzleId,
      tileKind: "rotating-arrow" as const,
      seed: 5101,
      winSeed: 5102,
    },
    {
      title: "blast zone",
      id: BLAST_ZONE_PUZZLE_ID,
      create: createBlastZonePuzzleGame,
      matches: isBlastZonePuzzleId,
      tileKind: "bomb" as const,
      seed: 6101,
      winSeed: 6102,
    },
    {
      title: "lock and key",
      id: LOCK_AND_KEY_PUZZLE_ID,
      create: createLockAndKeyPuzzleGame,
      matches: isLockAndKeyPuzzleId,
      tileKind: "key" as const,
      seed: 8101,
      winSeed: 8102,
    },
    {
      title: "gust alley",
      id: GUST_ALLEY_PUZZLE_ID,
      create: createGustAlleyPuzzleGame,
      matches: isGustAlleyPuzzleId,
      tileKind: "wind" as const,
      seed: 9101,
      winSeed: 9102,
    },
    {
      title: "magnet pull",
      id: MAGNET_PULL_PUZZLE_ID,
      create: createMagnetPullPuzzleGame,
      matches: isMagnetPullPuzzleId,
      tileKind: "magnet" as const,
      seed: 10101,
      winSeed: 10102,
    },
    {
      title: "twin split",
      id: TWIN_SPLIT_PUZZLE_ID,
      create: createTwinSplitPuzzleGame,
      matches: isTwinSplitPuzzleId,
      tileKind: "splitter" as const,
      seed: 11101,
      winSeed: 11102,
    },
  ] as const;

  it.each(cases)(
    "creates deterministic $title puzzles",
    ({ create, matches, seed }) => {
      const first = create(seed);
      const second = create(seed);

      expect(matches(first.puzzleId)).toBe(true);
      expect(first.puzzleId).toBe(second.puzzleId);
      expect(first.board).toEqual(second.board);
      expect(getMechanicPuzzleSeed(first.puzzleId)).toBeTruthy();
    },
  );

  it.each(cases)(
    "includes $tileKind tiles in $title puzzles",
    ({ create, tileKind, seed }) => {
      const game = create(seed);
      expect(boardHasTileKind(game, tileKind)).toBe(true);
    },
  );

  it.each(cases)(
    "wins $title puzzles with a single rotation",
    ({ create, winSeed }) => {
      const game = create(winSeed);
      expect(findSingleRotationWin(game)).not.toBeNull();
    },
  );
});
