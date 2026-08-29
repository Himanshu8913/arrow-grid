/** AI thinking delay before playing a move. */
export const AI_THINK_MS = {
  easy: 450,
  medium: 750,
  hard: 1100,
  expert: 1400,
} as const;

export type AiDifficulty = keyof typeof AI_THINK_MS;

export const AI_DIFFICULTY_OPTIONS: Array<{
  value: AiDifficulty;
  label: string;
}> = [
  { value: "easy", label: "Easy" },
  { value: "medium", label: "Medium" },
  { value: "hard", label: "Hard" },
  { value: "expert", label: "Expert" },
];
