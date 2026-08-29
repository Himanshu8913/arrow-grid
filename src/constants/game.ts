/** Default board dimensions per GAME_RULES.md. */
export const DEFAULT_BOARD_SIZE = 7;

/** Maximum orb steps per movement phase to prevent infinite loops. */
export const MAX_ORB_PATH_STEPS = 200;

/** Maximum puzzle undo history entries kept in memory. */
export const MAX_UNDO_STACK_DEPTH = 50;

/** Clockwise rotation order for arrow tiles. */
export const DIRECTION_ROTATION_ORDER = [
  "up",
  "right",
  "down",
  "left",
] as const;
