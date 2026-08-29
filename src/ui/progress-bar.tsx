import { type ComponentProps, useId } from "react";

import { getProgressPercentage } from "@/utils/progress";
import { cn } from "@/utils/cn";

const variantStyles = {
  primary: "bg-accent-primary",
  secondary: "bg-accent-secondary",
  success: "bg-success",
  warning: "bg-warning",
  danger: "bg-danger",
} as const;

const sizeStyles = {
  sm: "h-1.5",
  md: "h-2.5",
} as const;

export type ProgressBarVariant = keyof typeof variantStyles;
export type ProgressBarSize = keyof typeof sizeStyles;

export interface ProgressBarProps extends ComponentProps<"div"> {
  /** Current progress value. */
  value: number;
  /** Maximum progress value. Defaults to `100`. */
  max?: number;
  variant?: ProgressBarVariant;
  size?: ProgressBarSize;
  /** Optional label shown above the bar. */
  label?: string;
  /** When true, displays `value / max` on the right. */
  showValue?: boolean;
}

/**
 * Accessible horizontal progress indicator for XP, loading, or completion states.
 */
export function ProgressBar({
  value,
  max = 100,
  variant = "primary",
  size = "md",
  label,
  showValue = false,
  className,
  ...props
}: ProgressBarProps) {
  const labelId = useId();
  const percentage = getProgressPercentage(value, max);
  const hasLabel = Boolean(label);

  return (
    <div className={cn("w-full", className)} {...props}>
      {(hasLabel || showValue) && (
        <div className="mb-2 flex items-center justify-between gap-3 text-sm">
          {hasLabel ? (
            <span id={labelId} className="font-medium text-text-primary">
              {label}
            </span>
          ) : (
            <span />
          )}
          {showValue ? (
            <span className="text-text-muted">
              {Math.round(value)} / {Math.round(max)}
            </span>
          ) : null}
        </div>
      )}

      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        aria-labelledby={hasLabel ? labelId : undefined}
        className={cn(
          "w-full overflow-hidden rounded-full bg-bg-card",
          sizeStyles[size],
        )}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-300 ease-out",
            variantStyles[variant],
          )}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}
