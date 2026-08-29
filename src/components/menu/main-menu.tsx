import { MenuBackground } from "@/components/menu/menu-background";
import { getDailyDateKey } from "@/engine/daily-challenge";
import { useDailyChallengeStore } from "@/state/daily-challenge-store";
import { useProfileStore } from "@/state/profile-store";
import { useProgressStore } from "@/state/progress-store";
import { formatDailyDateLabel, formatDailyStars } from "@/utils/daily-challenge";
import { Button } from "@/ui/button";
import { cn } from "@/utils/cn";

export interface MainMenuProps {
  onPlay: () => void;
  onDailyChallenge: () => void;
  onContinue: () => void;
  onOpenSettings: () => void;
  onOpenStatistics: () => void;
  onOpenAchievements: () => void;
  onOpenCredits: () => void;
  onExit: () => void;
}

/**
 * Polished landing screen with primary navigation actions.
 */
export function MainMenu({
  onPlay,
  onDailyChallenge,
  onContinue,
  onOpenSettings,
  onOpenStatistics,
  onOpenAchievements,
  onOpenCredits,
  onExit,
}: MainMenuProps) {
  const displayName = useProfileStore((state) => state.displayName);
  const activeMatch = useProgressStore((state) => state.activeMatch);
  const todayResult = useDailyChallengeStore(
    (state) => state.history[getDailyDateKey()] ?? null,
  );
  const canContinue = activeMatch?.game.status === "in-progress";
  const dailyHint = todayResult
    ? `Completed today · ${formatDailyStars(todayResult.stars)}`
    : `Today's puzzle · ${formatDailyDateLabel(getDailyDateKey())}`;
  const appName = import.meta.env.VITE_APP_NAME ?? "Arrow Grid";

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden p-4 sm:p-6">
      <MenuBackground />

      <div className="relative z-10 w-full max-w-md">
        <div className="menu-hero-enter mb-8 text-center">
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-accent-primary">
            Strategy Puzzle
          </p>
          <h1 className="mt-2 text-4xl font-bold tracking-tight text-text-primary sm:text-5xl">
            {appName}
          </h1>
          <p className="mt-3 text-sm text-text-muted sm:text-base">
            Welcome back, {displayName || "Guest Player"}
          </p>
        </div>

        <nav
          aria-label="Main menu"
          className="menu-stagger flex flex-col gap-3 rounded-3xl border border-bg-card/60 bg-bg-surface/80 p-4 shadow-[var(--shadow-strong)] backdrop-blur-sm sm:p-5"
        >
          <MenuButton label="Play" onClick={onPlay} />
          <MenuButton
            label="Daily Challenge"
            variant="secondary"
            hint={dailyHint}
            disabled={Boolean(todayResult)}
            onClick={onDailyChallenge}
          />
          <MenuButton
            label="Continue"
            variant="secondary"
            disabled={!canContinue}
            hint={
              canContinue
                ? "Resume your saved match"
                : "No saved match in progress"
            }
            onClick={onContinue}
          />
          <MenuButton
            label="Settings"
            variant="ghost"
            onClick={onOpenSettings}
          />
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <MenuButton
              label="Statistics"
              variant="ghost"
              onClick={onOpenStatistics}
            />
            <MenuButton
              label="Achievements"
              variant="ghost"
              onClick={onOpenAchievements}
            />
          </div>
          <MenuButton label="Credits" variant="ghost" onClick={onOpenCredits} />
          <MenuButton label="Exit" variant="danger" onClick={onExit} />
        </nav>
      </div>
    </div>
  );
}

function MenuButton({
  label,
  hint,
  variant = "primary",
  disabled = false,
  onClick,
}: {
  label: string;
  hint?: string;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <div className="menu-stagger-item text-left">
      <Button
        type="button"
        variant={variant}
        size="lg"
        disabled={disabled}
        className={cn("w-full justify-center")}
        onClick={onClick}
      >
        {label}
      </Button>
      {hint ? (
        <p className="mt-1 px-1 text-center text-xs text-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}
