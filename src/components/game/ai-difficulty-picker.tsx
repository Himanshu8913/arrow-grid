import {
  AI_DIFFICULTY_SELECTION_OPTIONS,
  getAiDifficultyOption,
  type AiDifficulty,
} from "@/constants/ai";
import {
  SelectionOptionCard,
  SelectionPickerField,
} from "@/ui/selection-picker";
import { cn } from "@/utils/cn";

export interface AiDifficultyPickerProps {
  value: AiDifficulty;
  onValueChange: (value: AiDifficulty) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Inline AI difficulty selector with tier descriptions.
 */
export function AiDifficultyPicker({
  value,
  onValueChange,
  disabled = false,
  className,
}: AiDifficultyPickerProps) {
  const selectedOption = getAiDifficultyOption(value);

  return (
    <SelectionPickerField
      label="AI difficulty"
      description="Tune how tough your practice opponent plays."
      className={className}
    >
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {AI_DIFFICULTY_SELECTION_OPTIONS.map((option) => (
          <SelectionOptionCard
            key={option.value}
            option={option}
            layout="tile"
            disabled={disabled}
            isSelected={option.value === value}
            onSelect={() => onValueChange(option.value as AiDifficulty)}
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
