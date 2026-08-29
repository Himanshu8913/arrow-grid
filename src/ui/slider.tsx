import { cn } from "@/utils/cn";

export interface SliderProps {
  label: string;
  value: number;
  min?: number;
  max?: number;
  step?: number;
  formatValue?: (value: number) => string;
  onChange: (value: number) => void;
  className?: string;
}

/**
 * Accessible range input for volume and similar settings.
 */
export function Slider({
  label,
  value,
  min = 0,
  max = 1,
  step = 0.05,
  formatValue = (nextValue) => `${Math.round(nextValue * 100)}%`,
  onChange,
  className,
}: SliderProps) {
  return (
    <label className={cn("block space-y-2 text-left", className)}>
      <div className="flex items-center justify-between gap-3 text-sm">
        <span className="font-medium text-text-primary">{label}</span>
        <span className="tabular-nums text-text-muted">{formatValue(value)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(event) => onChange(Number(event.target.value))}
        className="h-2 w-full cursor-pointer accent-accent-primary"
      />
    </label>
  );
}
