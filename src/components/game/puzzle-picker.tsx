import { useMemo, useState } from "react";

import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import { Badge } from "@/ui/badge";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import {
  getGroupedPuzzleOptions,
  getPuzzleCategoryLabel,
  getPuzzleOptionById,
  type PuzzleModeOption,
  type PuzzleOptionCategory,
} from "@/utils/puzzle-options";
import { cn } from "@/utils/cn";

const CATEGORY_BADGE_VARIANT: Record<
  PuzzleOptionCategory,
  "primary" | "warning" | "success" | "secondary" | "outline"
> = {
  featured: "primary",
  seasonal: "warning",
  classic: "success",
  mechanic: "secondary",
  community: "outline",
};

export interface PuzzlePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

function PuzzleOptionCard({
  option,
  isSelected,
  onSelect,
}: {
  option: PuzzleModeOption;
  isSelected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition",
        "hover:border-accent-primary/30 hover:bg-bg-card/70",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        isSelected
          ? "border-accent-primary/50 bg-accent-primary/10"
          : "border-bg-card/80 bg-bg-card/35",
      )}
      aria-pressed={isSelected}
      onClick={onSelect}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border text-[11px] font-bold",
          isSelected
            ? "border-accent-primary bg-accent-primary text-bg-primary"
            : "border-text-muted/40 text-transparent",
        )}
      >
        ✓
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-text-primary">{option.label}</span>
          <Badge variant={CATEGORY_BADGE_VARIANT[option.category]} size="sm">
            {getPuzzleCategoryLabel(option.category)}
          </Badge>
        </span>
        <span className="mt-1 block text-xs leading-relaxed text-text-muted">
          {option.description}
        </span>
      </span>
    </button>
  );
}

/**
 * Grouped puzzle selector with a compact summary and browse dialog.
 */
export function PuzzlePicker({
  value,
  onValueChange,
  disabled = false,
  className,
}: PuzzlePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const puzzles = useCustomPuzzleStore((state) => state.puzzles);

  const groupedOptions = useMemo(() => getGroupedPuzzleOptions(), [puzzles]);
  const selectedOption = useMemo(() => getPuzzleOptionById(value), [value, puzzles]);

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setIsOpen(false);
  };

  return (
    <>
      <div className={cn("mx-auto w-full max-w-md text-left", className)}>
        <p className="mb-2 text-sm font-medium text-text-primary">Puzzle</p>
        <div
          className={cn(
            "rounded-[18px] border border-bg-card/80 bg-bg-card/40 p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]",
            disabled && "opacity-60",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <p className="truncate text-base font-semibold text-text-primary">
                  {selectedOption.label}
                </p>
                <Badge
                  variant={CATEGORY_BADGE_VARIANT[selectedOption.category]}
                  size="sm"
                >
                  {getPuzzleCategoryLabel(selectedOption.category)}
                </Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-text-muted">
                {selectedOption.description}
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={disabled}
              className="shrink-0"
              onClick={() => setIsOpen(true)}
            >
              Browse
            </Button>
          </div>
        </div>
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        title="Choose a puzzle"
        description="Pick a layout, mechanic, or community puzzle before you play."
        size="large"
        footer={
          <Button type="button" variant="ghost" onClick={() => setIsOpen(false)}>
            Done
          </Button>
        }
      >
        <div className="space-y-5">
          {groupedOptions.map((group) => (
            <section key={group.id} className="space-y-2">
              <div>
                <h3 className="text-sm font-semibold text-text-primary">
                  {group.title}
                </h3>
                {group.description ? (
                  <p className="mt-0.5 text-xs text-text-muted">{group.description}</p>
                ) : null}
              </div>
              <div className="space-y-2">
                {group.options.map((option) => (
                  <PuzzleOptionCard
                    key={option.value}
                    option={option}
                    isSelected={option.value === value}
                    onSelect={() => handleSelect(option.value)}
                  />
                ))}
              </div>
            </section>
          ))}
        </div>
      </Dialog>
    </>
  );
}
