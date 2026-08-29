import { useThemeContext } from "@/context/theme-context";

/**
 * Hook for reading and updating the global color theme.
 */
export function useTheme() {
  return useThemeContext();
}
