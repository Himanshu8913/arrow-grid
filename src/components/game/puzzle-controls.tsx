import { Button } from "@/ui/button";

export interface PuzzleControlsProps {
  canUndo: boolean;
  canHint: boolean;
  onRestart: () => void;
  onUndo: () => void;
  onHint: () => void;
}

/**
 * Puzzle action buttons for restart, undo, and hint.
 */
export function PuzzleControls({
  canUndo,
  canHint,
  onRestart,
  onUndo,
  onHint,
}: PuzzleControlsProps) {
  return (
    <div className="flex flex-wrap items-center justify-center gap-2">
      <Button type="button" variant="secondary" size="sm" onClick={onRestart}>
        <span aria-hidden="true">↻</span>
        Restart
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!canUndo}
        onClick={onUndo}
      >
        <span aria-hidden="true">↩</span>
        Undo
      </Button>
      <Button
        type="button"
        variant="ghost"
        size="sm"
        disabled={!canHint}
        onClick={onHint}
      >
        <span aria-hidden="true">?</span>
        Hint
      </Button>
    </div>
  );
}
