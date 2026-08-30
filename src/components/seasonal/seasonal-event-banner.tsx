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
import { Badge } from "@/ui/badge";
import { cn } from "@/utils/cn";

export interface SeasonalEventBannerProps {
  onOpenSeasonal: () => void;
  compact?: boolean;
}

/**
 * Seasonal event callout for the main menu.
 */
export function SeasonalEventBanner({
  onOpenSeasonal,
  compact = false,
}: SeasonalEventBannerProps) {
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
  const percent = Math.min(100, (wins / event.challengeTarget) * 100);

  if (compact) {
    return (
      <button
        type="button"
        className={cn(
          "menu-stagger-item w-full rounded-2xl border border-accent-primary/25 bg-gradient-to-r",
          "from-accent-primary/15 to-accent-secondary/10 p-3 text-left transition",
          "hover:border-accent-primary/40 active:scale-[0.99]",
        )}
        onClick={onOpenSeasonal}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold uppercase tracking-wide text-accent-primary">
              Live event
            </p>
            <p className="mt-0.5 truncate text-sm font-semibold text-text-primary">
              {event.emoji} {event.name}
            </p>
          </div>
          <Badge variant={progress.rewardClaimed ? "success" : "warning"}>
            {progress.rewardClaimed ? "Done" : `${wins}/${event.challengeTarget}`}
          </Badge>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-bg-primary/50">
          <div
            className="h-full rounded-full bg-accent-primary transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
      </button>
    );
  }

  return (
    <div className="menu-stagger-item rounded-2xl border border-accent-primary/30 bg-accent-primary/10 p-4 text-left">
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

      <button
        type="button"
        className="mt-3 text-sm font-semibold text-accent-primary hover:underline"
        onClick={onOpenSeasonal}
      >
        View event details →
      </button>
    </div>
  );
}
