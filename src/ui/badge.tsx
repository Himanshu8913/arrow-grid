import { type ComponentProps } from "react";

import { cn } from "@/utils/cn";

const variantStyles = {
  default: "bg-bg-card text-text-primary",
  primary: "bg-accent-primary/20 text-accent-primary",
  secondary: "bg-accent-secondary/20 text-accent-secondary",
  success: "bg-success/20 text-success",
  danger: "bg-danger/20 text-danger",
  warning: "bg-warning/20 text-warning",
  outline: "border border-bg-card bg-transparent text-text-muted",
} as const;

const sizeStyles = {
  sm: "px-2 py-0.5 text-xs",
  md: "px-2.5 py-1 text-sm",
} as const;

export type BadgeVariant = keyof typeof variantStyles;
export type BadgeSize = keyof typeof sizeStyles;

export interface BadgeProps extends ComponentProps<"span"> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

/**
 * Compact label for status, categories, or metadata.
 */
export function Badge({
  variant = "default",
  size = "sm",
  className,
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}
