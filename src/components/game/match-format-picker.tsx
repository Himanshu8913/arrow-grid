import {
  DEFAULT_MATCH_FORMAT,
  getMatchFormatOption,
  MATCH_FORMAT_OPTIONS,
  type MatchFormat,
} from "@/constants/match-format";
import {
  SelectionOptionCard,
  SelectionPickerField,
} from "@/ui/selection-picker";
import { cn } from "@/utils/cn";

export interface MatchFormatPickerProps {
  value: MatchFormat;
  onValueChange: (value: MatchFormat) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Chooses how many rounds are played in a versus match.
 */
export function MatchFormatPicker({
  value = DEFAULT_MATCH_FORMAT,
  onValueChange,
  disabled = false,
  className,
}: MatchFormatPickerProps) {
  const selectedOption = getMatchFormatOption(value);

  return (
    <SelectionPickerField
      label="Match length"
      description="How many round wins are needed to finish the match."
      className={className}
    >
      <div className="grid grid-cols-3 gap-2">
        {MATCH_FORMAT_OPTIONS.map((option) => (
          <SelectionOptionCard
            key={option.value}
            option={{
              value: String(option.value),
              label: option.label,
              description: option.description,
              icon: option.icon,
            }}
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
