/** Supported versus match lengths (best-of series). */
export type MatchFormat = 1 | 3 | 5;

export const DEFAULT_MATCH_FORMAT: MatchFormat = 3;

export interface MatchFormatOption {
  value: MatchFormat;
  label: string;
  description: string;
  icon: string;
}

export const MATCH_FORMAT_OPTIONS: MatchFormatOption[] = [
  {
    value: 1,
    label: "1 match",
    description: "Single round — first goal wins the match.",
    icon: "1",
  },
  {
    value: 3,
    label: "3 match",
    description: "Best of 3 — first to 2 round wins.",
    icon: "3",
  },
  {
    value: 5,
    label: "5 match",
    description: "Best of 5 — first to 3 round wins.",
    icon: "5",
  },
];

/**
 * Round wins required to take the series (first to N).
 */
export function getWinningScoreForFormat(format: MatchFormat): number {
  return Math.ceil(format / 2);
}

export function getMatchFormatOption(value: MatchFormat): MatchFormatOption {
  return (
    MATCH_FORMAT_OPTIONS.find((option) => option.value === value) ??
    MATCH_FORMAT_OPTIONS[1]
  );
}

export function formatMatchPointsProgress(
  points: number,
  winningScore: number,
): string {
  return `${points} / ${winningScore}`;
}
