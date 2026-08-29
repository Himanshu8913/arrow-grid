import { createContext, useContext } from "react";

import type { ToastOptions } from "@/types/toast";

export interface ToastContextValue {
  toast: (options: ToastOptions) => string;
  dismiss: (id: string) => void;
}

export const ToastContext = createContext<ToastContextValue | null>(null);

/**
 * Access the global toast API from any descendant of `ToastProvider`.
 *
 * @throws If called outside of `ToastProvider`.
 */
export function useToastContext(): ToastContextValue {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
}
