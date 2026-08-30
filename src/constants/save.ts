/** Current save schema version for migrations. */
export const SAVE_VERSION = 1;

/** Local storage keys for all persisted player data. */
export const SAVE_KEYS = {
  settings: "arrow-grid-settings",
  statistics: "arrow-grid-statistics",
  achievements: "arrow-grid-achievements",
  progress: "arrow-grid-progress",
  profile: "arrow-grid-profile",
  theme: "arrow-grid-theme",
  dailyChallenge: "arrow-grid-daily-challenge",
  cosmetics: "arrow-grid-cosmetics",
  customPuzzles: "arrow-grid-custom-puzzles",
  seasonal: "arrow-grid-seasonal",
} as const;

export type SaveKey = (typeof SAVE_KEYS)[keyof typeof SAVE_KEYS];
