import { useMemo } from "react";

import { getActiveSeasonalEvent } from "@/utils/seasonal";
import {
  DEFAULT_SEASONAL_PROGRESS,
  useSeasonalStore,
} from "@/state/seasonal-store";
import {
  formatSeasonalCount,
  getSimulatedCommunityProgress,
} from "@/utils/seasonal";
import { Button } from "@/ui/button";
import { Badge } from "@/ui/badge";

export interface SeasonalEventBannerProps {
  onOpenSeasonal: () => void;
}

/**
 * Compact seasonal event callout for the main menu.
 */
export function SeasonalEventBanner({ onOpenSeasonal }: SeasonalEventBannerProps) {
  const event = getActiveSeasonalEvent();
  const progressByEvent = useSeasonalStore((state) => state.progressByEvent);
  const progress = event
    ? (progressByEvent[event.id] ?? DEFAULT_SEASONAL_PROGRESS)
    : DEFAULT_SEASONAL_PROGRESS;

  const community = useMemo(() => {
    if (!event) {
      return null;
    }

    return getSimulatedCommunityProgress(event.id, progress.wins);
  }, [event, progress.wins]);

  if (!event) {
    return null;
  }

  const wins = Math.min(progress.wins, event.challengeTarget);

  return (
    <div className="menu-stagger-item mb-4 rounded-2xl border border-accent-primary/30 bg-accent-primary/10 p-4 text-left">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-accent-primary">
            Seasonal Event
          </p>
          <p className="mt-1 text-lg font-bold text-text-primary">
            {event.emoji} {event.name}
          </p>
          <p className="mt-1 text-xs text-text-muted">{event.tagline}</p>
        </div>
        <Badge variant={progress.rewardClaimed ? "success" : "warning"}>
          {progress.rewardClaimed ? "Done" : `${wins}/${event.challengeTarget}`}
        </Badge>
      </div>

      {community ? (
        <p className="mt-2 text-xs text-text-muted">
          Community goal: {formatSeasonalCount(community.current)} /{" "}
          {formatSeasonalCount(community.target)} puzzles
        </p>
      ) : null}

      <Button type="button" size="sm" className="mt-3 w-full" onClick={onOpenSeasonal}>
        View Event
      </Button>
    </div>
  );
}
