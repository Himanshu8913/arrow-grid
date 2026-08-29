import { ACHIEVEMENTS } from "@/data/achievements";
import {
  getAchievementCompletionPercent,
  useAchievementStore,
} from "@/state/achievement-store";
import { ProgressBar } from "@/ui/progress-bar";
import { cn } from "@/utils/cn";

/**
 * Displays unlocked and locked achievements on the profile tab.
 */
export function AchievementsPanel({ embedded = false }: { embedded?: boolean }) {
  const unlockedIds = useAchievementStore((state) => state.unlockedIds);
  const completionPercent = getAchievementCompletionPercent(unlockedIds);

  return (
    <div className="space-y-3 rounded-2xl border border-bg-card bg-bg-card p-4 text-left">
      {!embedded ? (
        <div>
          <p className="text-sm font-semibold text-text-primary">Achievements</p>
          <p className="text-xs text-text-muted">
            {unlockedIds.length} of {ACHIEVEMENTS.length} unlocked
          </p>
        </div>
      ) : null}

      <ProgressBar
        value={completionPercent}
        max={100}
        label="Completion"
        showValue
        size="sm"
      />

      {unlockedIds.length === 0 ? (
        <p className="rounded-xl bg-bg-surface/70 px-3 py-4 text-sm text-text-muted">
          No achievements yet. Play your first match to unlock one.
        </p>
      ) : null}

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {ACHIEVEMENTS.map((achievement) => {
          const isUnlocked = unlockedIds.includes(achievement.id);

          return (
            <article
              key={achievement.id}
              className={cn(
                "rounded-xl border px-3 py-3 transition-colors",
                isUnlocked
                  ? "border-accent-primary/40 bg-accent-primary/10"
                  : "border-bg-surface bg-bg-surface/50 opacity-70",
              )}
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={cn(
                    "text-2xl",
                    !isUnlocked && "grayscale",
                  )}
                >
                  {achievement.icon}
                </span>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-text-primary">
                    {achievement.title}
                  </h3>
                  <p className="mt-1 text-xs text-text-muted">
                    {achievement.description}
                  </p>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
