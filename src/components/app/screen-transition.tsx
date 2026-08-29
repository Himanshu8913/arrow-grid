import { type ReactNode } from "react";

import { cn } from "@/utils/cn";

export interface ScreenTransitionProps {
  screenKey: string;
  children: ReactNode;
  className?: string;
}

/**
 * Fade-and-scale entrance when switching between top-level app screens.
 */
export function ScreenTransition({
  screenKey,
  children,
  className,
}: ScreenTransitionProps) {
  return (
    <div key={screenKey} className={cn("screen-enter min-h-dvh", className)}>
      {children}
    </div>
  );
}
