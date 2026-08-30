import { useAchievementStore } from "@/state/achievement-store";
import { useProgressStore } from "@/state/progress-store";
import { useStatisticsStore } from "@/state/statistics-store";
import { ProgressBar } from "@/ui/progress-bar";
import { getAchievementSpotlight } from "@/utils/home-achievement-spotlight";
import { getNextLevelPreview } from "@/utils/home-reward-preview";
import { getRecentPuzzleLabel } from "@/utils/home-continue";
import { getAverageMoves } from "@/types/statistics";
import { useProfileStore } from "@/state/profile-store";

export interface MenuHomeInsightsProps {
  layout?: "stack" | "dashboard" | "sidebar";
}

/**
 * Recent activity and progression highlights for the home screen.
 */
export function MenuHomeInsights({ layout = "stack" }: MenuHomeInsightsProps) {
  const stats = useStatisticsStore((state) => state.stats);
  const unlockedIds = useAchievementStore((state) => state.unlockedIds);
  const totalXp = useProfileStore((state) => state.totalXp);
  const selectedPuzzleId = useProgressStore((state) => state.selectedPuzzleId);
  const spotlight = getAchievementSpotlight(unlockedIds, stats);
  const nextLevel = getNextLevelPreview(totalXp);
  const winRate =
    stats.gamesPlayed > 0 ? Math.round((stats.wins / stats.gamesPlayed) * 100) : 0;

  if (layout === "dashboard" || layout === "sidebar") {
    return (
      <div
        className={
          layout === "sidebar"
            ? "menu-dashboard__insights menu-dashboard__insights--sidebar"
            : "menu-dashboard__insights"
        }
      >
        <section className="menu-dashboard__card menu-dashboard__insight">
          <p className="menu-insight-card__title">Recent activity</p>
          <div className="mt-3 space-y-2 text-xs">
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-muted">Last puzzle</span>
              <span className="font-semibold text-text-primary">
                {getRecentPuzzleLabel(selectedPuzzleId)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-muted">Win rate</span>
              <span className="font-semibold text-text-primary">{winRate}%</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-muted">Games played</span>
              <span className="font-semibold text-text-primary">{stats.gamesPlayed}</span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <span className="text-text-muted">Avg moves</span>
              <span className="font-semibold text-text-primary">
                {getAverageMoves(stats)}
              </span>
            </div>
          </div>
        </section>

        {spotlight ? (
          <section className="menu-dashboard__card menu-dashboard__insight">
            <p className="menu-insight-card__title">Achievement spotlight</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">{spotlight.title}</p>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[11px] text-text-muted">
                <span>Progress</span>
                <span>
                  {spotlight.current} / {spotlight.target}
                </span>
              </div>
              <ProgressBar
                value={spotlight.current}
                max={spotlight.target}
                variant="warning"
                size="sm"
              />
            </div>
          </section>
        ) : (
          <section className="menu-dashboard__card menu-dashboard__insight">
            <p className="menu-insight-card__title">Achievement spotlight</p>
            <p className="mt-2 text-xs text-text-muted">All tracked achievements unlocked.</p>
          </section>
        )}

        <section className="menu-dashboard__card menu-dashboard__insight">
          <p className="menu-insight-card__title">Next reward</p>
          <p className="mt-1 text-sm font-semibold text-text-primary">{nextLevel.label}</p>
          <p className="mt-1 text-xs text-text-muted">{nextLevel.description}</p>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-text-muted">
              <span>XP progress</span>
              <span>{nextLevel.progressPercent}%</span>
            </div>
            <ProgressBar
              value={nextLevel.progressPercent}
              max={100}
              variant="primary"
              size="sm"
            />
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <section className="menu-insight-card">
        <p className="menu-insight-card__title">Recent activity</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
          <div>
            <p className="text-text-muted">Recent puzzle</p>
            <p className="mt-1 font-semibold text-text-primary">
              {getRecentPuzzleLabel(selectedPuzzleId)}
            </p>
          </div>
          <div>
            <p className="text-text-muted">Win rate</p>
            <p className="mt-1 font-semibold text-text-primary">{winRate}%</p>
          </div>
          <div>
            <p className="text-text-muted">Games played</p>
            <p className="mt-1 font-semibold text-text-primary">{stats.gamesPlayed}</p>
          </div>
          <div>
            <p className="text-text-muted">Avg moves</p>
            <p className="mt-1 font-semibold text-text-primary">
              {getAverageMoves(stats)}
            </p>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {spotlight ? (
          <section className="menu-insight-card">
            <p className="menu-insight-card__title">Achievement spotlight</p>
            <p className="mt-1 text-sm font-semibold text-text-primary">
              {spotlight.title}
            </p>
            <p className="mt-1 text-xs text-text-muted">{spotlight.description}</p>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-[11px] text-text-muted">
                <span>Progress</span>
                <span>
                  {spotlight.current} / {spotlight.target}
                </span>
              </div>
              <ProgressBar
                value={spotlight.current}
                max={spotlight.target}
                variant="warning"
                size="sm"
              />
            </div>
          </section>
        ) : null}

        <section className="menu-insight-card">
          <p className="menu-insight-card__title">Next reward</p>
          <p className="mt-1 text-sm font-semibold text-text-primary">
            {nextLevel.label}
          </p>
          <p className="mt-1 text-xs text-text-muted">{nextLevel.description}</p>
          <div className="mt-3">
            <div className="mb-1 flex items-center justify-between text-[11px] text-text-muted">
              <span>XP to next level</span>
              <span>{nextLevel.progressPercent}%</span>
            </div>
            <ProgressBar
              value={nextLevel.progressPercent}
              max={100}
              variant="primary"
              size="sm"
            />
          </div>
        </section>
      </div>
    </div>
  );
}
