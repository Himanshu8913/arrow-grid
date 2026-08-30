import { getAppName } from "@/constants/app";
import { MenuBackground } from "@/components/menu/menu-background";
import { SeasonalEventBanner } from "@/components/seasonal/seasonal-event-banner";
import { getCosmeticById } from "@/data/cosmetics";
import { getDailyDateKey } from "@/engine/daily-challenge";
import { useCosmeticsStore } from "@/state/cosmetics-store";
import { useDailyChallengeStore } from "@/state/daily-challenge-store";
import { useProfileStore } from "@/state/profile-store";
import { useProgressStore } from "@/state/progress-store";
import { formatDailyDateLabel, formatDailyStars } from "@/utils/daily-challenge";
import { getEquippedFrameClassName } from "@/utils/cosmetic-styles";
import { getPlayerLevel } from "@/utils/player-level";
import { Avatar } from "@/ui/avatar";
import { Badge } from "@/ui/badge";
import { cn } from "@/utils/cn";

export interface MainMenuProps {
  onPlay: () => void;
  onDailyChallenge: () => void;
  onContinue: () => void;
  onOpenEditor: () => void;
  onOpenCommunity: () => void;
  onOpenSeasonal: () => void;
  onOpenSettings: () => void;
  onOpenStatistics: () => void;
  onOpenAchievements: () => void;
  onOpenCosmetics: () => void;
  onOpenProfile: () => void;
  onOpenCredits: () => void;
  onExit: () => void;
}

const QUICK_LINKS = [
  { label: "Settings", icon: "⚙️", action: "settings" as const },
  { label: "Stats", icon: "📊", action: "statistics" as const },
  { label: "Awards", icon: "🏆", action: "achievements" as const },
  { label: "Style", icon: "✨", action: "cosmetics" as const },
  { label: "Credits", icon: "ℹ️", action: "credits" as const },
] as const;

/**
 * Landing screen with a focused play-first layout and grouped secondary actions.
 */
export function MainMenu({
  onPlay,
  onDailyChallenge,
  onContinue,
  onOpenEditor,
  onOpenCommunity,
  onOpenSeasonal,
  onOpenSettings,
  onOpenStatistics,
  onOpenAchievements,
  onOpenCosmetics,
  onOpenProfile,
  onOpenCredits,
  onExit,
}: MainMenuProps) {
  const displayName = useProfileStore((state) => state.displayName);
  const totalCoins = useProfileStore((state) => state.totalCoins);
  const totalXp = useProfileStore((state) => state.totalXp);
  const equippedFrameId = useCosmeticsStore((state) => state.equipped.frame);
  const equippedTitleId = useCosmeticsStore((state) => state.equipped.title);
  const playerLevel = getPlayerLevel(totalXp);
  const frameClassName = getEquippedFrameClassName(equippedFrameId);
  const playerTitle =
    equippedTitleId === "title-default"
      ? null
      : (getCosmeticById(equippedTitleId)?.name ?? null);
  const activeMatch = useProgressStore((state) => state.activeMatch);
  const todayResult = useDailyChallengeStore(
    (state) => state.history[getDailyDateKey()] ?? null,
  );
  const canContinue = activeMatch?.game.status === "in-progress";
  const dailyCompleted = Boolean(todayResult);
  const appName = getAppName();

  const quickLinkHandlers = {
    settings: onOpenSettings,
    statistics: onOpenStatistics,
    achievements: onOpenAchievements,
    cosmetics: onOpenCosmetics,
    credits: onOpenCredits,
  } as const;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-6 sm:px-6">
      <MenuBackground />

      <div className="menu-home relative z-10 w-full max-w-[420px]">
        <header className="menu-hero-enter mb-5 flex items-start justify-between gap-4">
          <button
            type="button"
            className="flex min-w-0 flex-1 items-center gap-3 rounded-2xl border border-transparent p-1 text-left transition hover:border-bg-card/60 hover:bg-bg-surface/40"
            onClick={onOpenProfile}
          >
            <Avatar
              alt={displayName || "Guest Player"}
              name={displayName || "Guest Player"}
              size="md"
              className={frameClassName}
            />
            <div className="min-w-0">
              <p className="text-xs font-medium uppercase tracking-[0.18em] text-accent-primary">
                {appName}
              </p>
              <p className="truncate text-lg font-bold text-text-primary">
                {displayName || "Guest Player"}
              </p>
              <p className="truncate text-xs text-text-muted">
                Level {playerLevel}
                {playerTitle ? ` · ${playerTitle}` : ""}
              </p>
            </div>
          </button>
          <Badge variant="warning" className="shrink-0 tabular-nums">
            {totalCoins} coins
          </Badge>
        </header>

        <div className="menu-home-panel menu-stagger rounded-[28px] border border-white/10 bg-bg-surface/75 p-4 shadow-[var(--shadow-strong)] backdrop-blur-md sm:p-5">
          <SeasonalEventBanner compact onOpenSeasonal={onOpenSeasonal} />

          <div className="menu-stagger-item mt-4 space-y-3">
            <button
              type="button"
              className="menu-play-cta group w-full rounded-2xl bg-accent-primary px-5 py-4 text-left shadow-[0_12px_32px_rgba(59,130,246,0.28)] transition hover:bg-accent-primary/92 active:scale-[0.99]"
              onClick={onPlay}
            >
              <span className="block text-lg font-bold text-white">Play</span>
              <span className="mt-0.5 block text-sm text-white/80">
                VS AI, puzzle mode, or quick match
              </span>
            </button>

            <MenuFeatureRow
              title="Daily Challenge"
              description={
                dailyCompleted
                  ? `Completed · ${formatDailyStars(todayResult!.stars)}`
                  : formatDailyDateLabel(getDailyDateKey())
              }
              icon="📅"
              disabled={dailyCompleted}
              onClick={onDailyChallenge}
            />

            {canContinue ? (
              <MenuFeatureRow
                title="Continue"
                description="Resume your saved match"
                icon="▶️"
                onClick={onContinue}
              />
            ) : null}
          </div>

          <div className="menu-home-divider menu-stagger-item my-4" />

          <div className="menu-stagger-item grid grid-cols-2 gap-3">
            <MenuTile
              title="Create"
              description="Puzzle editor"
              icon="✏️"
              onClick={onOpenEditor}
            />
            <MenuTile
              title="Community"
              description="Shared puzzles"
              icon="🌐"
              onClick={onOpenCommunity}
            />
          </div>

          <div className="menu-home-divider menu-stagger-item my-4" />

          <nav
            aria-label="Quick links"
            className="menu-stagger-item grid grid-cols-5 gap-1"
          >
            {QUICK_LINKS.map((link) => (
              <button
                key={link.action}
                type="button"
                className="menu-quick-link flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-center transition hover:bg-bg-card/70"
                onClick={quickLinkHandlers[link.action]}
              >
                <span className="text-lg" aria-hidden="true">
                  {link.icon}
                </span>
                <span className="text-[10px] font-medium leading-tight text-text-muted">
                  {link.label}
                </span>
              </button>
            ))}
          </nav>
        </div>

        <button
          type="button"
          className="menu-stagger-item mx-auto mt-4 block text-xs text-text-muted transition hover:text-danger"
          onClick={onExit}
        >
          Exit game
        </button>
      </div>
    </div>
  );
}

function MenuFeatureRow({
  title,
  description,
  icon,
  disabled = false,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  disabled?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      className={cn(
        "menu-feature-row flex w-full items-center gap-3 rounded-2xl border border-bg-card/80 bg-bg-card/50 px-4 py-3 text-left transition",
        "hover:border-accent-primary/30 hover:bg-bg-card/80 active:scale-[0.99]",
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:border-bg-card/80 disabled:hover:bg-bg-card/50",
      )}
      onClick={onClick}
    >
      <span
        className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-bg-surface text-lg"
        aria-hidden="true"
      >
        {icon}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-text-primary">{title}</span>
        <span className="mt-0.5 block truncate text-xs text-text-muted">
          {description}
        </span>
      </span>
      <span className="text-sm text-text-muted" aria-hidden="true">
        ›
      </span>
    </button>
  );
}

function MenuTile({
  title,
  description,
  icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="menu-tile flex flex-col items-start rounded-2xl border border-bg-card/80 bg-bg-card/50 p-4 text-left transition hover:border-accent-primary/25 hover:bg-bg-card/80 active:scale-[0.99]"
      onClick={onClick}
    >
      <span className="text-xl" aria-hidden="true">
        {icon}
      </span>
      <span className="mt-3 text-sm font-semibold text-text-primary">{title}</span>
      <span className="mt-0.5 text-xs text-text-muted">{description}</span>
    </button>
  );
}
