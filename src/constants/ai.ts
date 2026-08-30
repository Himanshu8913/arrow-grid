import type { SelectionOption } from "@/ui/selection-picker";

/** AI thinking delay before playing a move. */
export const AI_THINK_MS = {
  easy: 450,
  medium: 750,
  hard: 1100,
  expert: 1400,
} as const;

export type AiDifficulty = keyof typeof AI_THINK_MS;

export const AI_DIFFICULTY_SELECTION_OPTIONS: SelectionOption[] = [
  {
    value: "easy",
    label: "Easy",
    description: "Relaxed opponent — great for learning routes and timing.",
    badge: "Beginner",
    badgeVariant: "success",
  },
  {
    value: "medium",
    label: "Medium",
    description: "Balanced challenge for regular practice matches.",
    badge: "Standard",
    badgeVariant: "primary",
  },
  {
    value: "hard",
    label: "Hard",
    description: "Stronger reads, tighter defense, and fewer mistakes.",
    badge: "Skilled",
    badgeVariant: "warning",
  },
  {
    value: "expert",
    label: "Expert",
    description: "Maximum pressure with the longest think time.",
    badge: "Elite",
    badgeVariant: "danger",
  },
];

export const AI_DIFFICULTY_OPTIONS: Array<{
  value: AiDifficulty;
  label: string;
}> = AI_DIFFICULTY_SELECTION_OPTIONS.map((option) => ({
  value: option.value as AiDifficulty,
  label: option.label,
}));

export function getAiDifficultyOption(value: AiDifficulty): SelectionOption {
  return (
    AI_DIFFICULTY_SELECTION_OPTIONS.find((option) => option.value === value) ??
    AI_DIFFICULTY_SELECTION_OPTIONS[1]
  );
}
