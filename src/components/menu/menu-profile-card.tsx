import { playSfx } from "@/audio";
import { getCosmeticById } from "@/data/cosmetics";
import { useCosmeticsStore } from "@/state/cosmetics-store";
import { useProfileStore } from "@/state/profile-store";
import { Avatar } from "@/ui/avatar";
import { ProgressBar } from "@/ui/progress-bar";
import { FlameIcon } from "@/ui/icons";
import { getEquippedFrameClassName } from "@/utils/cosmetic-styles";
import { getPlayerLevel, getXpProgressInLevel } from "@/utils/player-level";

export interface MenuProfileCardProps {
  streak: number;
  onOpenProfile: () => void;
}

export function MenuProfileCard({ streak, onOpenProfile }: MenuProfileCardProps) {
  const displayName = useProfileStore((state) => state.displayName);
  const totalCoins = useProfileStore((state) => state.totalCoins);
  const totalXp = useProfileStore((state) => state.totalXp);
  const equippedFrameId = useCosmeticsStore((state) => state.equipped.frame);
  const equippedTitleId = useCosmeticsStore((state) => state.equipped.title);
  const playerLevel = getPlayerLevel(totalXp);
  const xpProgress = getXpProgressInLevel(totalXp);
  const frameClassName = getEquippedFrameClassName(equippedFrameId);
  const rankLabel =
    equippedTitleId === "title-default"
      ? `Level ${playerLevel}`
      : (getCosmeticById(equippedTitleId)?.name ?? `Level ${playerLevel}`);

  return (
    <button
      type="button"
      className="menu-dashboard__card menu-dashboard__profile w-full text-left"
      onClick={() => {
        playSfx("click");
        onOpenProfile();
      }}
      onMouseEnter={() => playSfx("hover")}
    >
      <div className="menu-dashboard__profile-top">
        <Avatar
          alt={displayName || "Guest Player"}
          name={displayName || "Guest Player"}
          size="md"
          className={frameClassName}
        />
        <div className="min-w-0 flex-1">
          <p className="menu-dashboard__profile-name">
            {displayName || "Guest Player"}
            <span className="menu-dashboard__profile-edit" aria-hidden="true">
              ✎
            </span>
          </p>
          <div className="mt-2">
            <div className="mb-1 flex items-center justify-between text-[11px] font-medium text-text-muted">
              <span>Level {playerLevel}</span>
              <span className="tabular-nums">
                {xpProgress.current.toLocaleString()} / {xpProgress.max.toLocaleString()} XP
              </span>
            </div>
            <ProgressBar
              value={xpProgress.current}
              max={xpProgress.max}
              variant="primary"
              size="sm"
              className="menu-xp-progress"
            />
          </div>
        </div>
      </div>

      <div className="menu-dashboard__stat-row">
        <div className="menu-dashboard__stat-chip">
          <p className="menu-dashboard__stat-chip-label">Coins</p>
          <p className="menu-dashboard__stat-chip-value tabular-nums">{totalCoins}</p>
        </div>
        <div className="menu-dashboard__stat-chip">
          <p className="menu-dashboard__stat-chip-label">Streak</p>
          <p className="menu-dashboard__stat-chip-value inline-flex items-center justify-center gap-1">
            <FlameIcon size={12} />
            {streak > 0 ? `${streak} days` : "Start"}
          </p>
        </div>
        <div className="menu-dashboard__stat-chip">
          <p className="menu-dashboard__stat-chip-label">Rank</p>
          <p className="menu-dashboard__stat-chip-value truncate">{rankLabel}</p>
        </div>
      </div>
    </button>
  );
}
