import { useToastContext } from "@/context/toast-context";

/**
 * Hook for showing ephemeral toast notifications.
 *
 * @example
 * ```tsx
 * const { toast } = useToast();
 * toast({ title: "Move saved", variant: "success" });
 * ```
 */
export function useToast() {
  return useToastContext();
}
