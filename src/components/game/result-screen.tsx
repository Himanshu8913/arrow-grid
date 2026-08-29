import { useEffect, useRef } from "react";

import { ACHIEVEMENTS } from "@/data/achievements";
import { useEscapeKey } from "@/hooks/use-escape-key";
import type { MatchResultSummary } from "@/types/match-result";
import {
  getPlayerLabel,
  isDailyChallengeMode,
  isPracticeMode,
  isSoloChallengeMode,
} from "@/utils/game-messages";
import {
  formatMatchDuration,
  getResultHeadline,
} from "@/utils/match-rewards";
import { Button } from "@/ui/button";
import { cn } from "@/utils/cn";

export interface ResultScreenProps {
  gameMode: string;
  summary: MatchResultSummary;
  onPlayAgain: () => void;
  onMainMenu: () => void;
}

/**
 * Full-screen match summary shown when a game ends.
 */
export function ResultScreen({
  gameMode,
  summary,
  onPlayAgain,
  onMainMenu,
}: ResultScreenProps) {
  const panelRef = useRef<HTMLDivElement>(null);
  const { game, elapsedSeconds, stars, rewards, unlockedAchievements } =
    summary;
  const headline = getResultHeadline(game, gameMode, stars);
  const isPuzzle = isSoloChallengeMode(gameMode);
  const isWin = rewards.isWin;
  const showPlayAgain = !isDailyChallengeMode(gameMode);

  useEscapeKey(onMainMenu);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const winnerLabel =
    game.status === "won" && game.winner
      ? isPracticeMode(gameMode) && game.winner === "player2"
        ? "AI"
        : getPlayerLabel(game.winner)
      : isPuzzle && game.status === "won"
        ? "You"
        : "—";

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="result-screen-title"
      className="result-backdrop-enter fixed inset-0 z-30 flex items-center justify-center bg-bg-primary/85 p-4 backdrop-blur-sm"
    >
      <div
        ref={panelRef}
        tabIndex={-1}
        className={cn(
          "result-panel-enter w-full max-w-md rounded-3xl border p-5 text-left shadow-[var(--shadow-strong)] outline-none sm:p-6",
          isWin
            ? "border-success/40 bg-bg-surface/95"
            : "border-danger/30 bg-bg-surface/95",
        )}
      >
        <p
          id="result-screen-title"
          className={cn(
            "text-center text-2xl font-bold",
            isWin ? "text-success" : "text-danger",
          )}
        >
          {headline}
        </p>

        {isPuzzle && stars ? (
          <p className="mt-2 text-center text-sm text-text-muted">
            {"★".repeat(stars)}
            {"☆".repeat(3 - stars)}
          </p>
        ) : null}

        <dl className="mt-5 grid grid-cols-2 gap-3 text-sm">
          <ResultStat label="Winner" value={winnerLabel} delayMs={60} />
          <ResultStat label="Score" value={rewards.score} delayMs={90} />
          <ResultStat label="Moves" value={game.movesPlayed} delayMs={120} />
          <ResultStat
            label="Time"
            value={formatMatchDuration(elapsedSeconds)}
            delayMs={150}
          />
          <ResultStat
            label="XP earned"
            value={`+${rewards.xp}`}
            highlight
            delayMs={180}
          />
          <ResultStat
            label="Coins earned"
            value={`+${rewards.coins}`}
            highlight
            delayMs={210}
          />
        </dl>

        {unlockedAchievements.length > 0 ? (
          <div className="result-stat-enter mt-5 rounded-2xl bg-accent-primary/10 p-3" style={{ animationDelay: "240ms" }}>
            <p className="text-xs font-semibold uppercase tracking-wide text-accent-primary">
              Achievements unlocked
            </p>
            <ul className="mt-2 space-y-2">
              {unlockedAchievements.map((achievementId) => {
                const achievement = ACHIEVEMENTS.find(
                  (entry) => entry.id === achievementId,
                );

                if (!achievement) {
                  return null;
                }

                return (
                  <li
                    key={achievementId}
                    className="flex items-center gap-2 text-sm text-text-primary"
                  >
                    <span aria-hidden="true">{achievement.icon}</span>
                    <span>{achievement.title}</span>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}

        <div
          className="result-stat-enter mt-6 flex flex-col gap-3 sm:flex-row"
          style={{ animationDelay: "280ms" }}
        >
          {showPlayAgain ? (
            <Button type="button" className="flex-1" onClick={onPlayAgain}>
              Play again
            </Button>
          ) : null}
          <Button
            type="button"
            variant={showPlayAgain ? "secondary" : "primary"}
            className="flex-1"
            onClick={onMainMenu}
          >
            Main menu
          </Button>
        </div>
      </div>
    </div>
  );
}

function ResultStat({
  label,
  value,
  highlight = false,
  delayMs = 0,
}: {
  label: string;
  value: string | number;
  highlight?: boolean;
  delayMs?: number;
}) {
  return (
    <div
      className="result-stat-enter rounded-xl bg-bg-card/80 px-3 py-2"
      style={{ animationDelay: `${delayMs}ms` }}
    >
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd
        className={cn(
          "mt-1 font-semibold tabular-nums",
          highlight ? "text-accent-primary" : "text-text-primary",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
