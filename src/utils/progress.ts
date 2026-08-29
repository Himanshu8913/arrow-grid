/**
 * Clamps a numeric value to an inclusive `[min, max]` range.
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Converts a current value and maximum into a 0–100 percentage.
 */
export function getProgressPercentage(value: number, max: number): number {
  if (max <= 0) {
    return 0;
  }

  return clamp((value / max) * 100, 0, 100);
}
