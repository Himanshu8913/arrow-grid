import { type ComponentProps } from "react";

import { cn } from "@/utils/cn";

const variantStyles = {
  primary:
    "bg-accent-primary text-text-primary shadow-[0_8px_24px_rgba(59,130,246,0.25)] hover:bg-accent-primary/90 hover:shadow-[0_12px_32px_rgba(59,130,246,0.35)]",
  secondary:
    "bg-bg-card text-text-primary shadow-[0_8px_24px_rgba(0,0,0,0.15)] hover:bg-bg-card/90 hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)]",
  ghost:
    "border border-bg-card bg-transparent text-text-primary hover:bg-bg-card/50",
  danger:
    "bg-danger text-text-primary shadow-[0_8px_24px_rgba(239,68,68,0.25)] hover:bg-danger/90 hover:shadow-[0_12px_32px_rgba(239,68,68,0.35)]",
} as const;

const sizeStyles = {
  sm: "h-9 px-3.5 text-sm",
  md: "h-11 px-5 text-[15px]",
  lg: "h-12 px-6 text-base",
} as const;

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps extends ComponentProps<"button"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export function Button({
  variant = "primary",
  size = "md",
  isLoading = false,
  className,
  children,
  disabled,
  type = "button",
  ...props
}: ButtonProps) {
  const isDisabled = disabled ?? isLoading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={isLoading}
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-[14px] font-semibold",
        "transition-all duration-200 ease-out",
        "hover:-translate-y-0.5 active:scale-95 active:translate-y-0",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent-primary focus-visible:ring-offset-2 focus-visible:ring-offset-bg-primary",
        "disabled:pointer-events-none disabled:translate-y-0 disabled:scale-100 disabled:opacity-50 disabled:shadow-none",
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <span
            aria-hidden="true"
            className="size-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          />
          <span>{children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
