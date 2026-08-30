import { type ReactNode, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { cn } from "@/utils/cn";

export type TooltipSide = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content: string;
  side?: TooltipSide;
  delayMs?: number;
  children: ReactNode;
}

/**
 * Tooltip anchored to its trigger, portaled to avoid clipping.
 */
export function Tooltip({
  content,
  side = "top",
  delayMs = 200,
  children,
}: TooltipProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const showTimeoutRef = useRef<number | undefined>(undefined);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipId = useId();

  const updatePosition = () => {
    const trigger = triggerRef.current;

    if (!trigger) {
      return;
    }

    const rect = trigger.getBoundingClientRect();

    let top = rect.top;
    let left = rect.left;

    if (side === "top") {
      top = rect.top - 8;
      left = rect.left + rect.width / 2;
    } else if (side === "bottom") {
      top = rect.bottom + 8;
      left = rect.left + rect.width / 2;
    } else if (side === "left") {
      top = rect.top + rect.height / 2;
      left = rect.left - 8;
    } else {
      top = rect.top + rect.height / 2;
      left = rect.right + 8;
    }

    setPosition({ top, left });
  };

  const showTooltip = () => {
    window.clearTimeout(showTimeoutRef.current);
    showTimeoutRef.current = window.setTimeout(() => {
      updatePosition();
      setIsVisible(true);
    }, delayMs);
  };

  const hideTooltip = () => {
    window.clearTimeout(showTimeoutRef.current);
    setIsVisible(false);
  };

  const transform =
    side === "top"
      ? "translate(-50%, -100%)"
      : side === "bottom"
        ? "translate(-50%, 0)"
        : side === "left"
          ? "translate(-100%, -50%)"
          : "translate(0, -50%)";

  return (
    <span
      ref={triggerRef}
      className="inline-flex"
      onMouseEnter={showTooltip}
      onMouseLeave={hideTooltip}
      onFocusCapture={showTooltip}
      onBlurCapture={hideTooltip}
    >
      {children}

      {isVisible
        ? createPortal(
            <span
              id={tooltipId}
              role="tooltip"
              style={{
                position: "fixed",
                top: position.top,
                left: position.left,
                transform,
              }}
              className={cn(
                "tooltip-fade-in pointer-events-none z-[200]",
                "whitespace-nowrap rounded-lg border border-bg-card/80 bg-bg-surface px-3 py-1.5",
                "text-xs font-medium text-text-primary shadow-[0_8px_24px_rgba(0,0,0,0.28)]",
              )}
            >
              {content}
            </span>,
            document.body,
          )
        : null}
    </span>
  );
}
