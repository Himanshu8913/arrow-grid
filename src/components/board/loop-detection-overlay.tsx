import { LOOP_DETECTION_MS } from "@/constants/animation";
import { cn } from "@/utils/cn";

export interface LoopDetectionOverlayProps {
  className?: string;
}

/**
 * Loop failure feedback with icon and label during loop playback.
 */
export function LoopDetectionOverlay({ className }: LoopDetectionOverlayProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 z-20 flex flex-col items-center justify-center gap-2",
        className,
      )}
      aria-live="polite"
    >
      <span
        className="loop-detected-label flex size-10 items-center justify-center rounded-full border border-danger/40 bg-danger/15 text-lg font-bold text-danger shadow-[var(--shadow-medium)]"
        style={{ animationDuration: `${LOOP_DETECTION_MS}ms` }}
        aria-hidden
      >
        !
      </span>
      <span
        className="loop-detected-label rounded-full border border-warning/40 bg-bg-surface/95 px-4 py-2 text-sm font-semibold uppercase tracking-wide text-warning shadow-[var(--shadow-medium)]"
        style={{ animationDuration: `${LOOP_DETECTION_MS}ms` }}
      >
        Loop Detected
      </span>
    </div>
  );
}
