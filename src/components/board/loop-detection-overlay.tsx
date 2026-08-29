import { LOOP_DETECTION_MS } from "@/constants/animation";
import { cn } from "@/utils/cn";

export interface LoopDetectionOverlayProps {
  className?: string;
}

/**
 * Centered loop failure label shown during loop detection playback.
 */
export function LoopDetectionOverlay({ className }: LoopDetectionOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-20 flex items-center justify-center",
        className,
      )}
      aria-live="polite"
    >
      <span
        className="loop-detected-label rounded-full border border-warning/40 bg-bg-surface/95 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-warning shadow-[var(--shadow-medium)]"
        style={{ animationDuration: `${LOOP_DETECTION_MS}ms` }}
      >
        Loop Detected
      </span>
    </div>
  );
}
