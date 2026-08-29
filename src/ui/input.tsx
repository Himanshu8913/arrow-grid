import { type ComponentProps, useId } from "react";

import { cn } from "@/utils/cn";

export interface InputProps extends ComponentProps<"input"> {
  label?: string;
  hint?: string;
  error?: string;
  wrapperClassName?: string;
}

/**
 * Text input with optional label, hint, and error messaging.
 */
export function Input({
  label,
  hint,
  error,
  className,
  wrapperClassName,
  id,
  disabled,
  ...props
}: InputProps) {
  const generatedId = useId();
  const inputId = id ?? generatedId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const hasError = Boolean(error);

  const describedBy = [hint ? hintId : null, hasError ? errorId : null]
    .filter(Boolean)
    .join(" ");

  return (
    <div className={cn("w-full", wrapperClassName)}>
      {label ? (
        <label
          htmlFor={inputId}
          className="mb-2 block text-left text-sm font-medium text-text-primary"
        >
          {label}
        </label>
      ) : null}

      <input
        id={inputId}
        disabled={disabled}
        aria-invalid={hasError}
        aria-describedby={describedBy || undefined}
        className={cn(
          "h-11 w-full rounded-[10px] border bg-bg-card px-4 text-[15px] text-text-primary",
          "placeholder:text-text-muted",
          "transition-colors duration-200",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
          "disabled:cursor-not-allowed disabled:opacity-50",
          hasError
            ? "border-danger focus-visible:ring-danger"
            : "border-bg-card hover:border-accent-primary/40",
          className,
        )}
        {...props}
      />

      {hint && !hasError ? (
        <p id={hintId} className="mt-2 text-left text-xs text-text-muted">
          {hint}
        </p>
      ) : null}

      {hasError ? (
        <p id={errorId} className="mt-2 text-left text-xs text-danger">
          {error}
        </p>
      ) : null}
    </div>
  );
}
