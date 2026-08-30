import type { ReactNode } from "react";

import { playSfx } from "@/audio";
import { MenuBackground } from "@/components/menu/menu-background";
import { MenuCommunityHighlight } from "@/components/menu/menu-community-highlight";
import { MenuDailyChallengeCard } from "@/components/menu/menu-daily-challenge-card";
import { MenuGameplayPreview } from "@/components/menu/menu-gameplay-preview";
import { MenuHomeInsights } from "@/components/menu/menu-home-insights";
import { MenuProfileHeader } from "@/components/menu/menu-profile-header";
import { SeasonalEventBanner } from "@/components/seasonal/seasonal-event-banner";
import { useDailyChallengeStore } from "@/state/daily-challenge-store";
import { useProgressStore } from "@/state/progress-store";
import { getContinueMatchSummary } from "@/utils/home-continue";
import { getDailyChallengeStreak } from "@/utils/daily-challenge-display";
import {
  BarChartIcon,
  GlobeIcon,
  InfoIcon,
  PencilIcon,
  PlayIcon,
  SettingsIcon,
  SparklesIcon,
  TrophyIcon,
} from "@/ui/icons";

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
  { label: "Settings", Icon: SettingsIcon, action: "settings" as const },
  { label: "Stats", Icon: BarChartIcon, action: "statistics" as const },
  { label: "Awards", Icon: TrophyIcon, action: "achievements" as const },
  { label: "Style", Icon: SparklesIcon, action: "cosmetics" as const },
  { label: "Credits", Icon: InfoIcon, action: "credits" as const },
] as const;

/**
 * Premium game launcher home screen with live preview and progression highlights.
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
  const activeMatch = useProgressStore((state) => state.activeMatch);
  const dailyHistory = useDailyChallengeStore((state) => state.history);
  const canContinue = activeMatch?.game.status === "in-progress";
  const continueSummary = canContinue && activeMatch
    ? getContinueMatchSummary(activeMatch)
    : null;
  const dailyStreak = getDailyChallengeStreak(dailyHistory);

  const quickLinkHandlers = {
    settings: onOpenSettings,
    statistics: onOpenStatistics,
    achievements: onOpenAchievements,
    cosmetics: onOpenCosmetics,
    credits: onOpenCredits,
  } as const;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden px-4 py-6 sm:px-6 md:items-start md:py-8 lg:px-10">
      <MenuBackground />

      <div className="menu-home relative z-10 w-full max-w-[90rem]">
        <div className="menu-home-layout grid w-full items-start gap-5 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:gap-6 xl:gap-8">
          <div className="menu-home-main min-w-0">
            <MenuProfileHeader streak={dailyStreak} onOpenProfile={onOpenProfile} />

            <div className="menu-home-panel menu-stagger rounded-[28px] border border-white/10 bg-bg-surface/75 p-4 shadow-[var(--shadow-strong)] backdrop-blur-md sm:p-5">
              <SeasonalEventBanner compact onOpenSeasonal={onOpenSeasonal} />

              <div className="menu-stagger-item mt-4 space-y-3">
                {canContinue && continueSummary ? (
                  <button
                    type="button"
                    className="menu-play-hero group w-full text-left"
                    onClick={() => {
                      playSfx("click");
                      onContinue();
                    }}
                    onMouseEnter={() => playSfx("hover")}
                  >
                    <span className="menu-play-hero__shine" aria-hidden="true" />
                    <span className="menu-play-hero__icon" aria-hidden="true">
                      <PlayIcon size={22} />
                    </span>
                    <span className="relative z-[1] block">
                      <span className="block text-2xl font-bold tracking-tight text-white">
                        {continueSummary.title}
                      </span>
                      <span className="mt-1 block text-sm font-semibold text-white/90">
                        {continueSummary.subtitle}
                      </span>
                      <span className="mt-1 block text-sm text-white/75">
                        {continueSummary.detail}
                      </span>
                    </span>
                  </button>
                ) : (
                  <button
                    type="button"
                    className="menu-play-hero group w-full text-left"
                    onClick={() => {
                      playSfx("click");
                      onPlay();
                    }}
                    onMouseEnter={() => playSfx("hover")}
                  >
                    <span className="menu-play-hero__shine" aria-hidden="true" />
                    <span className="menu-play-hero__icon" aria-hidden="true">
                      <PlayIcon size={22} />
                    </span>
                    <span className="relative z-[1] block">
                      <span className="block text-2xl font-bold tracking-tight text-white">
                        Play
                      </span>
                      <span className="mt-1 block text-sm text-white/85">
                        Continue your journey
                      </span>
                      <span className="mt-0.5 block text-xs text-white/70">
                        VS AI, puzzle mode, or quick match
                      </span>
                    </span>
                  </button>
                )}

                {canContinue ? (
                  <button
                    type="button"
                    className="menu-secondary-cta w-full"
                    onClick={() => {
                      playSfx("click");
                      onPlay();
                    }}
                    onMouseEnter={() => playSfx("hover")}
                  >
                    Start a new game instead
                  </button>
                ) : null}

                <MenuDailyChallengeCard
                  onPlay={onDailyChallenge}
                  onViewResults={onOpenStatistics}
                />

                <MenuHomeInsights />

                <MenuCommunityHighlight onOpenCommunity={onOpenCommunity} />
              </div>

              <div className="menu-home-divider menu-stagger-item my-4" />

              <div className="menu-stagger-item grid grid-cols-2 gap-3">
                <MenuTile
                  title="Create"
                  description="Puzzle editor"
                  icon={<PencilIcon size={20} />}
                  onClick={onOpenEditor}
                />
                <MenuTile
                  title="Community"
                  description="Shared puzzles"
                  icon={<GlobeIcon size={20} />}
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
                    className="menu-quick-link menu-interactive-card flex flex-col items-center gap-1.5 rounded-xl px-1 py-2.5 text-center"
                    onClick={() => {
                      playSfx("click");
                      quickLinkHandlers[link.action]();
                    }}
                    onMouseEnter={() => playSfx("hover")}
                  >
                    <link.Icon size={18} className="text-accent-primary" />
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

          <div className="menu-stagger-item hidden w-full min-w-0 md:block">
            <MenuGameplayPreview />
          </div>
        </div>

        <div className="menu-stagger-item mt-4 md:hidden">
          <MenuGameplayPreview />
        </div>
      </div>
    </div>
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
  icon: ReactNode;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="menu-tile menu-interactive-card flex flex-col items-start rounded-2xl border border-bg-card/80 bg-bg-card/50 p-4 text-left"
      onClick={() => {
        playSfx("click");
        onClick();
      }}
      onMouseEnter={() => playSfx("hover")}
    >
      <span className="menu-feature-icon" aria-hidden="true">
        {icon}
      </span>
      <span className="mt-3 text-sm font-semibold text-text-primary">{title}</span>
      <span className="mt-0.5 text-xs text-text-muted">{description}</span>
    </button>
  );
}
