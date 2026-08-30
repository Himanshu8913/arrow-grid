import { useEffect, useState } from "react";

import { playSfx } from "@/audio";
import { getDailyDateKey } from "@/engine/daily-challenge";
import { useDailyChallengeStore } from "@/state/daily-challenge-store";
import { useStatisticsStore } from "@/state/statistics-store";
import { CalendarIcon, ChevronRightIcon } from "@/ui/icons";
import {
  formatDailyChallengeStars,
  formatDailyTimeRemaining,
  getDailyTimeRemainingMs,
} from "@/utils/daily-challenge-display";
import { formatDailyDateLabel } from "@/utils/daily-challenge";

export interface MenuDailyChallengeCardProps {
  onPlay: () => void;
  onViewResults: () => void;
}

/**
 * Rich daily challenge card for the home screen.
 */
export function MenuDailyChallengeCard({
  onPlay,
  onViewResults,
}: MenuDailyChallengeCardProps) {
  const todayResult = useDailyChallengeStore(
    (state) => state.history[getDailyDateKey()] ?? null,
  );
  const bestScore = useStatisticsStore((state) => state.stats.bestScore);
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
            <span className="mt-1 block text-xs text-text-muted">
              {formatDailyDateLabel(getDailyDateKey())}
            </span>
            <span className="mt-2 block text-sm tracking-wide text-warning">
              ☆☆☆
            </span>
            <span className="mt-1 block text-xs text-text-muted">{timeRemaining}</span>
            <span className="mt-1 block text-xs text-text-muted">
              Best score · {bestScore}
            </span>
          </>
        )}
      </span>
      <ChevronRightIcon size={16} className="text-text-muted" />
    </button>
  );
}
