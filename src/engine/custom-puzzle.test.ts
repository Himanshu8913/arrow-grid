import { describe, expect, it } from "vitest";

import {
  boardToPlacements,
  createEmptyEditorBoard,
  decodePuzzleShareCode,
  draftToPuzzleDefinition,
  encodePuzzleShareCode,
  isCustomPuzzleId,
  validateCustomPuzzleDraft,
} from "@/engine/custom-puzzle";
import { createEmptyBoard, setTile } from "@/engine/board";

describe("custom puzzle helpers", () => {
  it("detects custom puzzle ids", () => {
    expect(isCustomPuzzleId("custom-abc")).toBe(true);
    expect(isCustomPuzzleId("first-steps")).toBe(false);
  });

  it("round-trips share codes", () => {
    const puzzle = draftToPuzzleDefinition(
      {
        title: "Shared Puzzle",
        description: "Test",
        size: 5,
        spawn: { row: 0, col: 0 },
        goal: { row: 4, col: 4 },
        goal2: null,
        moveLimit: 8,
        targetMoves: 2,
        placements: boardToPlacements(
          (() => {
            let board = createEmptyBoard(5, { kind: "wall" });
            board = setTile(board, { row: 0, col: 0 }, {
              kind: "arrow",
              direction: "right",
            });
            board = setTile(board, { row: 4, col: 4 }, {
              kind: "goal",
              owner: "player1",
            });
            return board;
          })(),
        ),
      },
      "custom-test",
    );

    const code = encodePuzzleShareCode(puzzle);
    const decoded = decodePuzzleShareCode(code);

    expect(decoded.title).toBe("Shared Puzzle");
    expect(decoded.size).toBe(5);
    expect(decoded.placements?.length).toBeGreaterThan(0);
  });

  it("requires spawn and goal before validation passes", () => {
    const errors = validateCustomPuzzleDraft({
      title: "Draft",
      description: "",
      size: 5,
      spawn: null,
      goal: null,
      goal2: null,
      moveLimit: 10,
      targetMoves: 3,
      placements: boardToPlacements(createEmptyEditorBoard(5)),
    });

    expect(errors.length).toBeGreaterThan(0);
  });
});
