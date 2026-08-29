import { cn } from "@/utils/cn";

const sizeStyles = {
  sm: {
    orb: "size-8",
    dot: "size-1.5",
    bar: "h-1 w-24",
    label: "text-xs",
  },
  md: {
    orb: "size-12",
    dot: "size-2",
    bar: "h-1.5 w-32",
    label: "text-sm",
  },
  lg: {
    orb: "size-16",
    dot: "size-2.5",
    bar: "h-2 w-40",
    label: "text-base",
  },
} as const;

export type LoaderVariant = "orb" | "dots" | "bar";
export type LoaderSize = keyof typeof sizeStyles;

export interface LoaderProps {
  variant?: LoaderVariant;
  size?: LoaderSize;
  label?: string;
  className?: string;
}

export interface LoaderOverlayProps {
  label?: string;
  className?: string;
}

/**
 * Pulsing orb loader inspired by the in-game energy orb.
 * Uses layered rings instead of a plain spinner.
 */
function OrbLoader({
  size,
  className,
}: {
  size: LoaderSize;
  className?: string;
}) {
  return (
    <div
      className={cn("relative", sizeStyles[size].orb, className)}
      aria-hidden="true"
    >
      <span className="loader-orb-ring absolute inset-0 rounded-full bg-accent-primary/30" />
      <span className="loader-orb-ring loader-orb-ring-delayed absolute inset-2 rounded-full bg-accent-secondary/40" />
      <span className="absolute inset-[35%] rounded-full bg-accent-primary shadow-[0_0_24px_rgba(59,130,246,0.6)]" />
    </div>
  );
}

/**
 * Three-dot loader with staggered bounce timing.
 */
function DotsLoader({
  size,
  className,
}: {
  size: LoaderSize;
  className?: string;
}) {
  return (
    <div className={cn("flex items-center gap-2", className)} aria-hidden="true">
      {[0, 1, 2].map((index) => (
        <span
          key={index}
          className={cn(
            "loader-dot rounded-full bg-accent-primary",
            sizeStyles[size].dot,
          )}
          style={{ animationDelay: `${index * 150}ms` }}
        />
      ))}
    </div>
  );
}

/**
 * Indeterminate progress bar with a sliding highlight.
 */
function BarLoader({
  size,
  className,
}: {
  size: LoaderSize;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "overflow-hidden rounded-full bg-bg-card",
        sizeStyles[size].bar,
        className,
      )}
      aria-hidden="true"
    >
      <div className="loader-bar-highlight h-full w-1/3 rounded-full bg-accent-primary" />
    </div>
  );
}

/**
 * Accessible loading indicator with multiple visual styles.
 */
export function Loader({
  variant = "orb",
  size = "md",
  label = "Loading",
  className,
}: LoaderProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      aria-label={label}
      className={cn("flex flex-col items-center gap-3", className)}
    >
      {variant === "orb" ? <OrbLoader size={size} /> : null}
      {variant === "dots" ? <DotsLoader size={size} /> : null}
      {variant === "bar" ? <BarLoader size={size} /> : null}

      {label ? (
        <p
          className={cn(
            "font-medium text-text-muted",
            sizeStyles[size].label,
          )}
        >
          {label}
        </p>
      ) : null}
    </div>
  );
}

/**
 * Centers a {@link Loader} over its parent. Parent must be `position: relative`.
 */
export function LoaderOverlay({
  label = "Loading",
  className,
}: LoaderOverlayProps) {
  return (
    <div
      className={cn(
        "absolute inset-0 z-10 flex items-center justify-center rounded-2xl",
        "bg-bg-surface/80 backdrop-blur-sm",
        className,
      )}
    >
      <Loader label={label} size="lg" variant="orb" />
    </div>
  );
}
