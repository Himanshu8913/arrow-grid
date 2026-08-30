import { getPlayerLevel, getXpProgressInLevel } from "@/utils/player-level";

export interface NextLevelPreview {
  level: number;
  label: string;
  description: string;
  progressPercent: number;
}

/**
 * Preview for the next player level milestone on the home screen.
 */
export function getNextLevelPreview(totalXp: number): NextLevelPreview {
  const level = getPlayerLevel(totalXp);
  const { current, max } = getXpProgressInLevel(totalXp);
  const progressPercent = Math.round((current / max) * 100);

  return {
    level: level + 1,
    label: `Level ${level + 1}`,
    description: "Unlock more profile prestige and shop rewards.",
    progressPercent,
  };
}
