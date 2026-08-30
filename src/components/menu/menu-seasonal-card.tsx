import { useMemo } from "react";

import { playSfx } from "@/audio";
import {
  DEFAULT_SEASONAL_PROGRESS,
  useSeasonalStore,
} from "@/state/seasonal-store";
import { ProgressBar } from "@/ui/progress-bar";
import { getActiveSeasonalEvent } from "@/utils/seasonal";
import { getSeasonalEventTimeRemaining } from "@/utils/seasonal-time";

export interface MenuSeasonalCardProps {
  onOpenSeasonal: () => void;
}

export function MenuSeasonalCard({ onOpenSeasonal }: MenuSeasonalCardProps) {
  const event = getActiveSeasonalEvent();
  const progressByEvent = useSeasonalStore((state) => state.progressByEvent);
  const progress = event
    ? (progressByEvent[event.id] ?? DEFAULT_SEASONAL_PROGRESS)
    : DEFAULT_SEASONAL_PROGRESS;

  const timeLeft = useMemo(
    () => (event ? getSeasonalEventTimeRemaining(event) : null),
    [event],
  );

  if (!event) {
    return null;
  }

  const wins = Math.min(progress.wins, event.challengeTarget);

  return (
    <section className="menu-dashboard__card menu-dashboard__event">
      <div className="menu-dashboard__event-header">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-violet-300">
            Live Event
          </p>
          <p className="mt-1 text-sm font-bold text-text-primary">{event.name}</p>
        </div>
        {timeLeft ? (
          <span className="menu-dashboard__event-timer">{timeLeft}</span>
        ) : null}
      </div>

      <div className="menu-dashboard__event-body">
        <span className="menu-dashboard__event-icon" aria-hidden="true">
          {event.emoji}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-xs text-text-muted">{event.tagline}</p>
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between text-[11px] text-text-muted">
              <span>Community progress</span>
              <span>
                {wins}/{event.challengeTarget}
              </span>
            </div>
            <ProgressBar
              value={wins}
              max={event.challengeTarget}
              variant="secondary"
              size="sm"
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        className="menu-dashboard__claim-btn"
        onClick={() => {
          playSfx("click");
          onOpenSeasonal();
        }}
        onMouseEnter={() => playSfx("hover")}
      >
        {progress.rewardClaimed ? "View event rewards" : "Claim reward"}
      </button>
    </section>
  );
}
