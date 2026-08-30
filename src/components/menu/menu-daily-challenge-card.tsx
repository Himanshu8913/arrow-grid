import { useEffect, useState } from "react";

import { playSfx } from "@/audio";
import { getDailyDateKey } from "@/engine/daily-challenge";
import { useDailyChallengeStore } from "@/state/daily-challenge-store";
import { CalendarIcon } from "@/ui/icons";
import {
  formatDailyChallengeStars,
  formatDailyTimeRemaining,
  getDailyTimeRemainingMs,
} from "@/utils/daily-challenge-display";

export interface MenuDailyChallengeCardProps {
  onPlay: () => void;
  onViewResults: () => void;
  variant?: "default" | "compact";
}

export function MenuDailyChallengeCard({
  onPlay,
  onViewResults,
  variant = "default",
}: MenuDailyChallengeCardProps) {
  const todayResult = useDailyChallengeStore(
    (state) => state.history[getDailyDateKey()] ?? null,
  );
  const [timeRemaining, setTimeRemaining] = useState(() =>
    formatDailyTimeRemaining(getDailyTimeRemainingMs()),
  );
  const completed = Boolean(todayResult);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeRemaining(formatDailyTimeRemaining(getDailyTimeRemainingMs()));
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const handleClick = () => {
    playSfx("click");

    if (completed) {
      onViewResults();
      return;
    }

    onPlay();
  };

  if (variant === "compact") {
    return (
      <button
        type="button"
        className="menu-dashboard__card menu-dashboard__mini-card h-full"
        onClick={handleClick}
        onMouseEnter={() => playSfx("hover")}
      >
        <CalendarIcon size={18} className="text-accent-primary" />
        <p className="mt-2 text-sm font-semibold text-text-primary">Daily Challenge</p>
        <p className="mt-1 text-lg tracking-wide text-warning">
          {completed
            ? formatDailyChallengeStars(todayResult?.stars ?? null)
            : "☆☆☆"}
        </p>
        <p className="mt-2 text-xs font-semibold text-accent-primary">
          {completed ? "View results" : "Play now"}
        </p>
        {!completed ? (
          <p className="mt-1 text-[11px] text-text-muted">{timeRemaining}</p>
        ) : null}
      </button>
    );
  }

  return (
    <button
      type="button"
      className="menu-feature-row menu-interactive-card w-full text-left"
      onClick={handleClick}
      onMouseEnter={() => playSfx("hover")}
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
            <span className="mt-1 block text-xs font-medium text-accent-primary">
              View results
            </span>
          </>
        ) : (
          <>
            <span className="mt-2 block text-sm tracking-wide text-warning">☆☆☆</span>
            <span className="mt-1 block text-xs text-text-muted">{timeRemaining}</span>
          </>
        )}
      </span>
    </button>
  );
}
