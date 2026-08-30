import { playSfx } from "@/audio";
import { getCosmeticById } from "@/data/cosmetics";
import { useCosmeticsStore } from "@/state/cosmetics-store";
import { useProfileStore } from "@/state/profile-store";
import { Avatar } from "@/ui/avatar";
import { ProgressBar } from "@/ui/progress-bar";
import { FlameIcon } from "@/ui/icons";
import { getEquippedFrameClassName } from "@/utils/cosmetic-styles";
import { getHomeGreeting } from "@/utils/home-greeting";
import { getPlayerLevel, getXpProgressInLevel } from "@/utils/player-level";
import { cn } from "@/utils/cn";

export interface MenuProfileHeaderProps {
  streak: number;
  onOpenProfile: () => void;
}

/**
 * Enhanced profile header with greeting, XP progress, and streak.
 */
export function MenuProfileHeader({
  streak,
  onOpenProfile,
}: MenuProfileHeaderProps) {
  const displayName = useProfileStore((state) => state.displayName);
  const totalCoins = useProfileStore((state) => state.totalCoins);
  const totalXp = useProfileStore((state) => state.totalXp);
  const equippedFrameId = useCosmeticsStore((state) => state.equipped.frame);
  const equippedTitleId = useCosmeticsStore((state) => state.equipped.title);
  const greeting = getHomeGreeting();
  const playerLevel = getPlayerLevel(totalXp);
  const xpProgress = getXpProgressInLevel(totalXp);
  const xpPercent = Math.round((xpProgress.current / xpProgress.max) * 100);
  const frameClassName = getEquippedFrameClassName(equippedFrameId);
  const playerTitle =
    equippedTitleId === "title-default"
      ? null
      : (getCosmeticById(equippedTitleId)?.name ?? null);

  return (
    <header className="menu-hero-enter mb-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-primary">
            {greeting.title}
          </p>
          <p className="mt-1 text-sm text-text-muted">{greeting.subtitle}</p>
        </div>
        <span className="menu-coins-badge shrink-0 tabular-nums">{totalCoins} coins</span>
      </div>

      <button
        type="button"
        className="menu-profile-card group w-full text-left"
        onClick={onOpenProfile}
        onMouseEnter={() => playSfx("hover")}
      >
        <div className="flex items-start gap-3">
          <Avatar
            alt={displayName || "Guest Player"}
            name={displayName || "Guest Player"}
            size="md"
            className={frameClassName}
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-lg font-bold text-text-primary">
              {displayName || "Guest Player"}
            </p>
            <p className="truncate text-xs text-text-muted">
              Level {playerLevel}
              {playerTitle ? ` · ${playerTitle}` : ""}
            </p>
            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between gap-2 text-[11px] font-medium text-text-muted">
                <span>Level {playerLevel}</span>
                <span className="tabular-nums">{xpPercent}%</span>
              </div>
              <ProgressBar
                value={xpProgress.current}
                max={xpProgress.max}
                variant="primary"
                size="sm"
                className="menu-xp-progress"
              />
            </div>
            <p
              className={cn(
                "mt-3 inline-flex items-center gap-1.5 text-xs font-medium",
                streak > 0 ? "text-warning" : "text-text-muted",
              )}
            >
              <FlameIcon size={14} />
              {streak > 0
                ? `${streak} day streak`
                : "Start a daily streak today"}
            </p>
          </div>
        </div>
      </button>
    </header>
  );
}
