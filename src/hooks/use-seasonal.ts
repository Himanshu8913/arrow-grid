import { getActiveSeasonalEvent } from "@/utils/seasonal";
import type {
  SeasonalParticleVariant,
  SeasonalVictoryVariant,
} from "@/types/seasonal";

export function useActiveSeasonalEvent() {
  return getActiveSeasonalEvent();
}

export function useSeasonalParticleVariant(): SeasonalParticleVariant {
  return getActiveSeasonalEvent()?.particleVariant ?? "default";
}

export function useSeasonalVictoryVariant(): SeasonalVictoryVariant {
  return getActiveSeasonalEvent()?.victoryVariant ?? "default";
}
