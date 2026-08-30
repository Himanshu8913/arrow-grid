import { useMemo, useState } from "react";

import {
  PuzzleEditorBoard,
  resizeEditorBoard,
} from "@/components/editor/puzzle-editor-board";
import { MenuBackground } from "@/components/menu/menu-background";
import {
  boardToPlacements,
  createEmptyEditorBoard,
  draftToPuzzleDefinition,
  encodePuzzleShareCode,
  placementsToBoard,
  puzzleDefinitionToDraft,
  syncGoalMarkersFromBoard,
  validateCustomPuzzleDraft,
  type EditorTool,
} from "@/engine/custom-puzzle";
import { createGameFromPuzzle } from "@/engine/puzzle";
import { useToast } from "@/hooks/use-toast";
import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import { useGameStore } from "@/state/game-store";
import { useProfileStore } from "@/state/profile-store";
import { usePuzzleSessionStore } from "@/state/puzzle-session-store";
import type { CustomPuzzleDraft } from "@/types/custom-puzzle";
import type { Direction } from "@/types/game";
import { Button } from "@/ui/button";
import { Dropdown } from "@/ui/dropdown";
import { Input } from "@/ui/input";

const TOOL_OPTIONS: Array<{ value: EditorTool; label: string }> = [
  { value: "spawn", label: "Set Spawn" },
  { value: "arrow", label: "Arrow" },
  { value: "goal", label: "Goal P1" },
  { value: "goal2", label: "Goal P2" },
  { value: "wall", label: "Wall" },
  { value: "empty", label: "Empty" },
  { value: "ice", label: "Ice" },
  { value: "splitter", label: "Splitter" },
  { value: "bomb", label: "Bomb" },
  { value: "key", label: "Key" },
  { value: "locked-arrow", label: "Locked Arrow" },
  { value: "rotating-arrow", label: "Rotating Arrow" },
  { value: "wind", label: "Wind" },
  { value: "magnet", label: "Magnet" },
];

const DIRECTION_OPTIONS: Array<{ value: Direction; label: string }> = [
  { value: "up", label: "Up" },
  { value: "right", label: "Right" },
  { value: "down", label: "Down" },
  { value: "left", label: "Left" },
];

function createDefaultDraft(): CustomPuzzleDraft {
  const size = 5;
  const board = createEmptyEditorBoard(size);

  return {
    title: "My Puzzle",
    description: "A custom community puzzle.",
    size,
    spawn: { row: 0, col: 2 },
    goal: null,
    goal2: null,
    moveLimit: 10,
    targetMoves: 3,
    placements: boardToPlacements(board),
  };
}

export interface PuzzleEditorScreenProps {
  editingPuzzleId?: string;
  onBack: () => void;
  onPlayTest: () => void;
}

/**
 * Local puzzle editor for placing tiles, spawn, goals, and testing layouts.
 */
export function PuzzleEditorScreen({
  editingPuzzleId,
  onBack,
  onPlayTest,
}: PuzzleEditorScreenProps) {
  const existing = useCustomPuzzleStore((state) =>
    editingPuzzleId ? state.getPuzzle(editingPuzzleId) : undefined,
  );
  const saveDraft = useCustomPuzzleStore((state) => state.saveDraft);
  const authorName = useProfileStore((state) => state.displayName);
  const { toast } = useToast();

  const [draft, setDraft] = useState<CustomPuzzleDraft>(() =>
    existing ? puzzleDefinitionToDraft(existing.puzzle) : createDefaultDraft(),
  );
  const [selectedTool, setSelectedTool] = useState<EditorTool>("arrow");
  const [arrowDirection, setArrowDirection] = useState<Direction>("right");

  const validationErrors = useMemo(() => validateCustomPuzzleDraft(draft), [draft]);

  const handleResize = (size: number) => {
    const board = placementsToBoard(draft.size, draft.placements);
    const resized = resizeEditorBoard(board, size);
    setDraft(
      syncGoalMarkersFromBoard(
        {
          ...draft,
          size,
          placements: boardToPlacements(resized),
          spawn:
            draft.spawn && draft.spawn.row < size && draft.spawn.col < size
              ? draft.spawn
              : { row: 0, col: Math.floor(size / 2) },
        },
        resized,
      ),
    );
  };

  const handleSave = () => {
    try {
      const puzzleId = saveDraft(draft, authorName, editingPuzzleId);
      toast({
        title: "Puzzle saved",
        description: "Your puzzle is available in Community Puzzles.",
        variant: "success",
      });

      const shareCode = encodePuzzleShareCode(
        draftToPuzzleDefinition(draft, puzzleId),
      );
      void navigator.clipboard?.writeText(shareCode);
      toast({
        title: "Share code copied",
        description: "Paste the code for friends to import your puzzle.",
        variant: "default",
      });
    } catch (error) {
      toast({
        title: "Could not save puzzle",
        description:
          error instanceof Error ? error.message : "Check the board setup.",
        variant: "danger",
      });
    }
  };

  const handleTest = () => {
    if (validationErrors.length > 0) {
      toast({
        title: "Fix the puzzle first",
        description: validationErrors[0],
        variant: "warning",
      });
      return;
    }

    try {
      const puzzleId =
        editingPuzzleId ??
        saveDraft(draft, authorName, editingPuzzleId);
      const puzzle = draftToPuzzleDefinition(draft, puzzleId);
      const game = createGameFromPuzzle(puzzle);

      useGameStore.getState().setGameMode("puzzle");
      usePuzzleSessionStore.getState().setSelectedPuzzleId(puzzleId);
      useGameStore.getState().setGame(game, { persist: false });
      useGameStore.getState().setMatchSessionActive(true);
      onPlayTest();
    } catch (error) {
      toast({
        title: "Test failed",
        description:
          error instanceof Error ? error.message : "Invalid puzzle layout.",
        variant: "danger",
      });
    }
  };

  return (
    <div className="relative min-h-dvh overflow-y-auto p-4 sm:p-6">
      <MenuBackground />

      <div className="relative z-10 mx-auto flex w-full max-w-3xl flex-col gap-4">
        <div className="flex items-center justify-between gap-3">
          <Button type="button" variant="ghost" onClick={onBack}>
            ← Back
          </Button>
          <h1 className="text-xl font-bold text-text-primary">Puzzle Editor</h1>
          <div className="w-16" />
        </div>

        <div className="rounded-3xl border border-bg-card/60 bg-bg-surface/90 p-4 shadow-[var(--shadow-strong)] backdrop-blur-sm sm:p-5">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              label="Title"
              value={draft.title}
              onChange={(event) =>
                setDraft((current) => ({ ...current, title: event.target.value }))
              }
            />
            <Input
              label="Description"
              value={draft.description}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  description: event.target.value,
                }))
              }
            />
            <Input
              label="Move Limit"
              type="number"
              min={1}
              value={draft.moveLimit}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  moveLimit: Number(event.target.value) || 1,
                }))
              }
            />
            <Input
              label="Target Moves"
              type="number"
              min={1}
              value={draft.targetMoves}
              onChange={(event) =>
                setDraft((current) => ({
                  ...current,
                  targetMoves: Number(event.target.value) || 1,
                }))
              }
            />
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <Dropdown
              label="Board Size"
              value={String(draft.size)}
              onValueChange={(value) => handleResize(Number(value))}
              options={[
                { value: "5", label: "5 × 5" },
                { value: "6", label: "6 × 6" },
                { value: "7", label: "7 × 7" },
              ]}
            />
            <Dropdown
              label="Tool"
              value={selectedTool}
              onValueChange={(value) => setSelectedTool(value as EditorTool)}
              options={TOOL_OPTIONS}
            />
            <Dropdown
              label="Arrow Direction"
              value={arrowDirection}
              disabled={
                selectedTool !== "arrow" &&
                selectedTool !== "locked-arrow" &&
                selectedTool !== "rotating-arrow"
              }
              onValueChange={(value) => setArrowDirection(value as Direction)}
              options={DIRECTION_OPTIONS}
            />
          </div>

          <p className="mt-3 text-xs text-text-muted">
            Click cells to paint tiles. Choose &quot;Set Spawn&quot; then click
            the orb start square.
          </p>

          <div className="mt-4">
            <PuzzleEditorBoard
              draft={draft}
              selectedTool={selectedTool}
              arrowDirection={arrowDirection}
              onDraftChange={setDraft}
            />
          </div>

          {validationErrors.length > 0 ? (
            <p className="mt-3 text-sm text-warning">{validationErrors[0]}</p>
          ) : null}

          <div className="mt-4 flex flex-wrap gap-2">
            <Button type="button" onClick={handleTest}>
              Test Puzzle
            </Button>
            <Button type="button" variant="secondary" onClick={handleSave}>
              Save & Copy Share Code
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
