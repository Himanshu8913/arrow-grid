import { describe, expect, it } from "vitest";

import { createNewGame, playTurn, restartMatch } from "@/engine/game-controller";
import { findArrowPosition } from "@/test/board-fixtures";

describe("createNewGame", () => {
  it("creates a deterministic in-progress match from a seed", () => {
    const first = createNewGame({ seed: 42, playerCount: 2, size: 5 });
    const second = createNewGame({ seed: 42, playerCount: 2, size: 5 });

    expect(first.status).toBe("in-progress");
    expect(first.board).toEqual(second.board);
    expect(first.spawn).toEqual(second.spawn);
    expect(first.currentPlayer).toBe("player1");
  });
});

describe("playTurn", () => {
  it("rejects moves after the match ends", () => {
    const game = createNewGame({ seed: 7, playerCount: 2, size: 5 });
    const finished = { ...game, status: "won" as const, winner: "player1" as const };
    const arrow = findArrowPosition(finished.board);

    expect(arrow).not.toBeNull();
    const result = playTurn(finished, { type: "rotate", position: arrow! });

    expect(result).toEqual({ error: "game-over" });
  });

  it("rejects illegal rotations", () => {
    const game = createNewGame({ seed: 7, playerCount: 2, size: 5 });

    expect(playTurn(game, { type: "rotate", position: game.spawn })).toEqual({
      error: "spawn",
    });
  });

  it("advances the match on a legal move", () => {
    const game = createNewGame({ seed: 99, playerCount: 2, size: 5 });
    const arrow = findArrowPosition(game.board);

    expect(arrow).not.toBeNull();
    const next = playTurn(game, { type: "rotate", position: arrow! });

    expect("error" in next).toBe(false);
    if (!("error" in next)) {
      expect(next.movesPlayed).toBe(1);
      expect(next.turnNumber).toBeGreaterThanOrEqual(1);
    }
  });
});

describe("restartMatch", () => {
  it("starts a fresh match with a new board", () => {
    const first = createNewGame({ seed: 1, playerCount: 2, size: 5 });
    const restarted = restartMatch({ seed: 2, playerCount: 2, size: 5 });

    expect(restarted.status).toBe("in-progress");
    expect(restarted.board).not.toEqual(first.board);
    expect(restarted.players.player1.totalScore).toBe(0);
  });
});
