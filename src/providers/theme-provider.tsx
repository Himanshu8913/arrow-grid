import { type ReactNode, useEffect, useMemo, useState } from "react";

import { THEME_STORAGE_KEY } from "@/constants/theme";
import { ThemeContext } from "@/context/theme-context";
import type { ThemeMode } from "@/types/theme";

/**
 * Reads the persisted theme or falls back to the OS color scheme preference.
 */
function getInitialTheme(): ThemeMode {
  const storedTheme = localStorage.getItem(THEME_STORAGE_KEY);

  if (storedTheme === "light" || storedTheme === "dark") {
    return storedTheme;
  }

  return window.matchMedia("(prefers-color-scheme: light)").matches
    ? "light"
    : "dark";
}

/**
 * Applies the active theme to the document root for CSS token switching.
 */
function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
}

interface ThemeProviderProps {
  children: ReactNode;
}

/**
 * Provides theme state and syncs `data-theme` + localStorage.
 */
export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setThemeState] = useState<ThemeMode>(() => getInitialTheme());

  useEffect(() => {
    applyTheme(theme);
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = (nextTheme: ThemeMode) => {
    setThemeState(nextTheme);
  };

  const toggleTheme = () => {
    setThemeState((current) => (current === "dark" ? "light" : "dark"));
  };

  const value = useMemo(
    () => ({
      theme,
      setTheme,
      toggleTheme,
    }),
    [theme],
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
}
