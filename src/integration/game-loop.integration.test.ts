import { describe, expect, it } from "vitest";

import { getPuzzleById } from "@/data/puzzles";
import { createNewGame, playTurn } from "@/engine/game-controller";
import { applyPuzzleMoveLimit, createGameFromPuzzle } from "@/engine/puzzle";
import { getLegalRotatePositions } from "@/engine/rotation";
import { findArrowPosition } from "@/test/board-fixtures";

describe("game loop integration", () => {
  it("plays alternating turns in a seeded PvP match", () => {
    let game = createNewGame({ seed: 2026, playerCount: 2, size: 5 });

    for (let turn = 0; turn < 4 && game.status === "in-progress"; turn += 1) {
      const arrow = findArrowPosition(game.board);
      expect(arrow).not.toBeNull();

      const next = playTurn(game, { type: "rotate", position: arrow! });
      expect("error" in next).toBe(false);
      if ("error" in next) {
        break;
      }

      game = next;
      expect(game.movesPlayed).toBe(turn + 1);
    }

    expect(["in-progress", "won", "lost"]).toContain(game.status);
  });

  it("wins a catalog puzzle through the full turn pipeline", () => {
    const game = createGameFromPuzzle(getPuzzleById("first-steps"));
    const result = playTurn(game, {
      type: "rotate",
      position: { row: 2, col: 2 },
    });

    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.status).toBe("won");
      expect(result.players.player1.matchPoints).toBe(1);
      expect(result.lastOutcome?.scored).toBe(true);
    }
  });

  it("loses a puzzle when the move limit is exceeded", () => {
    let game = createGameFromPuzzle(getPuzzleById("corner-route"));

    for (let move = 0; move < game.moveLimit!; move += 1) {
      const legal = getLegalRotatePositions(game.board, game.spawn);
      expect(legal.length).toBeGreaterThan(0);

      const next = playTurn(game, {
        type: "rotate",
        position: legal[0],
      });

      expect("error" in next).toBe(false);
      if ("error" in next) {
        break;
      }

      game = next;
    }

    game = applyPuzzleMoveLimit(game);

    expect(game.movesPlayed).toBe(game.moveLimit);
    expect(game.status).toBe("lost");
  });
});
