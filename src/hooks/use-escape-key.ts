import { useEffect } from "react";

export function useEscapeKey(onEscape: () => void, isEnabled = true) {
  useEffect(() => {
    if (!isEnabled) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape();
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isEnabled, onEscape]);
}
