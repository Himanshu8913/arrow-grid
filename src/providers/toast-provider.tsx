import { type ReactNode, useCallback, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

import { ToastContext } from "@/context/toast-context";
import type { ToastItem, ToastOptions } from "@/types/toast";
import { Toast } from "@/ui/toast";

/** Default auto-hide duration per UI_UX.md (3 seconds). */
const DEFAULT_TOAST_DURATION_MS = 3000;

/**
 * Generates a stable unique id for each toast instance.
 */
function createToastId(): string {
  return crypto.randomUUID();
}

interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Global toast queue and viewport. Mount once near the app root.
 *
 * - Enqueues toasts via `useToast`
 * - Auto-dismisses after `duration` (default 3s)
 * - Renders bottom-center on mobile, bottom-right on desktop
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timeoutIdsRef = useRef<Map<string, number>>(new Map());

  /**
   * Clears any pending auto-dismiss timer for a toast id.
   */
  const clearDismissTimer = useCallback((id: string) => {
    const timeoutId = timeoutIdsRef.current.get(id);

    if (timeoutId !== undefined) {
      window.clearTimeout(timeoutId);
      timeoutIdsRef.current.delete(id);
    }
  }, []);

  const dismiss = useCallback(
    (id: string) => {
      clearDismissTimer(id);
      setToasts((current) => current.filter((toast) => toast.id !== id));
    },
    [clearDismissTimer],
  );

  /**
   * Adds a toast to the queue and schedules auto-dismiss when enabled.
   *
   * @returns The generated toast id (useful for manual dismissal).
   */
  const toast = useCallback(
    (options: ToastOptions) => {
      const id = createToastId();
      const duration = options.duration ?? DEFAULT_TOAST_DURATION_MS;

      const nextToast: ToastItem = {
        id,
        title: options.title,
        description: options.description,
        variant: options.variant ?? "default",
        duration,
      };

      setToasts((current) => [...current, nextToast]);

      if (duration > 0) {
        const timeoutId = window.setTimeout(() => {
          dismiss(id);
        }, duration);

        timeoutIdsRef.current.set(id, timeoutId);
      }

      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      toast,
      dismiss,
    }),
    [toast, dismiss],
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      {createPortal(
        <div
          aria-label="Notifications"
          className="pointer-events-none fixed bottom-4 left-4 right-4 z-[60] flex flex-col items-center gap-2 sm:left-auto sm:right-4 sm:w-full sm:max-w-sm sm:items-end"
        >
          {toasts.map((item) => (
            <Toast key={item.id} toast={item} onDismiss={dismiss} />
          ))}
        </div>,
        document.body,
      )}
    </ToastContext.Provider>
  );
}
