import { useEffect } from "react";

import { useCosmeticsStore } from "@/state/cosmetics-store";

/**
 * Applies equipped cosmetic ids to the document root for CSS targeting.
 */
export function CosmeticsProvider({ children }: { children: React.ReactNode }) {
  const equipped = useCosmeticsStore((state) => state.equipped);
  const syncAchievementUnlocks = useCosmeticsStore(
    (state) => state.syncAchievementUnlocks,
  );

  useEffect(() => {
    syncAchievementUnlocks();
  }, [syncAchievementUnlocks]);

  useEffect(() => {
    const root = document.documentElement;

    root.setAttribute("data-cosmetic-board", equipped.board);
    root.setAttribute("data-cosmetic-orb", equipped.orb);
    root.setAttribute("data-cosmetic-arrow", equipped.arrow);
    root.setAttribute("data-cosmetic-frame", equipped.frame);
    root.setAttribute("data-cosmetic-title", equipped.title);
  }, [equipped]);

  return children;
}
