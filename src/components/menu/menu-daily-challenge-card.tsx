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
  variant?: "default" | "compact";
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

export function MenuDailyChallengeCard({
  onPlay,
  variant = "default",
}: MenuDailyChallengeCardProps) {
  const { todayResult, completed, isPlayable, timeLabel } =
    useDailyChallengeAvailability();

  const handleClick = () => {
    if (!isPlayable) {
      return;
    }

    playSfx("click");
    onPlay();
  };

  if (variant === "compact") {
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

  return (
    <button
      type="button"
      className={cn(
        "menu-feature-row w-full text-left",
        isPlayable && "menu-interactive-card",
        !isPlayable && "menu-dashboard__mini-card--disabled cursor-not-allowed opacity-75",
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
      <span className="menu-feature-icon" aria-hidden="true">
        <CalendarIcon size={18} />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-text-primary">
          {completed ? "Daily Challenge" : "Today's Challenge"}
        </span>
        {completed ? (
          <>
            <span className="mt-1 block text-xs text-success">
              Completed · {formatDailyChallengeStars(todayResult?.stars ?? null)}
            </span>
            <span className="mt-1 block text-xs tabular-nums text-text-muted">
              {timeLabel}
            </span>
          </>
        ) : (
          <>
            <span className="mt-2 block text-sm tracking-wide text-warning">☆☆☆</span>
            <span className="mt-1 block text-xs tabular-nums text-text-muted">
              {timeLabel}
            </span>
          </>
        )}
      </span>
    </button>
  );
}
