import { type ComponentProps } from "react";

import { cn } from "@/utils/cn";

const variantStyles = {
  default: "bg-bg-card",
  surface: "bg-bg-surface",
  outline: "border border-bg-card bg-transparent",
} as const;

const paddingStyles = {
  none: "",
  sm: "p-4",
  md: "p-6",
  lg: "p-8",
} as const;

export type CardVariant = keyof typeof variantStyles;
export type CardPadding = keyof typeof paddingStyles;

export interface CardProps extends ComponentProps<"div"> {
  variant?: CardVariant;
  padding?: CardPadding;
  interactive?: boolean;
}

export function Card({
  variant = "default",
  padding = "md",
  interactive = false,
  className,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl shadow-[0_8px_24px_rgba(0,0,0,0.15)]",
        "transition-all duration-200 ease-out",
        interactive &&
          "hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.2)]",
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
      {...props}
    />
  );
}

export function CardHeader({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn("mb-4 flex flex-col gap-1 text-center", className)}
      {...props}
    />
  );
}

export function CardTitle({ className, ...props }: ComponentProps<"h2">) {
  return (
    <h2
      className={cn(
        "text-4xl font-bold tracking-tight text-text-primary sm:text-5xl",
        className,
      )}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-text-muted", className)} {...props} />;
}

export function CardContent({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn(className)} {...props} />;
}

export function CardFooter({ className, ...props }: ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "mt-6 flex flex-wrap items-center justify-center gap-3",
        className,
      )}
      {...props}
    />
  );
}
