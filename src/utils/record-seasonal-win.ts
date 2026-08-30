import { getActiveSeasonalEvent } from "@/utils/seasonal";
import { useSeasonalStore } from "@/state/seasonal-store";
import type { SeasonalRewardResult } from "@/state/seasonal-store";

/**
 * Records a win toward the active seasonal challenge when applicable.
 */
export function recordSeasonalWinIfActive(): SeasonalRewardResult | null {
  const event = getActiveSeasonalEvent();

  if (!event) {
    return null;
  }

  return useSeasonalStore.getState().recordWin(event.id);
}
