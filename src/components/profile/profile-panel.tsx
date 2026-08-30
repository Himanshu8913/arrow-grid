import { CosmeticsPanel } from "@/components/cosmetics/cosmetics-panel";
import { AchievementsPanel, StatisticsPanel } from "@/components/profile";
import { getCosmeticById } from "@/data/cosmetics";
import { useCosmeticsStore } from "@/state/cosmetics-store";
import { useProfileStore } from "@/state/profile-store";
import { getEquippedFrameClassName } from "@/utils/cosmetic-styles";
import { getPlayerLevel, getXpProgressInLevel } from "@/utils/player-level";
import { Avatar } from "@/ui/avatar";
import { Input } from "@/ui/input";
import { ProgressBar } from "@/ui/progress-bar";

/**
 * Player identity editor shown outside the play screen.
 */
export function ProfilePanel() {
  const playerName = useProfileStore((state) => state.displayName);
  const setPlayerName = useProfileStore((state) => state.setDisplayName);
  const totalXp = useProfileStore((state) => state.totalXp);
  const totalCoins = useProfileStore((state) => state.totalCoins);
  const equippedTitleId = useCosmeticsStore((state) => state.equipped.title);
  const equippedFrameId = useCosmeticsStore((state) => state.equipped.frame);

  const trimmedPlayerName = playerName.trim();
  const displayName = trimmedPlayerName || "Guest Player";
  const playerLevel = getPlayerLevel(totalXp);
  const xpProgress = getXpProgressInLevel(totalXp);
  const playerTitle =
    equippedTitleId === "title-default"
      ? null
      : (getCosmeticById(equippedTitleId)?.name ?? null);
  const frameClassName = getEquippedFrameClassName(equippedFrameId);
  const nameError =
    trimmedPlayerName.length > 0 && trimmedPlayerName.length < 2
      ? "Name must be at least 2 characters"
      : undefined;

  return (
    <div className="space-y-4 text-left">
      <div className="flex items-center gap-3">
        <Avatar
          alt={displayName}
          name={displayName}
          size="lg"
          className={frameClassName}
        />
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-text-primary">{displayName}</p>
          {playerTitle ? (
            <p className="text-xs font-medium text-accent-primary">{playerTitle}</p>
          ) : null}
          <p className="text-sm text-text-muted">
            Level {playerLevel} · {totalCoins} coins
          </p>
        </div>
      </div>

      <Input
        label="Display Name"
        value={playerName}
        onChange={(event) => setPlayerName(event.target.value)}
        placeholder="Enter your name"
        hint="Shown on match results and community puzzles."
        error={nameError}
        maxLength={24}
      />

      <ProgressBar
        value={xpProgress.current}
        max={xpProgress.max}
        label="XP to next level"
        showValue
        size="sm"
      />

      <StatisticsPanel />

      <CosmeticsPanel embedded />

      <AchievementsPanel />
    </div>
  );
}
