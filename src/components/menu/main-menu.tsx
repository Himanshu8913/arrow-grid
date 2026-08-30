import { playSfx } from "@/audio";
import { MenuBackground } from "@/components/menu/menu-background";
import { MenuBottomNav } from "@/components/menu/menu-bottom-nav";
import { MenuCommunityMiniCard } from "@/components/menu/menu-community-mini-card";
import { MenuContinueCard } from "@/components/menu/menu-continue-card";
import { MenuDailyChallengeCard } from "@/components/menu/menu-daily-challenge-card";
import { MenuGameplayPreview } from "@/components/menu/menu-gameplay-preview";
import { MenuHomeInsights } from "@/components/menu/menu-home-insights";
import { MenuProfileCard } from "@/components/menu/menu-profile-card";
import { MenuSeasonalCard } from "@/components/menu/menu-seasonal-card";
import { MenuTopBar } from "@/components/menu/menu-top-bar";
import { useDailyChallengeStore } from "@/state/daily-challenge-store";
import { useProgressStore } from "@/state/progress-store";
import { getContinueMatchSummary } from "@/utils/home-continue";
import { getDailyChallengeStreak } from "@/utils/daily-challenge-display";

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

/**
 * Premium dashboard-style home screen matching the game launcher mockup.
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
  const continueSummary =
    canContinue && activeMatch ? getContinueMatchSummary(activeMatch) : null;
  const dailyStreak = getDailyChallengeStreak(dailyHistory);

  return (
    <div className="menu-dashboard relative min-h-dvh px-4 py-4 sm:px-6 lg:px-8">
      <MenuBackground />

      <div className="menu-dashboard__shell menu-hero-enter relative z-10 mx-auto w-full max-w-[90rem]">
        <MenuTopBar onOpenSettings={onOpenSettings} />

        <div className="menu-dashboard__layout">
          <aside className="menu-dashboard__sidebar menu-stagger">
            <div className="menu-stagger-item">
              <MenuProfileCard streak={dailyStreak} onOpenProfile={onOpenProfile} />
            </div>
            <div className="menu-stagger-item">
              <MenuSeasonalCard onOpenSeasonal={onOpenSeasonal} />
            </div>
            <div className="menu-stagger-item">
              <MenuContinueCard
                canContinue={canContinue}
                continueSummary={continueSummary}
                activeMatch={activeMatch}
                onContinue={onContinue}
                onPlay={onPlay}
              />
            </div>

            {canContinue ? (
              <button
                type="button"
                className="menu-stagger-item w-full text-center text-xs font-medium text-text-muted transition hover:text-accent-primary"
                onClick={() => {
                  playSfx("click");
                  onPlay();
                }}
                onMouseEnter={() => playSfx("hover")}
              >
                Start a new game instead
              </button>
            ) : null}

            <div className="menu-dashboard__mini-grid menu-stagger-item">
              <MenuDailyChallengeCard
                variant="compact"
                onPlay={onDailyChallenge}
              />
              <MenuCommunityMiniCard onOpenCommunity={onOpenCommunity} />
            </div>

            <div className="menu-stagger-item">
              <MenuHomeInsights layout="sidebar" />
            </div>
          </aside>

          <section className="menu-dashboard__hero menu-stagger-item">
            <MenuGameplayPreview variant="hero" />
          </section>
        </div>

        <div className="flex items-center justify-center gap-4 pt-2 text-xs text-text-muted">
          <button
            type="button"
            className="transition hover:text-text-primary"
            onClick={() => {
              playSfx("click");
              onOpenCredits();
            }}
          >
            Credits
          </button>
          <span aria-hidden="true">·</span>
          <button
            type="button"
            className="transition hover:text-danger"
            onClick={onExit}
          >
            Exit game
          </button>
        </div>
      </div>

      <MenuBottomNav
        onOpenStatistics={onOpenStatistics}
        onOpenAchievements={onOpenAchievements}
        onOpenCosmetics={onOpenCosmetics}
        onOpenEditor={onOpenEditor}
      />
    </div>
  );
}
