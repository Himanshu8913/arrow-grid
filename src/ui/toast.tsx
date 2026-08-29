import { type ComponentProps } from "react";

import type { ToastItem, ToastVariant } from "@/types/toast";
import { cn } from "@/utils/cn";

const variantStyles: Record<ToastVariant, string> = {
  default: "border-bg-card bg-bg-card",
  success: "border-success/40 bg-bg-card",
  danger: "border-danger/40 bg-bg-card",
  warning: "border-warning/40 bg-bg-card",
};

const indicatorStyles: Record<ToastVariant, string> = {
  default: "bg-accent-primary",
  success: "bg-success",
  danger: "bg-danger",
  warning: "bg-warning",
};

export interface ToastProps extends ComponentProps<"div"> {
  toast: ToastItem;
  onDismiss: (id: string) => void;
}

/**
 * Renders a single toast notification with variant styling and dismiss control.
 */
export function Toast({ toast, onDismiss, className, ...props }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "toast-enter pointer-events-auto flex w-full gap-3 rounded-2xl border p-4 shadow-[0_12px_32px_rgba(0,0,0,0.25)]",
        variantStyles[toast.variant],
        className,
      )}
      {...props}
    >
      <span
        aria-hidden="true"
        className={cn(
          "mt-1 size-2 shrink-0 rounded-full",
          indicatorStyles[toast.variant],
        )}
      />

      <div className="min-w-0 flex-1 text-left">
        <p className="font-semibold text-text-primary">{toast.title}</p>
        {toast.description ? (
          <p className="mt-1 text-sm text-text-muted">{toast.description}</p>
        ) : null}
      </div>

      <button
        type="button"
        aria-label="Dismiss notification"
        className="shrink-0 rounded-md px-1 text-text-muted transition-colors hover:text-text-primary"
        onClick={() => onDismiss(toast.id)}
      >
        ✕
      </button>
    </div>
  );
}
