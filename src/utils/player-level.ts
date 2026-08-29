const XP_PER_LEVEL = 100;

/**
 * Player level derived from lifetime XP (level 1 at 0 XP).
 */
export function getPlayerLevel(totalXp: number): number {
  return Math.floor(Math.max(0, totalXp) / XP_PER_LEVEL) + 1;
}

/**
 * XP progress within the current level toward the next one.
 */
export function getXpProgressInLevel(totalXp: number): {
  current: number;
  max: number;
} {
  const safeXp = Math.max(0, totalXp);

  return {
    current: safeXp % XP_PER_LEVEL,
    max: XP_PER_LEVEL,
  };
}
