import { useEffect, useState } from "react";

import { playSfx } from "@/audio";
import { getDailyDateKey } from "@/engine/daily-challenge";
import { useDailyChallengeStore } from "@/state/daily-challenge-store";
import { CalendarIcon } from "@/ui/icons";
import { cn } from "@/utils/cn";
import {
  formatDailyAvailabilityCountdown,
  formatDailyChallengeStars,
  formatDailyTimeRemaining,
  getDailyTimeRemainingMs,
} from "@/utils/daily-challenge-display";

export interface MenuDailyChallengeCardProps {
  onPlay: () => void;
}

function useDailyChallengeAvailability() {
  const todayResult = useDailyChallengeStore(
    (state) => state.history[getDailyDateKey()] ?? null,
  );
  const completed = Boolean(todayResult);
  const [remainingMs, setRemainingMs] = useState(() => getDailyTimeRemainingMs());

  useEffect(() => {
    const tick = () => setRemainingMs(getDailyTimeRemainingMs());
    tick();

    const interval = window.setInterval(tick, completed ? 1000 : 60_000);

    return () => window.clearInterval(interval);
  }, [completed]);

  return {
    todayResult,
    completed,
    isPlayable: !completed,
    timeLabel: completed
      ? formatDailyAvailabilityCountdown(remainingMs)
      : formatDailyTimeRemaining(remainingMs),
  };
}

export function MenuDailyChallengeCard({ onPlay }: MenuDailyChallengeCardProps) {
  const { todayResult, completed, isPlayable, timeLabel } =
    useDailyChallengeAvailability();

  const handleClick = () => {
    if (!isPlayable) {
      return;
    }

    playSfx("click");
    onPlay();
  };

  return (
    <button
      type="button"
      className={cn(
        "menu-dashboard__card menu-dashboard__mini-card h-full",
        isPlayable && "menu-interactive-card",
        !isPlayable && "menu-dashboard__mini-card--disabled",
      )}
      disabled={!isPlayable}
      aria-disabled={!isPlayable}
      onClick={handleClick}
      onMouseEnter={() => {
        if (isPlayable) {
          playSfx("hover");
        }
      }}
    >
      <CalendarIcon
        size={18}
        className={isPlayable ? "text-accent-primary" : "text-text-muted"}
      />
      <p className="mt-2 text-sm font-semibold text-text-primary">Daily Challenge</p>
      <p className="mt-1 text-lg tracking-wide text-warning">
        {completed
          ? formatDailyChallengeStars(todayResult?.stars ?? null)
          : "☆☆☆"}
      </p>
      <p
        className={cn(
          "mt-2 text-xs font-semibold",
          isPlayable ? "text-accent-primary" : "text-text-muted",
        )}
      >
        {isPlayable ? "Play now" : "Completed today"}
      </p>
      <p className="mt-1 text-[11px] tabular-nums text-text-muted">{timeLabel}</p>
    </button>
  );
}
