import { useMemo, useState } from "react";

import { useCustomPuzzleStore } from "@/state/custom-puzzle-store";
import { Button } from "@/ui/button";
import { Dialog } from "@/ui/dialog";
import {
  SelectionOptionCard,
  SelectionSummaryCard,
  type SelectionOption,
} from "@/ui/selection-picker";
import {
  getGroupedPuzzleOptions,
  getPuzzleCategoryLabel,
  getPuzzleOptionById,
  type PuzzleOptionCategory,
} from "@/utils/puzzle-options";
const CATEGORY_BADGE_VARIANT: Record<
  PuzzleOptionCategory,
  NonNullable<SelectionOption["badgeVariant"]>
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

function toSelectionOption(
  option: ReturnType<typeof getPuzzleOptionById>,
): SelectionOption {
  return {
    value: option.value,
    label: option.label,
    description: option.description,
    badge: getPuzzleCategoryLabel(option.category),
    badgeVariant: CATEGORY_BADGE_VARIANT[option.category],
  };
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
  const selectedOption = useMemo(
    () => toSelectionOption(getPuzzleOptionById(value)),
    [value, puzzles],
  );

  const handleSelect = (nextValue: string) => {
    onValueChange(nextValue);
    setIsOpen(false);
  };

  return (
    <>
      <SelectionSummaryCard
        label="Puzzle"
        option={selectedOption}
        disabled={disabled}
        className={className}
        onAction={() => setIsOpen(true)}
      />

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
                  <SelectionOptionCard
                    key={option.value}
                    option={toSelectionOption(option)}
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
