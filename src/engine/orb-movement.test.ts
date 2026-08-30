import { describe, expect, it } from "vitest";

import { createEmptyBoard, setTile } from "@/engine/board";
import { simulateOrbMovement } from "@/engine/orb-movement";
import { createGameFromPuzzle, buildPuzzleBoard } from "@/engine/puzzle";
import { playTurn } from "@/engine/game-controller";
import { rotateArrowAt } from "@/engine/rotation";
import {
  buildTeleporterTargetMap,
  validateTeleporterTargets,
} from "@/engine/teleporter";
import { getPuzzleById } from "@/data/puzzles";

function buildTeleporterBoard() {
  let board = createEmptyBoard(5, { kind: "wall" });

  board = setTile(board, { row: 0, col: 0 }, { kind: "arrow", direction: "right" });
  board = setTile(board, { row: 0, col: 1 }, { kind: "arrow", direction: "right" });
  board = setTile(board, { row: 0, col: 2 }, {
    kind: "teleporter",
    portalId: "alpha",
    target: { row: 4, col: 2 },
  });
  board = setTile(board, { row: 4, col: 2 }, { kind: "arrow", direction: "left" });
  board = setTile(board, { row: 4, col: 1 }, { kind: "arrow", direction: "left" });
  board = setTile(board, { row: 4, col: 0 }, { kind: "goal", owner: "player1" });

  return board;
}

describe("teleporter tiles", () => {
  it("maps teleporter cells to their configured targets", () => {
    const board = buildTeleporterBoard();
    const targets = buildTeleporterTargetMap(board);

    expect(targets.get("0,2")).toEqual({ row: 4, col: 2 });
  });

  it("rejects teleporters that target walls", () => {
    let board = createEmptyBoard(3, { kind: "wall" });
    board = setTile(board, { row: 0, col: 0 }, {
      kind: "teleporter",
      portalId: "alpha",
      target: { row: 0, col: 1 },
    });

    expect(() => validateTeleporterTargets(board)).toThrow(/targets a wall/);
  });

  it("teleports the orb to its target and continues toward the goal", () => {
    const board = buildTeleporterBoard();
    const result = simulateOrbMovement(board, { row: 0, col: 0 });

    expect(result.stoppedReason).toBe("goal");
    expect(result.path).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 4, col: 2 },
      { row: 4, col: 1 },
      { row: 4, col: 0 },
    ]);
  });

  it("stops when a teleporter exits onto a wall", () => {
    let board = createEmptyBoard(3, { kind: "wall" });
    board = setTile(board, { row: 0, col: 0 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 0, col: 1 }, {
      kind: "teleporter",
      portalId: "alpha",
      target: { row: 2, col: 2 },
    });

    const result = simulateOrbMovement(board, { row: 0, col: 0 });

    expect(result.stoppedReason).toBe("wall");
    expect(result.path).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 2, col: 2 },
    ]);
  });
});

describe("portal hop puzzle", () => {
  it("reaches the goal after the entry arrow points into the portal", () => {
    const board = buildPuzzleBoard(getPuzzleById("portal-hop"));
    const rotated = rotateArrowAt(board, { row: 0, col: 1 });

    expect(rotated[0][1]).toEqual({ kind: "arrow", direction: "right" });
    expect(rotated[0][2]).toEqual({
      kind: "teleporter",
      portalId: "alpha",
      target: { row: 4, col: 2 },
    });

    const movement = simulateOrbMovement(rotated, { row: 0, col: 0 });

    expect(movement.stoppedReason).toBe("goal");
    expect(movement.path).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 4, col: 2 },
      { row: 4, col: 1 },
      { row: 4, col: 0 },
    ]);
  });

  it("wins after rotating the middle arrow toward the teleporter", () => {
    const game = createGameFromPuzzle(getPuzzleById("portal-hop"));

    expect(game.status).toBe("in-progress");

    const result = playTurn(game, { type: "rotate", position: { row: 0, col: 1 } });

    expect("error" in result).toBe(false);
    if (!("error" in result)) {
      expect(result.status).toBe("won");
    }
  });
});
