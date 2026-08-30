import { describe, expect, it } from "vitest";

import { createEmptyBoard, setTile } from "@/engine/board";
import { simulateOrbMovement } from "@/engine/orb-movement";
import {
  buildTeleporterTargetMap,
  validateTeleporterTargets,
} from "@/engine/teleporter";

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

function buildIceSlideBoard() {
  let board = createEmptyBoard(5, { kind: "wall" });

  board = setTile(board, { row: 0, col: 0 }, { kind: "arrow", direction: "right" });
  board = setTile(board, { row: 0, col: 1 }, { kind: "ice" });
  board = setTile(board, { row: 0, col: 2 }, { kind: "ice", direction: "down" });
  board = setTile(board, { row: 0, col: 3 }, { kind: "arrow", direction: "down" });
  board = setTile(board, { row: 1, col: 3 }, { kind: "arrow", direction: "down" });
  board = setTile(board, { row: 2, col: 3 }, { kind: "arrow", direction: "down" });
  board = setTile(board, { row: 3, col: 3 }, { kind: "arrow", direction: "down" });
  board = setTile(board, { row: 4, col: 3 }, { kind: "goal", owner: "player1" });

  return board;
}

describe("ice tiles", () => {
  it("slides across ice while ignoring decoy arrows", () => {
    const board = buildIceSlideBoard();
    const result = simulateOrbMovement(board, { row: 0, col: 0 });

    expect(result.stoppedReason).toBe("goal");
    expect(result.path).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 1, col: 3 },
      { row: 2, col: 3 },
      { row: 3, col: 3 },
      { row: 4, col: 3 },
    ]);
  });

  it("stops at a wall when ice momentum carries into a dead end", () => {
    let board = createEmptyBoard(5, { kind: "wall" });
    board = setTile(board, { row: 0, col: 0 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 0, col: 1 }, { kind: "ice" });
    board = setTile(board, { row: 0, col: 2 }, { kind: "ice" });
    board = setTile(board, { row: 0, col: 3 }, { kind: "arrow", direction: "right" });

    const result = simulateOrbMovement(board, { row: 0, col: 0 });

    expect(result.stoppedReason).toBe("wall");
    expect(result.path).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 0, col: 4 },
    ]);
  });
});

describe("rotating arrow tiles", () => {
  it("rotates after the orb passes over it", () => {
    let board = createEmptyBoard(5, { kind: "wall" });
    board = setTile(board, { row: 0, col: 0 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 0, col: 1 }, {
      kind: "rotating-arrow",
      direction: "right",
    });
    board = setTile(board, { row: 0, col: 2 }, { kind: "arrow", direction: "down" });
    board = setTile(board, { row: 1, col: 2 }, { kind: "arrow", direction: "down" });
    board = setTile(board, { row: 2, col: 2 }, { kind: "goal", owner: "player1" });

    const result = simulateOrbMovement(board, { row: 0, col: 0 });

    expect(result.stoppedReason).toBe("goal");
    expect(result.board[0][1]).toEqual({
      kind: "rotating-arrow",
      direction: "down",
    });
  });
});

describe("bomb tiles", () => {
  it("stops movement and clears the bomb cell", () => {
    let board = createEmptyBoard(5, { kind: "wall" });
    board = setTile(board, { row: 0, col: 0 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 0, col: 1 }, { kind: "bomb" });

    const result = simulateOrbMovement(board, { row: 0, col: 0 });

    expect(result.stoppedReason).toBe("no-direction");
    expect(result.board[0][1]).toEqual({ kind: "empty" });
  });
});

describe("locked arrows and keys", () => {
  it("unlocks locked arrows after collecting a key", () => {
    let board = createEmptyBoard(5, { kind: "wall" });
    board = setTile(board, { row: 0, col: 0 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 0, col: 1 }, { kind: "key" });
    board = setTile(board, { row: 0, col: 2 }, {
      kind: "locked-arrow",
      direction: "right",
    });
    board = setTile(board, { row: 0, col: 3 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 0, col: 4 }, { kind: "goal", owner: "player1" });

    const result = simulateOrbMovement(board, { row: 0, col: 0 });

    expect(result.stoppedReason).toBe("goal");
    expect(result.board[0][2]).toEqual({ kind: "arrow", direction: "right" });
  });
});

describe("wind tiles", () => {
  it("pushes the orb one extra step in the travel direction", () => {
    let board = createEmptyBoard(5, { kind: "wall" });
    board = setTile(board, { row: 0, col: 0 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 0, col: 1 }, { kind: "wind" });
    board = setTile(board, { row: 0, col: 2 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 0, col: 3 }, { kind: "arrow", direction: "down" });
    board = setTile(board, { row: 1, col: 3 }, { kind: "goal", owner: "player1" });

    const result = simulateOrbMovement(board, { row: 0, col: 0 });

    expect(result.stoppedReason).toBe("goal");
    expect(result.path).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 1, col: 3 },
    ]);
  });
});

describe("magnet tiles", () => {
  it("pulls the orb onto the magnet and continues in the travel direction", () => {
    let board = createEmptyBoard(5, { kind: "wall" });
    board = setTile(board, { row: 0, col: 0 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 0, col: 1 }, { kind: "magnet" });
    board = setTile(board, { row: 0, col: 2 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 0, col: 3 }, { kind: "arrow", direction: "down" });
    board = setTile(board, { row: 1, col: 3 }, { kind: "goal", owner: "player1" });

    const result = simulateOrbMovement(board, { row: 0, col: 0 });

    expect(result.stoppedReason).toBe("goal");
    expect(result.path).toEqual([
      { row: 0, col: 0 },
      { row: 0, col: 1 },
      { row: 0, col: 2 },
      { row: 0, col: 3 },
      { row: 1, col: 3 },
    ]);
  });
});
