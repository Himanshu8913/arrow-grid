import { beforeEach, describe, expect, it } from "vitest";

import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import { boardToPlacements, createEmptyEditorBoard } from "@/engine/custom-puzzle";
import { setTile } from "@/engine/board";

describe("custom puzzle store", () => {
  beforeEach(() => {
    useCustomPuzzleStore.getState().resetLibrary();
  });

  it("saves and retrieves community puzzles", () => {
    let board = createEmptyEditorBoard(5);
    board = setTile(board, { row: 0, col: 0 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 4, col: 4 }, { kind: "goal", owner: "player1" });

    const puzzleId = useCustomPuzzleStore.getState().saveDraft(
      {
        title: "Community Test",
        description: "Saved locally",
        size: 5,
        spawn: { row: 0, col: 0 },
        goal: { row: 4, col: 4 },
        goal2: null,
        moveLimit: 8,
        targetMoves: 2,
        placements: boardToPlacements(board),
      },
      "Tester",
    );

    const record = useCustomPuzzleStore.getState().getPuzzle(puzzleId);

    expect(record?.puzzle.title).toBe("Community Test");
    expect(record?.meta.authorName).toBe("Tester");
  });

  it("tracks ratings and bookmarks", () => {
    let board = createEmptyEditorBoard(5);
    board = setTile(board, { row: 0, col: 0 }, { kind: "arrow", direction: "right" });
    board = setTile(board, { row: 4, col: 4 }, { kind: "goal", owner: "player1" });

    const puzzleId = useCustomPuzzleStore.getState().saveDraft(
      {
        title: "Rated Puzzle",
        description: "",
        size: 5,
        spawn: { row: 0, col: 0 },
        goal: { row: 4, col: 4 },
        goal2: null,
        moveLimit: 8,
        targetMoves: 2,
        placements: boardToPlacements(board),
      },
      "Tester",
    );

    useCustomPuzzleStore.getState().ratePuzzle(puzzleId, 5);
    useCustomPuzzleStore.getState().toggleBookmark(puzzleId);

    const record = useCustomPuzzleStore.getState().getPuzzle(puzzleId);

    expect(record?.meta.ratingCount).toBe(1);
    expect(record?.meta.bookmarked).toBe(true);
  });
});
