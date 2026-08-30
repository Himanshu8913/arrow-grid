import { useEffect } from "react";

import { audioManager } from "@/audio";
import { getActiveSeasonalEvent } from "@/utils/seasonal";

/**
 * Applies the active seasonal event to the document root.
 */
export function SeasonalProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const applySeason = () => {
      const event = getActiveSeasonalEvent();
      const root = document.documentElement;

      if (event) {
        root.setAttribute("data-seasonal", event.id);
        audioManager.setMusicProfile(event.musicProfile);
        return;
      }

      root.removeAttribute("data-seasonal");
      audioManager.setMusicProfile("default");
    };

    applySeason();
    const timer = window.setInterval(applySeason, 60_000);

    return () => {
      window.clearInterval(timer);
    };
  }, []);

  return children;
}
