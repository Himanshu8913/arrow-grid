import { GAME_MODE_OPTIONS, getGameModeOption } from "@/utils/game-mode-options";
import {
  SelectionOptionCard,
  SelectionPickerField,
} from "@/ui/selection-picker";
import { cn } from "@/utils/cn";

export interface GameModePickerProps {
  value: string;
  onValueChange: (value: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Inline game mode selector with descriptive mode cards.
 */
export function GameModePicker({
  value,
  onValueChange,
  disabled = false,
  className,
}: GameModePickerProps) {
  const selectedOption = getGameModeOption(value);

  return (
    <SelectionPickerField
      label="Game mode"
      description="Choose how you want to play before dealing a board."
      className={className}
    >
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
        {GAME_MODE_OPTIONS.map((option) => (
          <SelectionOptionCard
            key={option.value}
            option={option}
            layout="tile"
            disabled={disabled}
            isSelected={option.value === value}
            onSelect={() => onValueChange(option.value)}
          />
        ))}
      </div>
      <p
        className={cn(
          "mt-3 rounded-2xl border border-bg-card/70 bg-bg-card/25 px-3 py-2 text-xs leading-relaxed text-text-muted",
          disabled && "opacity-60",
        )}
      >
        <span className="font-semibold text-text-primary">{selectedOption.label}</span>
        {" — "}
        {selectedOption.description}
      </p>
    </SelectionPickerField>
  );
}
