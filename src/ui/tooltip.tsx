import { type ReactNode, useId, useRef, useState } from "react";

import { cn } from "@/utils/cn";

const sideStyles = {
  top: "bottom-full left-1/2 mb-2 -translate-x-1/2",
  bottom: "top-full left-1/2 mt-2 -translate-x-1/2",
  left: "right-full top-1/2 mr-2 -translate-y-1/2",
  right: "left-full top-1/2 ml-2 -translate-y-1/2",
} as const;

export type TooltipSide = keyof typeof sideStyles;

export interface TooltipProps {
  /** Tooltip text shown on hover or keyboard focus. */
  content: string;
  side?: TooltipSide;
  /** Delay before showing the tooltip, in milliseconds. */
  delayMs?: number;
  children: ReactNode;
}

/**
 * Lightweight tooltip for supplementary control hints.
 * Opens on hover and when a focusable child receives keyboard focus.
 */
export function Tooltip({
  content,
  side = "top",
  delayMs = 150,
  children,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const showTimeoutRef = useRef<number | undefined>(undefined);
  const tooltipId = useId();

  const showTooltip = () => {
    window.clearTimeout(showTimeoutRef.current);
    showTimeoutRef.current = window.setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const hideTooltip = () => {
    window.clearTimeout(showTimeoutRef.current);
    setIsVisible(false);
  };

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocusCapture={showTooltip}
      onBlurCapture={hideTooltip}
    >
      {children}

      {isVisible ? (
        <span
          id={tooltipId}
          role="tooltip"
          className={cn(
            "tooltip-enter pointer-events-none absolute z-50",
            "max-w-xs rounded-lg bg-bg-card px-2.5 py-1.5 text-xs font-medium text-text-primary",
            "shadow-[0_8px_24px_rgba(0,0,0,0.25)]",
            sideStyles[side],
          )}
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
