/**
 * Visual style for toast notifications.
 */
export type ToastVariant = "default" | "success" | "danger" | "warning";

/**
 * A toast item stored in the provider queue.
 */
export interface ToastItem {
  id: string;
  title: string;
  description?: string;
  variant: ToastVariant;
  duration: number;
}

/**
 * Options accepted when enqueueing a new toast.
 */
export interface ToastOptions {
  title: string;
  description?: string;
  variant?: ToastVariant;
  /** Auto-dismiss delay in ms. Use `0` to disable auto-hide. */
  duration?: number;
}
